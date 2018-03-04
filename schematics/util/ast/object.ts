import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/node_modules/typescript';
import { findNodes } from '@schematics/angular/utility/ast-utils';
import { applyInsertChanges, getFileSource, getLastOccurrence, getNodeNameAsString, insertAt, insertInEmptyArrayOrObject, makeWhitespace } from './util';

export function getPropertyAssignments(objectNode: ts.ObjectLiteralExpression, propertyName?: string) {
  return objectNode.properties
    .filter(prop => prop.kind === ts.SyntaxKind.PropertyAssignment)
    .map(prop => prop as ts.PropertyAssignment)
    .filter(prop => {
      if (propertyName === undefined) {
        return true;
      }

      return getNodeNameAsString(prop.name) === propertyName;
    });
}

export function getSpreadAssignments(objectNode: ts.ObjectLiteralExpression) {
  return objectNode.properties
    .filter(prop => prop.kind === ts.SyntaxKind.SpreadAssignment)
    .map(prop => prop as ts.SpreadAssignment);
}

export function getPropertyAssignment(objectNode: ts.ObjectLiteralExpression, propertyName: string) {
  // Get all the children property assignment of object literals.
  const matchingProperties = getPropertyAssignments(objectNode, propertyName);

  if (matchingProperties.length !== 1) {
    throw new SchematicsException(`Found more than one property assignment for '${propertyName}'`);
  }

  return matchingProperties[0];
}

export function insertLastInObject(objectNode: ts.ObjectLiteralExpression, propertyName: string, value: string, objectIndentation: number) {
  // check if already present
  if (getPropertyAssignments(objectNode, propertyName).length > 0) {
    return [];
  }

  const content = `${propertyName}: ${value}`;

  const propertyAssignments = getPropertyAssignments(objectNode);
  const spreadAssignments = getSpreadAssignments(objectNode);
  const assignments = [
    ...propertyAssignments,
    ...spreadAssignments,
  ];

  if (assignments.length === 0) {
    return [insertInEmptyArrayOrObject(objectNode, `${content},`, objectIndentation)];
  }

  const lastElement = getLastOccurrence(assignments);
  const position = lastElement.getEnd();

  return [insertAt(position, `,\n${makeWhitespace(objectIndentation + 2)}${content}`)];
}

export function addPropertyToExportObjectLiteral(
  filePath: string,
  exportNameFilter: (name: string) => boolean,
  propertyName: string,
  propertyType: string,
): Rule {
  return (host: Tree) => {
    const source = getFileSource(host, filePath);

    const exportNode = findNodes(source, ts.SyntaxKind.VariableDeclaration)
      .map(n => n as ts.VariableDeclaration)
      .filter(n => !!getNodeNameAsString(n.name))
      .find(n => exportNameFilter(getNodeNameAsString(n.name)!));

    if (!exportNode) {
      throw new SchematicsException(`could not find export that matches the filter in file ${filePath}`);
    }

    const literal = findNodes(exportNode, ts.SyntaxKind.ObjectLiteralExpression, 1)[0] as ts.ObjectLiteralExpression;
    return applyInsertChanges(host, filePath, insertLastInObject(literal, propertyName, propertyType, 0));
  };
}
