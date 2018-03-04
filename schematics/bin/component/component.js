"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("@schematics/angular/node_modules/typescript");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const util_1 = require("../util");
function insertParentExport(parentDirPath, name) {
    return (host) => {
        const indexPath = `${parentDirPath}/index.ts`;
        const source = util_1.getFileSource(host, indexPath);
        const exportText = `\nexport * from './${core_1.strings.dasherize(name)}';`;
        if (source.getText().includes(exportText)) {
            return host;
        }
        const lastExport = util_1.getLastOccurrence(ast_utils_1.findNodes(source, ts.SyntaxKind.ExportDeclaration));
        return util_1.applyInsertChanges(host, indexPath, [util_1.insertAfter(lastExport, exportText)]);
    };
}
function getImportPath(name) {
    return `./${name}`;
}
function getParentNameFromPath(parentDirPath) {
    const parentDirPathParts = parentDirPath.split('/');
    return parentDirPathParts[parentDirPathParts.length - 1].replace(/-page$/, '');
}
function insertInParentState(parentDirPath, name) {
    const parentName = getParentNameFromPath(parentDirPath);
    const stateFilePath = `${parentDirPath}/${parentName}.state.ts`;
    const parentDtoInterfaceNames = [
        `${core_1.strings.classify(parentName)}PageDto`,
        `${core_1.strings.classify(parentName)}Dto`,
    ];
    const parentStateInterfaceNames = [
        `${core_1.strings.classify(parentName)}PageState`,
        `${core_1.strings.classify(parentName)}State`,
    ];
    const parentInitialStateConstantNames = [
        `INITIAL_${core_1.strings.underscore(parentName).toUpperCase()}_PAGE_STATE`,
        `INITIAL_${core_1.strings.underscore(parentName).toUpperCase()}_STATE`,
    ];
    const dto = `${core_1.strings.classify(name)}Dto`;
    const state = `${core_1.strings.classify(name)}State`;
    return schematics_1.chain([
        util_1.addPropertyToInterface(stateFilePath, n => parentDtoInterfaceNames.includes(n), core_1.strings.camelize(name), dto),
        util_1.addPropertyToInterface(stateFilePath, n => parentStateInterfaceNames.includes(n), core_1.strings.camelize(name), state),
        util_1.addPropertyToExportObjectLiteral(stateFilePath, n => parentInitialStateConstantNames.includes(n), core_1.strings.camelize(name), 'undefined!'),
        util_1.addImports(stateFilePath, getImportPath(name), [
            dto,
            state,
        ], true, true),
    ]);
}
function insertInParentReducer(parentDirPath, name) {
    const parentName = getParentNameFromPath(parentDirPath);
    const reducerFilePath = `${parentDirPath}/${parentName}.reducer.ts`;
    const parentReducerNames = [
        `${core_1.strings.camelize(parentName)}PageReducer`,
        `${core_1.strings.camelize(parentName)}Reducer`,
    ];
    const reducer = `${core_1.strings.classify(name)}Reducer`;
    return schematics_1.chain([
        util_1.modifyFunction(reducerFilePath, n => parentReducerNames.includes(n), () => []),
        util_1.addImports(reducerFilePath, 'app/platform', ['callNestedReducers'], true, true),
        util_1.addImports(reducerFilePath, getImportPath(name), [reducer], true, true),
    ]);
}
function buildSelector(options) {
    const selector = core_1.strings.dasherize(options.name);
    return options.prefix ? `${options.prefix}-${selector}` : selector;
}
function component(options) {
    const sourceDir = 'src/app';
    const selector = buildSelector(options);
    options.path = core_1.normalize(options.path);
    const pathParts = options.path.split('/');
    const moduleName = pathParts[0];
    const pageName = pathParts[1];
    const modulePath = `${sourceDir}/${moduleName}/${moduleName}.module.ts`;
    const parentDirPath = `${sourceDir}/${options.path}`;
    return (host, context) => {
        const templateSource = schematics_1.apply(schematics_1.url('../../component/files'), [
            options.inlineStyle ? schematics_1.filter(path => !path.endsWith('.__styleext__')) : schematics_1.noop(),
            options.inlineTemplate ? schematics_1.filter(path => !path.endsWith('.html')) : schematics_1.noop(),
            schematics_1.template(Object.assign({}, core_1.strings, { toUpperCase: (s) => s.toUpperCase() }, options, { selector })),
            schematics_1.move(sourceDir),
        ]);
        const component = `${core_1.strings.classify(options.name)}Component`;
        return schematics_1.chain([
            util_1.addDeclarationsToModule(modulePath, [component]),
            util_1.addImports(modulePath, util_1.getPageImportPath(pageName), [component], false, true),
            insertParentExport(parentDirPath, options.name),
            insertInParentState(parentDirPath, options.name),
            insertInParentReducer(parentDirPath, options.name),
            false ? schematics_1.mergeWith(templateSource) : schematics_1.noop(),
        ])(host, context);
    };
}
exports.component = component;
//# sourceMappingURL=component.js.map