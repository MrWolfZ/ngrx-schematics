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
        const exportText = `\nexport * from './${util_1.componentNames.dir(name)}';`;
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
    return util_1.getPageOrComponentName(parentDirPathParts[parentDirPathParts.length - 1]);
}
function insertInParentState(parentDirPath, name) {
    const isPage = util_1.isPagePath(parentDirPath);
    const parentName = getParentNameFromPath(parentDirPath);
    const stateFilePath = `${parentDirPath}/${isPage ? util_1.pageNames.stateFile(parentName) : util_1.componentNames.stateFile(parentName)}`;
    const parentDtoInterfaceNames = [
        util_1.pageNames.dto(parentName),
        util_1.componentNames.dto(parentName),
    ];
    const parentStateInterfaceNames = [
        util_1.pageNames.state(parentName),
        util_1.componentNames.state(parentName),
    ];
    const parentInitialStateConstantNames = [
        util_1.pageNames.initialStateConstant(parentName),
        util_1.componentNames.initialStateConstant(parentName),
    ];
    const dto = util_1.componentNames.dto(name);
    const state = util_1.componentNames.state(name);
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
    const isPage = util_1.isPagePath(parentDirPath);
    const parentName = getParentNameFromPath(parentDirPath);
    const reducerFilePath = `${parentDirPath}/${isPage ? util_1.pageNames.reducerFile(parentName) : util_1.componentNames.reducerFile(parentName)}`;
    const parentReducerNames = [
        util_1.pageNames.reducer(parentName),
        util_1.componentNames.reducer(parentName),
    ];
    const reducer = util_1.componentNames.reducer(name);
    return schematics_1.chain([
        util_1.modifyFunction(reducerFilePath, n => parentReducerNames.includes(n), () => []),
        util_1.addImports(reducerFilePath, 'app/platform', ['callNestedReducers'], true, true),
        util_1.addImports(reducerFilePath, getImportPath(name), [reducer], true, true),
    ]);
}
function component(options) {
    const sourceDir = 'src/app';
    const selector = util_1.componentNames.selector(options.name, options.prefix);
    options.path = core_1.normalize(options.path);
    const pathParts = options.path.split('/');
    const moduleName = util_1.moduleNames.dirToName(pathParts[0]);
    const pageName = util_1.pageNames.dirToName(pathParts[1]);
    const modulePath = `${sourceDir}/${util_1.moduleNames.dir(moduleName)}/${util_1.moduleNames.moduleFile(moduleName)}`;
    const parentDirPath = `${sourceDir}/${options.path}`;
    return (host, context) => {
        const templateSource = schematics_1.apply(schematics_1.url('../../component/files'), [
            options.inlineStyle ? schematics_1.filter(path => !path.endsWith('.__styleext__')) : schematics_1.noop(),
            options.inlineTemplate ? schematics_1.filter(path => !path.endsWith('.html')) : schematics_1.noop(),
            schematics_1.template(Object.assign({}, core_1.strings, options, { selector }, util_1.componentNames)),
            schematics_1.move(sourceDir),
        ]);
        const component = util_1.componentNames.component(options.name);
        return schematics_1.chain([
            util_1.addDeclarationsToModule(modulePath, [component]),
            util_1.addImports(modulePath, `./${util_1.pageNames.dir(pageName)}`, [component], false, true),
            insertParentExport(parentDirPath, options.name),
            insertInParentState(parentDirPath, options.name),
            insertInParentReducer(parentDirPath, options.name),
            schematics_1.mergeWith(templateSource),
        ])(host, context);
    };
}
exports.component = component;
//# sourceMappingURL=component.js.map