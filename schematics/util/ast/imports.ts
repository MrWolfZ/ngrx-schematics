import { chain, Rule, Tree } from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/node_modules/typescript';
import { findNodes } from '@schematics/angular/utility/ast-utils';

import {
  applyInsertChanges,
  getFileSource,
  getLastOccurrence,
  insertAfter,
  insertAt,
  insertBefore,
  InsertChange,
} from './util';

import { sortLexicographicallyBy } from '../strings';

function insertSymbolToExistingImport(importsFromFile: ts.Node[], symbolName: string, importOnSingleLine: boolean): InsertChange[] {
  const identifiers: ts.Identifier[] = [];

  for (const i of importsFromFile) {
    // if imports * from fileName, don't add symbolName
    if (findNodes(i, ts.SyntaxKind.AsteriskToken).length > 0) {
      return [];
    }

    for (const n of findNodes(i, ts.SyntaxKind.Identifier)) {
      const identifier = n as ts.Identifier;
      // if already imported, don't add symbolName
      if (identifier.text === symbolName) {
        return [];
      }

      identifiers.push(identifier);
    }
  }

  const sortedAlphabetically = sortLexicographicallyBy(i => i.text, ...identifiers);

  let successorNodeIdx = sortedAlphabetically.findIndex(i => i.text.toLowerCase() > symbolName.toLowerCase());
  successorNodeIdx = successorNodeIdx === -1 ? sortedAlphabetically.length : successorNodeIdx;

  const separator = `${importOnSingleLine ? ' ' : '\n  '}`;

  if (successorNodeIdx === 0) {
    return [insertBefore(sortedAlphabetically[0], `${symbolName},${separator}`)];
  }

  return [insertAfter(sortedAlphabetically[successorNodeIdx - 1], `,${separator}${symbolName}`)];
}

function insertImport(
  source: ts.SourceFile,
  symbolName: string,
  importPath: string,
  importOnSingleLine: boolean,
  separateWithExtraNewline: boolean,
): InsertChange[] {
  const rootNode = source;
  const allImports = findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);

  // get nodes that map to import statements from the file fileName
  const relevantImports = allImports.filter(node => {
    // StringLiteral of the ImportDeclaration is the import file (fileName in this case).
    const importFiles = node.getChildren()
      .filter(child => child.kind === ts.SyntaxKind.StringLiteral)
      .map(n => (n as ts.StringLiteral).text);

    return importFiles.filter(file => file === importPath).length === 1;
  });

  if (relevantImports.length > 0) {
    return insertSymbolToExistingImport(relevantImports, symbolName, importOnSingleLine);
  }

  const insertAtBeginning = allImports.length === 0;
  const separator = insertAtBeginning ? '' : `;\n${separateWithExtraNewline ? '\n' : ''}`;
  const symbol = importOnSingleLine ? ` ${symbolName} ` : `\n  ${symbolName},\n`;
  const content = `${separator}import {${symbol}} from '${importPath}'${insertAtBeginning ? ';\n\n' : ''}`;

  if (insertAtBeginning) {
    return [insertAt(0, content)];
  }

  const lastImport = getLastOccurrence(allImports);
  const lastStringLiteralInLastImport = getLastOccurrence(findNodes(lastImport, ts.SyntaxKind.StringLiteral));
  return [insertAfter(lastStringLiteralInLastImport, content)];
}

export function addImport(
  filePath: string,
  importPath: string,
  symbolName: string,
  importOnSingleLine = true,
  separateWithExtraNewline = false,
): Rule {
  return (host: Tree) => {
    const source = getFileSource(host, filePath);
    const importChange = insertImport(source, symbolName.replace(/\..*$/, ''), importPath, importOnSingleLine, separateWithExtraNewline);
    return applyInsertChanges(host, filePath, importChange);
  };
}

export function addImports(
  modulePath: string,
  importPath: string,
  symbolNames: string[],
  importOnSingleLine = true,
  separateWithExtraNewline = false,
): Rule {
  return chain(symbolNames.map(t => addImport(modulePath, importPath, t, importOnSingleLine, separateWithExtraNewline)));
}
