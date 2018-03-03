import { SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/node_modules/typescript';

export interface InsertChange {
  position: number;
  content: string;
}

export function getFileSource(host: Tree, filePath: string) {
  const text = host.read(filePath);
  if (text === null) {
    throw new SchematicsException(`File ${filePath} does not exist.`);
  }

  const sourceText = text.toString('utf-8');
  return ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
}

export function applyInsertChanges(host: Tree, filePath: string, changes: InsertChange[]) {
  const recorder = changes.reduce((r, c) => r.insertLeft(c.position, c.content), host.beginUpdate(filePath));
  host.commitUpdate(recorder);
  return host;
}

export function insertAt(
  position: number,
  content: string,
): InsertChange {
  return {
    position,
    content,
  };
}

export function insertAfter(
  node: ts.Node,
  content: string,
): InsertChange {
  return {
    position: node.getEnd(),
    content,
  };
}

export function insertBefore(
  node: ts.Node,
  content: string,
): InsertChange {
  return {
    position: node.getStart(),
    content,
  };
}

function nodesByPosition(first: ts.Node, second: ts.Node): number {
  return first.getStart() - second.getStart();
}

export function getLastOccurrence(nodes: ts.Node[]) {
  if (nodes.length === 0) {
    throw new Error('must have at least one node to get last occurrence');
  }

  return [...nodes].sort(nodesByPosition).pop()!;
}

export function makeWhitespace(amount: number) {
  return new Array(amount).fill(' ').join('');
}

export function insertLastInArray(arrayNode: ts.ArrayLiteralExpression, content: string, arrayIndentation: number) {
  // check if already present
  const symbolsArray = arrayNode.elements.map(node => node.getText());
  if (symbolsArray.includes(content)) {
    return [];
  }

  if (arrayNode.elements.length === 0) {
    const position = arrayNode.getStart() + 1;

    // we assume the empty array literal to be `[]` without any white space
    return [insertAt(position, `\n${makeWhitespace(arrayIndentation + 2)}${content},\n${makeWhitespace(arrayIndentation)}`)];
  }

  const lastElement = arrayNode.elements[arrayNode.elements.length - 1];
  const position = lastElement.getEnd();

  return [insertAt(position, `,\n${makeWhitespace(arrayIndentation + 2)}${content}`)];
}
