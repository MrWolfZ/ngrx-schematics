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
  addPropertyToExportObjectLiteral,
  addPropertyToInterface,
  applyInsertChanges,
  getFileSource,
  getLastOccurrence,
  getPageImportPath,
  insertAfter,
  modifyFunction,
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

function getImportPath(name: string) {
  return `./${name}`;
}

function getParentNameFromPath(parentDirPath: string) {
  const parentDirPathParts = parentDirPath.split('/');
  return parentDirPathParts[parentDirPathParts.length - 1].replace(/-page$/, '');
}

function insertInParentState(parentDirPath: string, name: string): Rule {
  const parentName = getParentNameFromPath(parentDirPath);
  const stateFilePath = `${parentDirPath}/${parentName}.state.ts`;
  const parentDtoInterfaceNames = [
    `${strings.classify(parentName)}PageDto`,
    `${strings.classify(parentName)}Dto`,
  ];

  const parentStateInterfaceNames = [
    `${strings.classify(parentName)}PageState`,
    `${strings.classify(parentName)}State`,
  ];

  const parentInitialStateConstantNames = [
    `INITIAL_${strings.underscore(parentName).toUpperCase()}_PAGE_STATE`,
    `INITIAL_${strings.underscore(parentName).toUpperCase()}_STATE`,
  ];

  const dto = `${strings.classify(name)}Dto`;
  const state = `${strings.classify(name)}State`;

  return chain([
    addPropertyToInterface(stateFilePath, n => parentDtoInterfaceNames.includes(n), strings.camelize(name), dto),
    addPropertyToInterface(stateFilePath, n => parentStateInterfaceNames.includes(n), strings.camelize(name), state),
    addPropertyToExportObjectLiteral(stateFilePath, n => parentInitialStateConstantNames.includes(n), strings.camelize(name), 'undefined!'),
    addImports(stateFilePath, getImportPath(name), [
      dto,
      state,
    ], true, true),
  ]);
}

function insertInParentReducer(parentDirPath: string, name: string): Rule {
  const parentName = getParentNameFromPath(parentDirPath);
  const reducerFilePath = `${parentDirPath}/${parentName}.reducer.ts`;

  const parentReducerNames = [
    `${strings.camelize(parentName)}PageReducer`,
    `${strings.camelize(parentName)}Reducer`,
  ];

  const reducer = `${strings.camelize(name)}Reducer`;

  return chain([
    modifyFunction(reducerFilePath, n => parentReducerNames.includes(n), () => []),
    addImports(reducerFilePath, 'app/platform', ['callNestedReducers'], true, true),
    addImports(reducerFilePath, getImportPath(name), [reducer], true, true),
  ]);
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
      insertInParentState(parentDirPath, options.name),
      insertInParentReducer(parentDirPath, options.name),
      false ? mergeWith(templateSource) : noop(),
    ])(host, context);
  };
}
