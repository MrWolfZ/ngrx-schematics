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
  getLastOccurrence,
  getNodeNameAsString,
  insertAt,
  insertBetweenBrackets,
  InsertChange,
  makeWhitespace,
} from './util';

function addPropertyToNonEmptyInterface(node: ts.InterfaceDeclaration, content: string, interfaceIndentation: number): InsertChange[] {
  const lastElement = getLastOccurrence(node.members);
  const position = lastElement.getEnd();

  return [insertAt(position, `\n${makeWhitespace(interfaceIndentation + 2)}${content};`)];
}

export function addPropertyToInterface(
  filePath: string,
  interfaceNameFilter: (name: string) => boolean,
  propertyName: string,
  propertyType: string,
): Rule {
  return (host: Tree) => {
    const source = getFileSource(host, filePath);

    const interfaceNode = findNodes(source, ts.SyntaxKind.InterfaceDeclaration)
      .map(n => n as ts.InterfaceDeclaration)
      .find(n => interfaceNameFilter(n.name.getText()));

    if (!interfaceNode) {
      throw new SchematicsException(`could not find interface that matches the filter in file ${filePath}`);
    }

    const properties = findNodes(interfaceNode, ts.SyntaxKind.PropertySignature)
      .map(n => n as ts.PropertySignature);

    // check if already present
    if (properties.some(prop => getNodeNameAsString(prop.name) === propertyName)) {
      return host;
    }

    const content = `${propertyName}: ${propertyType}`;

    if (properties.length === 0) {
      return applyInsertChanges(host, filePath, [insertBetweenBrackets(interfaceNode.getText(), interfaceNode.getStart() + 1, `${content};`, 0)]);
    }

    return applyInsertChanges(host, filePath, addPropertyToNonEmptyInterface(interfaceNode, content, 0));
  };
}
