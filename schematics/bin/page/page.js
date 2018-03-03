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
        if (routesArray.elements.some(node => node.getText().includes(`component: ${`${core_1.strings.classify(name)}Page`}`))) {
            return host;
        }
        let content = `{
    path: '${core_1.strings.dasherize(name)}',
    component: ${`${core_1.strings.classify(name)}Page`},
    canActivate: [${`${core_1.strings.classify(name)}PageInitializationGuard`}],
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
function page(options) {
    const sourceDir = 'src/app';
    const modulePath = `${sourceDir}/${options.module}/${options.module}.module.ts`;
    const routingPath = `${sourceDir}/${options.module}/${options.module}.routing.ts`;
    return (host, context) => {
        const templateSource = schematics_1.apply(schematics_1.url('../../page/files'), [
            schematics_1.template(Object.assign({}, core_1.strings, { toUpperCase: (s) => s.toUpperCase() }, options)),
            schematics_1.move(sourceDir),
        ]);
        const page = `${core_1.strings.classify(options.name)}Page`;
        const guard = `${core_1.strings.classify(options.name)}PageInitializationGuard`;
        const featureStateNameConstant = `${core_1.strings.underscore(options.name).toUpperCase()}_PAGE_STATE_FEATURE_NAME`;
        const reducer = `${core_1.strings.camelize(options.name)}PageReducer`;
        const effects = `${core_1.strings.classify(options.name)}PageEffects`;
        const featureStateImport = `StoreModule.forFeature(${featureStateNameConstant}, ${reducer})`;
        return schematics_1.chain([
            util_1.addDeclarationsToModule(modulePath, [page]),
            util_1.addProvidersToModule(modulePath, [guard]),
            util_1.addImportsToModule(modulePath, [featureStateImport]),
            insertEffect(modulePath, effects),
            util_1.addImports(modulePath, util_1.getPageImportPath(options.name), [
                page,
                guard,
                featureStateNameConstant,
                reducer,
                effects,
            ], false, true),
            insertRoute(routingPath, options.name),
            util_1.addImports(routingPath, util_1.getPageImportPath(options.name), [
                page,
                guard,
            ], true, true),
            schematics_1.mergeWith(templateSource),
        ])(host, context);
    };
}
exports.page = page;
//# sourceMappingURL=page.js.map