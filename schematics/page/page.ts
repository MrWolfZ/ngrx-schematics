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
  module: string;
  styleext: string;
}

export function page(options: Options): Rule {
  const sourceDir = 'src/app';

  return (host: Tree, context: SchematicContext) => {
    const templateSource = apply(url('../../page/files'), [
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
