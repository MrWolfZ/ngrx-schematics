import { normalize, strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/node_modules/typescript';
import { findNodes } from '@schematics/angular/utility/ast-utils';

import {
  addDeclarationsToModule,
  addImports,
  applyInsertChanges,
  getFileSource,
  getLastOccurrence,
  getPageImportPath,
  insertAfter,
} from '../util';

interface Options {
  path: string;
  name: string;
  inlineStyle: boolean;
  inlineTemplate: boolean;
  prefix?: string;
  styleext: string;
}

function insertParentExport(parentDirPath: string, name: string): Rule {
  return (host) => {
    const indexPath = `${parentDirPath}/index.ts`;
    const source = getFileSource(host, indexPath);
    const exportText = `\nexport * from './${strings.dasherize(name)}';`;

    if (source.getText().includes(exportText)) {
      return host;
    }

    const lastExport = getLastOccurrence(findNodes(source, ts.SyntaxKind.ExportDeclaration));

    return applyInsertChanges(host, indexPath, [insertAfter(lastExport, exportText)]);
  };
}

function buildSelector(options: Options) {
  const selector = strings.dasherize(options.name);
  return options.prefix ? `${options.prefix}-${selector}` : selector;
}

export function component(options: Options): Rule {
  const sourceDir = 'src/app';
  const selector = buildSelector(options);
  options.path = normalize(options.path);
  const pathParts = options.path.split('/');
  const moduleName = pathParts[0];
  const pageName = pathParts[1];
  const modulePath = `${sourceDir}/${moduleName}/${moduleName}.module.ts`;
  const parentDirPath = `${sourceDir}/${options.path}`;

  return (host: Tree, context: SchematicContext) => {
    const templateSource = apply(url('../../component/files'), [
      options.inlineStyle ? filter(path => !path.endsWith('.__styleext__')) : noop(),
      options.inlineTemplate ? filter(path => !path.endsWith('.html')) : noop(),
      template({
        ...strings,
        toUpperCase: (s: string) => s.toUpperCase(),
        ...options,
        selector,
      }),
      move(sourceDir),
    ]);

    const component = `${strings.classify(options.name)}Component`;

    return chain([
      addDeclarationsToModule(modulePath, [component]),
      addImports(modulePath, getPageImportPath(pageName), [component], false, true),
      insertParentExport(parentDirPath, options.name),
      mergeWith(templateSource),
    ])(host, context);
  };
}
