import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/node_modules/typescript';
import { findNodes } from '@schematics/angular/utility/ast-utils';

import {
  applyInsertChanges,
  getFileSource,
  insertLastInArray,
  moduleNames as names,
} from '../util';

interface Options {
  name: string;
}

function insertRoute(routingPath: string, name: string): Rule {
  return (host) => {
    const source = getFileSource(host, routingPath);

    const routesArray = findNodes(source, ts.SyntaxKind.ArrayLiteralExpression, 1)[0] as ts.ArrayLiteralExpression;

    if (routesArray.elements.some(node => node.getText().includes(`#${names.moduleClass(name)}`))) {
      return host;
    }

    let content = `{
    path: '${names.route(name)}',
    loadChildren: 'app/${names.dir(name)}/${names.moduleFileNoExt(name)}#${names.moduleClass(name)}',
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

export function module(options: Options): Rule {
  const sourceDir = 'src/app';
  const routingPath = `${sourceDir}/app.routing.ts`;

  return (host: Tree, context: SchematicContext) => {
    const templateSource = apply(url('../../module/files'), [
      template({
        ...strings,
        ...options,
        ...names,
      }),
      move(sourceDir),
    ]);

    return chain([
      insertRoute(routingPath, options.name),
      mergeWith(templateSource),
    ])(host, context);
  };
}
