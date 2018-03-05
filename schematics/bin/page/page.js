"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("@schematics/angular/node_modules/typescript");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const util_1 = require("../util");
function insertEffect(modulePath, effectsName) {
    return (host, context) => {
        const source = util_1.getFileSource(host, modulePath);
        const assignment = util_1.getDecoratorPropertyAssignmentNode(source, 'imports');
        if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
            throw new schematics_1.SchematicsException('module imports must be an array');
        }
        const arrLiteral = assignment.initializer;
        const effectsNode = arrLiteral.elements.find(node => node.getText().includes('EffectsModule'));
        if (!effectsNode) {
            return util_1.addImportsToModule(modulePath, [
                `EffectsModule.forFeature([\n      ${effectsName},\n    ])`,
            ])(host, context);
        }
        const effectsArray = ast_utils_1.findNodes(effectsNode, ts.SyntaxKind.ArrayLiteralExpression)[0];
        return util_1.applyInsertChanges(host, modulePath, util_1.insertLastInArray(effectsArray, effectsName, 4));
    };
}
function insertRoute(routingPath, name) {
    return (host) => {
        const source = util_1.getFileSource(host, routingPath);
        const routesArray = ast_utils_1.findNodes(source, ts.SyntaxKind.ArrayLiteralExpression, 1)[0];
        if (routesArray.elements.some(node => node.getText().includes(`component: ${util_1.pageNames.component(name)}`))) {
            return host;
        }
        let content = `{
    path: '${util_1.pageNames.route(name)}',
    component: ${util_1.pageNames.component(name)},
    canActivate: [${util_1.pageNames.guard(name)}],
  }`;
        if (routesArray.elements.length === 0) {
            content = `{
    path: '',
    redirectTo: '${util_1.pageNames.route(name)}',
    pathMatch: 'full',
  },\n  ${content}`;
        }
        return util_1.applyInsertChanges(host, routingPath, util_1.insertLastInArray(routesArray, content, 0));
    };
}
function page(options) {
    const sourceDir = 'src/app';
    const modulePath = `${sourceDir}/${util_1.moduleNames.dir(options.module)}/${util_1.moduleNames.moduleFile(options.module)}`;
    const routingPath = `${sourceDir}/${util_1.moduleNames.dir(options.module)}/${util_1.moduleNames.routingFile(options.module)}`;
    return (host, context) => {
        const templateSource = schematics_1.apply(schematics_1.url('../../page/files'), [
            schematics_1.template(Object.assign({}, core_1.strings, options, util_1.pageNames, { moduleDir: util_1.moduleNames.dir, sortLexicographically: util_1.sortLexicographically })),
            schematics_1.move(sourceDir),
        ]);
        const page = util_1.pageNames.component(options.name);
        const guard = util_1.pageNames.guard(options.name);
        const featureStateNameConstant = util_1.pageNames.featureStateNameConstant(options.name);
        const reducer = util_1.pageNames.reducer(options.name);
        const effects = util_1.pageNames.effects(options.name);
        const featureStateImport = `StoreModule.forFeature(${featureStateNameConstant}, ${reducer})`;
        return schematics_1.chain([
            util_1.addDeclarationsToModule(modulePath, [page]),
            util_1.addProvidersToModule(modulePath, [guard]),
            util_1.addImportsToModule(modulePath, [featureStateImport]),
            insertEffect(modulePath, effects),
            util_1.addImports(modulePath, `./${util_1.pageNames.dir(options.name)}`, [
                page,
                guard,
                featureStateNameConstant,
                reducer,
                effects,
            ], false, true),
            insertRoute(routingPath, options.name),
            util_1.addImports(routingPath, `./${util_1.pageNames.dir(options.name)}`, [
                page,
                guard,
            ], true, true),
            schematics_1.mergeWith(templateSource),
        ])(host, context);
    };
}
exports.page = page;
//# sourceMappingURL=page.js.map