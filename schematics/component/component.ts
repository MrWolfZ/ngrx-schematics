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
  componentNames as names,
  getFileSource,
  getLastOccurrence,
  getPageOrComponentName,
  insertAfter,
  isPagePath,
  modifyFunction,
  moduleNames,
  pageNames,
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
    const exportText = `\nexport * from './${names.dir(name)}';`;

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
  return getPageOrComponentName(parentDirPathParts[parentDirPathParts.length - 1]);
}

function insertInParentState(parentDirPath: string, name: string): Rule {
  const isPage = isPagePath(parentDirPath);
  const parentName = getParentNameFromPath(parentDirPath);
  const stateFilePath = `${parentDirPath}/${isPage ? pageNames.stateFile(parentName) : names.stateFile(parentName)}`;
  const parentDtoInterfaceNames = [
    pageNames.dto(parentName),
    names.dto(parentName),
  ];

  const parentStateInterfaceNames = [
    pageNames.state(parentName),
    names.state(parentName),
  ];

  const parentInitialStateConstantNames = [
    pageNames.initialStateConstant(parentName),
    names.initialStateConstant(parentName),
  ];

  const dto = names.dto(name);
  const state = names.state(name);

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
  const isPage = isPagePath(parentDirPath);
  const parentName = getParentNameFromPath(parentDirPath);
  const reducerFilePath = `${parentDirPath}/${isPage ? pageNames.reducerFile(parentName) : names.reducerFile(parentName)}`;

  const parentReducerNames = [
    pageNames.reducer(parentName),
    names.reducer(parentName),
  ];

  const reducer = names.reducer(name);

  return chain([
    modifyFunction(reducerFilePath, n => parentReducerNames.includes(n), () => []),
    addImports(reducerFilePath, 'app/platform', ['callNestedReducers'], true, true),
    addImports(reducerFilePath, getImportPath(name), [reducer], true, true),
  ]);
}

export function component(options: Options): Rule {
  const sourceDir = 'src/app';
  const selector = names.selector(options.name, options.prefix);
  options.path = normalize(options.path);
  const pathParts = options.path.split('/');
  const moduleName = moduleNames.dirToName(pathParts[0]);
  const pageName = pageNames.dirToName(pathParts[1]);
  const modulePath = `${sourceDir}/${moduleNames.dir(moduleName)}/${moduleNames.moduleFile(moduleName)}`;
  const parentDirPath = `${sourceDir}/${options.path}`;

  return (host: Tree, context: SchematicContext) => {
    const templateSource = apply(url('../../component/files'), [
      options.inlineStyle ? filter(path => !path.endsWith('.__styleext__')) : noop(),
      options.inlineTemplate ? filter(path => !path.endsWith('.html')) : noop(),
      template({
        ...strings,
        ...options,
        selector,
        ...names,
      }),
      move(sourceDir),
    ]);

    const component = names.component(options.name);

    return chain([
      addDeclarationsToModule(modulePath, [component]),
      addImports(modulePath, `./${pageNames.dir(pageName)}`, [component], false, true),
      insertParentExport(parentDirPath, options.name),
      insertInParentState(parentDirPath, options.name),
      insertInParentReducer(parentDirPath, options.name),
      mergeWith(templateSource),
    ])(host, context);
  };
}
