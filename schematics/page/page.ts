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
  getPageImportPath,
  insertLastInArray,
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

    if (routesArray.elements.some(node => node.getText().includes(`component: ${`${strings.classify(name)}Page`}`))) {
      return host;
    }

    let content = `{
    path: '${strings.dasherize(name)}',
    component: ${`${strings.classify(name)}Page`},
    canActivate: [${`${strings.classify(name)}PageInitializationGuard`}],
  }`;

    if (routesArray.elements.length === 0) {
      content = `{
    path: '',
    redirectTo: '${strings.dasherize(name)}',
    pathMatch: 'full',
  },\n  ${content}`;
    }

    return applyInsertChanges(host, routingPath, insertLastInArray(routesArray, content, 0));
  };
}

export function page(options: Options): Rule {
  const sourceDir = 'src/app';
  const modulePath = `${sourceDir}/${options.module}/${options.module}.module.ts`;
  const routingPath = `${sourceDir}/${options.module}/${options.module}.routing.ts`;

  return (host: Tree, context: SchematicContext) => {
    const templateSource = apply(url('../../page/files'), [
      template({
        ...strings,
        toUpperCase: (s: string) => s.toUpperCase(),
        ...options,
      }),
      move(sourceDir),
    ]);

    const page = `${strings.classify(options.name)}Page`;
    const guard = `${strings.classify(options.name)}PageInitializationGuard`;
    const featureStateNameConstant = `${strings.underscore(options.name).toUpperCase()}_PAGE_STATE_FEATURE_NAME`;
    const reducer = `${strings.camelize(options.name)}PageReducer`;
    const effects = `${strings.classify(options.name)}PageEffects`;
    const featureStateImport = `StoreModule.forFeature(${featureStateNameConstant}, ${reducer})`;

    return chain([
      addDeclarationsToModule(modulePath, [page]),
      addProvidersToModule(modulePath, [guard]),
      addImportsToModule(modulePath, [featureStateImport]),
      insertEffect(modulePath, effects),
      addImports(modulePath, getPageImportPath(options.name), [
        page,
        guard,
        featureStateNameConstant,
        reducer,
        effects,
      ], false, true),
      insertRoute(routingPath, options.name),
      addImports(routingPath, getPageImportPath(options.name), [
        page,
        guard,
      ], true, true),
      mergeWith(templateSource),
    ])(host, context);
  };
}
