import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  SchematicsException,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/node_modules/typescript';
import { findNodes } from '@schematics/angular/utility/ast-utils';

import {
  addDeclarationsToModule,
  addImports,
  addImportsToModule,
  addProvidersToModule,
  applyInsertChanges,
  getDecoratorPropertyAssignmentNode,
  getFileSource,
  insertLastInArray,
  moduleNames,
  pageNames as names,
  pageNames,
} from '../util';

interface Options {
  name: string;
  module: string;
  styleext: string;
}

function insertEffect(modulePath: string, effectsName: string): Rule {
  return (host, context) => {
    const source = getFileSource(host, modulePath);

    const assignment = getDecoratorPropertyAssignmentNode(source, 'imports');

    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
      throw new SchematicsException('module imports must be an array');
    }

    const arrLiteral = assignment.initializer as ts.ArrayLiteralExpression;

    const effectsNode = arrLiteral.elements.find(node => node.getText().includes('EffectsModule'));

    if (!effectsNode) {
      return addImportsToModule(modulePath, [
        `EffectsModule.forFeature([\n      ${effectsName},\n    ])`,
      ])(host, context);
    }

    const effectsArray = findNodes(effectsNode, ts.SyntaxKind.ArrayLiteralExpression)[0] as ts.ArrayLiteralExpression;
    return applyInsertChanges(host, modulePath, insertLastInArray(effectsArray, effectsName, 4));
  };
}

function insertRoute(routingPath: string, name: string): Rule {
  return (host) => {
    const source = getFileSource(host, routingPath);

    const routesArray = findNodes(source, ts.SyntaxKind.ArrayLiteralExpression, 1)[0] as ts.ArrayLiteralExpression;

    if (routesArray.elements.some(node => node.getText().includes(`component: ${names.component(name)}`))) {
      return host;
    }

    let content = `{
    path: '${names.route(name)}',
    component: ${names.component(name)},
    canActivate: [${names.guard(name)}],
  }`;

    if (routesArray.elements.length === 0) {
      content = `{
    path: '',
    redirectTo: '${names.route(name)}',
    pathMatch: 'full',
  },\n  ${content}`;
    }

    return applyInsertChanges(host, routingPath, insertLastInArray(routesArray, content, 0));
  };
}

export function page(options: Options): Rule {
  const sourceDir = 'src/app';
  const modulePath = `${sourceDir}/${moduleNames.dir(options.module)}/${moduleNames.moduleFile(options.module)}`;
  const routingPath = `${sourceDir}/${moduleNames.dir(options.module)}/${moduleNames.routingFile(options.module)}`;

  return (host: Tree, context: SchematicContext) => {
    const templateSource = apply(url('../../page/files'), [
      template({
        ...strings,
        ...options,
        ...names,
        moduleDir: moduleNames.dir,
      }),
      move(sourceDir),
    ]);

    const page = names.component(options.name);
    const guard = names.guard(options.name);
    const featureStateNameConstant = names.featureStateNameConstant(options.name);
    const reducer = names.reducer(options.name);
    const effects = names.effects(options.name);
    const featureStateImport = `StoreModule.forFeature(${featureStateNameConstant}, ${reducer})`;

    return chain([
      addDeclarationsToModule(modulePath, [page]),
      addProvidersToModule(modulePath, [guard]),
      addImportsToModule(modulePath, [featureStateImport]),
      insertEffect(modulePath, effects),
      addImports(modulePath, `./${pageNames.dir(options.name)}`, [
        page,
        guard,
        featureStateNameConstant,
        reducer,
        effects,
      ], false, true),
      insertRoute(routingPath, options.name),
      addImports(routingPath, `./${pageNames.dir(options.name)}`, [
        page,
        guard,
      ], true, true),
      mergeWith(templateSource),
    ])(host, context);
  };
}
