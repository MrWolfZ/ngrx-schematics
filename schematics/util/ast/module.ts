import {
  chain,
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/node_modules/typescript';
import { getDecoratorMetadata } from '@schematics/angular/utility/ast-utils';

import { insertLastInArray } from './array';
import { getPropertyAssignment } from './object';
import { applyInsertChanges, getFileSource, InsertChange } from './util';

export function getDecoratorPropertyAssignmentNode(
  source: ts.SourceFile,
  metadataField: string,
) {
  const nodes = getDecoratorMetadata(source, 'NgModule', '@angular/core');
  const decoratorMetadataNode = nodes[0];

  if (!decoratorMetadataNode) {
    throw new SchematicsException('Could not find NgModule decorator metadata');
  }

  return getPropertyAssignment(decoratorMetadataNode as ts.ObjectLiteralExpression, metadataField);
}

export function addSymbolToNgModuleMetadata(
  source: ts.SourceFile,
  metadataField: string,
  symbolName: string,
): InsertChange[] {
  const assignment = getDecoratorPropertyAssignmentNode(source, metadataField);

  if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
    throw new SchematicsException('Can only add symbols to arrays');
  }

  const arrLiteral = assignment.initializer as ts.ArrayLiteralExpression;
  return insertLastInArray(arrLiteral, symbolName, 2);
}

export function addSymbolToNgModule(modulePath: string, metadataField: string, symbolName: string): Rule {
  return (host: Tree) => {
    const source = getFileSource(host, modulePath);

    const declarationChanges = addSymbolToNgModuleMetadata(
      source,
      metadataField,
      symbolName,
    );

    return applyInsertChanges(host, modulePath, declarationChanges);
  };
}

export function addSymbolsToNgModule(modulePath: string, metadataField: string, symbolNames: string[]): Rule {
  return chain(symbolNames.map(t => addSymbolToNgModule(modulePath, metadataField, t)));
}

export function addDeclarationsToModule(modulePath: string, symbolNames: string[]): Rule {
  return addSymbolsToNgModule(modulePath, 'declarations', symbolNames);
}

export function addImportsToModule(modulePath: string, symbolNames: string[]): Rule {
  return addSymbolsToNgModule(modulePath, 'imports', symbolNames);
}

export function addProvidersToModule(modulePath: string, symbolNames: string[]): Rule {
  return addSymbolsToNgModule(modulePath, 'providers', symbolNames);
}
