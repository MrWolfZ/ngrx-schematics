import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

import { component } from './component';

const collectionPath = path.join(__dirname, '../collection.json');

describe(component.name, () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = runner.runSchematic(component.name, {}, Tree.empty());

    expect(tree.files).toEqual([]);
  });
});
