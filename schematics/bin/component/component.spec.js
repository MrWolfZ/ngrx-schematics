"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const testing_1 = require("@angular-devkit/schematics/testing");
const path = require("path");
const component_1 = require("./component");
const collectionPath = path.join(__dirname, '../collection.json');
describe(component_1.component.name, () => {
    it('works', () => {
        const runner = new testing_1.SchematicTestRunner('schematics', collectionPath);
        const tree = runner.runSchematic(component_1.component.name, {}, schematics_1.Tree.empty());
        expect(tree.files).toEqual([]);
    });
});
//# sourceMappingURL=component.spec.js.map