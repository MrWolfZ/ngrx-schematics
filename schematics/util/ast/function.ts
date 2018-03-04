import {
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/node_modules/typescript';
import { findNodes } from '@schematics/angular/utility/ast-utils';

import {
  applyInsertChanges,
  getFileSource,
  getNodeNameAsString,
  InsertChange,
} from './util';

export function modifyFunction(
  filePath: string,
  functionNameFilter: (name: string) => boolean,
  modificator: (node: ts.FunctionDeclaration) => InsertChange[],
): Rule {
  return (host: Tree) => {
    const source = getFileSource(host, filePath);

    const functionNode = findNodes(source, ts.SyntaxKind.FunctionDeclaration)
      .map(n => n as ts.FunctionDeclaration)
      .find(n => !!n.name && functionNameFilter(n.name.getText()));

    if (!functionNode) {
      throw new SchematicsException(`could not find interface that matches the filter in file ${filePath}`);
    }

    return applyInsertChanges(host, filePath, modificator(functionNode));
  };
}

export function getFunctionCall(node: ts.Node, functionName: string) {
  const functionNode = findNodes(node, ts.SyntaxKind.CallExpression)
    .map(n => n as ts.CallExpression)
    .find(n => getNodeNameAsString(n.expression) === functionName);

  if (!functionNode) {
    throw new SchematicsException(`could not find function call to ${functionName}`);
  }

  return node;
}
