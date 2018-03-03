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
  SchematicsException,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/node_modules/typescript';
import { addDeclarationToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';

interface Options {
  path: string;
  name: string;
  inlineStyle: boolean;
  inlineTemplate: boolean;
  prefix?: string;
  styleext: string;
}

function addDeclarationToNgModule(sourceDir: string, path: string, name: string): Rule {
  return (host: Tree) => {
    const pathParts = path.split('/');
    const moduleName = pathParts[0];
    const pageName = pathParts[1];

    const modulePath = `${sourceDir}/${moduleName}/${moduleName}.module.ts`;

    const text = host.read(modulePath);
    if (text === null) {
      throw new SchematicsException(`File ${modulePath} does not exist.`);
    }

    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

    const importPath = `./${pageName}`;
    const classifiedName = strings.classify(`${name}Component`);
    const declarationChanges = addDeclarationToModule(
      source,
      modulePath,
      classifiedName,
      importPath,
    );

    const declarationRecorder = host.beginUpdate(modulePath);
    for (const change of declarationChanges) {
      if (change instanceof InsertChange) {
        declarationRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(declarationRecorder);

    return host;
  };
}

function buildSelector(options: Options) {
  let selector = strings.dasherize(options.name);
  if (options.prefix) {
    selector = `${options.prefix}-${selector}`;
  }

  return selector;
}

export function component(options: Options): Rule {
  const sourceDir = 'src/app';
  const selector = buildSelector(options);
  options.path = normalize(options.path);

  return (host: Tree, context: SchematicContext) => {
    const templateSource = apply(url('../../component/files'), [
      options.inlineStyle ? filter(path => !path.endsWith('.__styleext__')) : noop(),
      options.inlineTemplate ? filter(path => !path.endsWith('.html')) : noop(),
      template({
        ...strings,
        toUpperCase: (s: string) => s.toUpperCase(),
        ...options,
        selector,
      }),
      move(sourceDir),
    ]);

    return chain([
      addDeclarationToNgModule(sourceDir, options.path, options.name),
      mergeWith(templateSource),
    ])(host, context);
  };
}
