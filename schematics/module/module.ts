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

interface Options {
  name: string;
}

export function module(options: Options): Rule {
  const sourceDir = 'src/app';

  return (host: Tree, context: SchematicContext) => {
    const templateSource = apply(url('../../module/files'), [
      template({
        ...strings,
        toUpperCase: (s: string) => s.toUpperCase(),
        ...options,
      }),
      move(sourceDir),
    ]);

    return chain([
      mergeWith(templateSource),
    ])(host, context);
  };
}
