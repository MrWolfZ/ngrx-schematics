"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("@schematics/angular/node_modules/typescript");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const util_1 = require("../util");
function insertRoute(routingPath, name) {
    return (host) => {
        const source = util_1.getFileSource(host, routingPath);
        const routesArray = ast_utils_1.findNodes(source, ts.SyntaxKind.ArrayLiteralExpression, 1)[0];
        if (routesArray.elements.some(node => node.getText().includes(`#${core_1.strings.classify(name)}Module`))) {
            return host;
        }
        let content = `{
    path: '${core_1.strings.dasherize(name)}',
    loadChildren: 'app/${core_1.strings.dasherize(name)}/${core_1.strings.dasherize(name)}.module#${core_1.strings.classify(name)}Module',
  }`;
        if (routesArray.elements.length === 0) {
            content = `{
    path: '',
    redirectTo: '${core_1.strings.dasherize(name)}',
    pathMatch: 'full',
  },\n  ${content}`;
        }
        return util_1.applyInsertChanges(host, routingPath, util_1.insertLastInArray(routesArray, content, 0));
    };
}
function module(options) {
    const sourceDir = 'src/app';
    const routingPath = `${sourceDir}/app.routing.ts`;
    return (host, context) => {
        const templateSource = schematics_1.apply(schematics_1.url('../../module/files'), [
            schematics_1.template(Object.assign({}, core_1.strings, { toUpperCase: (s) => s.toUpperCase() }, options)),
            schematics_1.move(sourceDir),
        ]);
        return schematics_1.chain([
            insertRoute(routingPath, options.name),
            schematics_1.mergeWith(templateSource),
        ])(host, context);
    };
}
exports.module = module;
//# sourceMappingURL=module.js.map