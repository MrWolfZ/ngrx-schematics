import { SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/node_modules/typescript';

export interface InsertChange {
  position: number;
  content: string;
}

export function getFileSource(host: Tree, filePath: string) {
  const text = host.read(filePath);
  if (text === null) {
    throw new SchematicsException(`File ${filePath} does not exist.`);
  }

  const sourceText = text.toString('utf-8');
  return ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
}

export function getNodeNameAsString(prop: ts.Node | undefined) {
  if (!prop) {
    return undefined;
  }

  switch (prop.kind) {
    case ts.SyntaxKind.Identifier:
      return (prop as ts.Identifier).getText();
    case ts.SyntaxKind.StringLiteral:
      return (prop as ts.StringLiteral).text;
    default:
      return undefined;
  }
}

export function applyInsertChanges(host: Tree, filePath: string, changes: InsertChange[]) {
  const recorder = changes.reduce((r, c) => r.insertLeft(c.position, c.content), host.beginUpdate(filePath));
  host.commitUpdate(recorder);
  return host;
}

export function insertAt(
  position: number,
  content: string,
): InsertChange {
  return {
    position,
    content,
  };
}

export function insertAfter(
  node: ts.Node,
  content: string,
): InsertChange {
  return {
    position: node.getEnd(),
    content,
  };
}

export function insertBefore(
  node: ts.Node,
  content: string,
): InsertChange {
  return {
    position: node.getStart(),
    content,
  };
}

function nodesByPosition(first: ts.Node, second: ts.Node): number {
  return first.getStart() - second.getStart();
}

export function getLastOccurrence<T extends ts.Node>(nodes: Iterable<T> & ArrayLike<T>) {
  if (nodes.length === 0) {
    throw new Error('must have at least one node to get last occurrence');
  }

  return [...nodes].sort(nodesByPosition).pop()!;
}

export function makeWhitespace(amount: number) {
  return new Array(amount).fill(' ').join('');
}

export function insertBetweenBrackets(text: string, position: number, content: string, indentation: number) {
  const openingBracketOffset = /(\[|{)/.exec(text)!.index;
  position += openingBracketOffset;
  text = text.substring(openingBracketOffset);

  let toInsert = `\n${makeWhitespace(indentation + 2)}${content}\n${makeWhitespace(indentation)}`;

  if (/^(\[|{)[^\n\r]*(\r?\n)[^\n\r]*(\]|})$/.test(text)) {
    // literal is like `[\n]` or `{\n}`
    toInsert = `\n${makeWhitespace(indentation + 2)}${content}`;
  } else if (/^(\[|{)[^\n\r]*(\r?\n)[^\n\r]*(\r?\n)[^\n\r]*(\]|})$/.test(text)) {
    // literal is like `[\n\n]` or `{\n\n}`
    toInsert = `${makeWhitespace(indentation + 2)}${content}`;

    // if line break contains carriage return we need to increment position by 2, otherwise just 1
    position += /^(\[|{)[^\n\r]*(\r\n)/.test(text) ? 2 : 1;
  }

  return insertAt(position, toInsert);
}

export function insertInEmptyArrayOrObject(node: ts.ObjectLiteralExpression | ts.ArrayLiteralExpression, content: string, indentation: number) {
  const text = node.getText();
  const position = node.getStart() + 1;
  return insertBetweenBrackets(text, position, content, indentation);
}
