import * as ts from '@schematics/angular/node_modules/typescript';
import { insertAt, insertInEmptyArrayOrObject, makeWhitespace } from './util';

export function insertLastInArray(arrayNode: ts.ArrayLiteralExpression, content: string, arrayIndentation: number) {
  // check if already present
  const symbolsArray = arrayNode.elements.map(node => node.getText());
  if (symbolsArray.includes(content)) {
    return [];
  }

  if (arrayNode.elements.length === 0) {
    return [insertInEmptyArrayOrObject(arrayNode, `${content},`, arrayIndentation)];
  }

  const lastElement = arrayNode.elements[arrayNode.elements.length - 1];
  const position = lastElement.getEnd();

  return [insertAt(position, `,\n${makeWhitespace(arrayIndentation + 2)}${content}`)];
}
