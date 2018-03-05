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
        util_1.addPropertyToInterface(stateFilePath, n => parentDtoInterfaceNames.includes(n), util_1.componentNames.stateName(name), dto),
        util_1.addPropertyToInterface(stateFilePath, n => parentStateInterfaceNames.includes(n), util_1.componentNames.stateName(name), state),
        util_1.addPropertyToExportObjectLiteral(stateFilePath, n => parentInitialStateConstantNames.includes(n), util_1.componentNames.stateName(name), 'undefined!'),
        util_1.addImports(stateFilePath, getImportPath(name), [
            dto,
            state,
        ], true, true),
    ]);
}
function insertInParentMockDto(parentDirPath, name) {
    const isPage = util_1.isPagePath(parentDirPath);
    const parentName = getParentNameFromPath(parentDirPath);
    const stateFilePath = `${parentDirPath}/${isPage ? util_1.pageNames.reducerSpecFile(parentName) : util_1.componentNames.reducerSpecFile(parentName)}`;
    const parentDtoMockConstantNames = [
        util_1.pageNames.dtoMockConstant(parentName),
        util_1.componentNames.dtoMockConstant(parentName),
    ];
    const dtoMockConstant = util_1.componentNames.dtoMockConstant(name);
    return schematics_1.chain([
        util_1.addPropertyToExportObjectLiteral(stateFilePath, n => parentDtoMockConstantNames.includes(n), util_1.componentNames.stateName(name), dtoMockConstant),
        util_1.addImports(stateFilePath, `./${util_1.componentNames.dir(name)}/${util_1.componentNames.reducerSpecFileNoExt(name)}`, [
            dtoMockConstant,
        ], true, true),
    ]);
}
const CALL_NESTED_REDUCERS_FUNCTION_NAME = 'callNestedReducers';
function addInitialNestedReducerCallToExistingCall(node, name) {
    const existingCall = util_1.getFunctionCall(node, CALL_NESTED_REDUCERS_FUNCTION_NAME);
    const reducersLiteral = ast_utils_1.findNodes(existingCall, ts.SyntaxKind.ObjectLiteralExpression)
        .map(n => n)[0];
    return util_1.insertLastInObject(reducersLiteral, util_1.componentNames.stateName(name), util_1.componentNames.reducer(name), 2);
}
function addInitialNestedReducerCall(node, name) {
    if (node.getText().includes(CALL_NESTED_REDUCERS_FUNCTION_NAME)) {
        return addInitialNestedReducerCallToExistingCall(node, name);
    }
    const content = `
  state = callNestedReducers(state, action, {
    ${util_1.componentNames.stateName(name)}: ${util_1.componentNames.reducer(name)},
  });
`;
    return [util_1.insertAt(node.getStart() + 1, content)];
}
function addNestedReducerCallDuringInitialization(node, parentName, name) {
    const caseClause = ast_utils_1.findNodes(node, ts.SyntaxKind.CaseClause)
        .map(n => n)
        .find(n => n.getText().includes(util_1.pageNames.initializationAction(parentName)) || n.getText().includes(util_1.componentNames.initializationAction(parentName)));
    if (!caseClause) {
        throw new schematics_1.SchematicsException('Could not find case clause for initialization action');
    }
    const initializationExpression = util_1.getLastOccurrence(ast_utils_1.findNodes(caseClause, ts.SyntaxKind.ObjectLiteralExpression)
        .map(n => n));
    const reducerCall = `${util_1.componentNames.reducer(name)}(state.${util_1.componentNames.stateName(name)}, new ${util_1.componentNames.initializationAction(name)}(action.dto.${util_1.componentNames.stateName(name)}))`;
    return util_1.insertLastInObject(initializationExpression, util_1.componentNames.stateName(name), reducerCall, 6);
}
function addNestedReducerCalls(node, parentName, name) {
    const body = node.body;
    return [
        ...addInitialNestedReducerCall(body, name),
        ...addNestedReducerCallDuringInitialization(body, parentName, name),
    ];
}
function insertInParentReducer(parentDirPath, name) {
    const isPage = util_1.isPagePath(parentDirPath);
    const parentName = getParentNameFromPath(parentDirPath);
    const reducerFilePath = `${parentDirPath}/${isPage ? util_1.pageNames.reducerFile(parentName) : util_1.componentNames.reducerFile(parentName)}`;
    const parentReducerNames = [
        util_1.pageNames.reducer(parentName),
        util_1.componentNames.reducer(parentName),
    ];
    return schematics_1.chain([
        util_1.modifyFunction(reducerFilePath, n => parentReducerNames.includes(n), n => addNestedReducerCalls(n, parentName, name)),
        util_1.addImports(reducerFilePath, 'app/platform', [CALL_NESTED_REDUCERS_FUNCTION_NAME], true, true),
        util_1.addImports(reducerFilePath, getImportPath(name), [util_1.componentNames.reducer(name), util_1.componentNames.initializationAction(name)], true, true),
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
            schematics_1.template(Object.assign({}, core_1.strings, options, { selector }, util_1.componentNames, { sortLexicographically: util_1.sortLexicographically })),
            schematics_1.move(sourceDir),
        ]);
        const component = util_1.componentNames.component(options.name);
        return schematics_1.chain([
            util_1.addDeclarationsToModule(modulePath, [component]),
            util_1.addImports(modulePath, `./${util_1.pageNames.dir(pageName)}`, [component], false, true),
            insertParentExport(parentDirPath, options.name),
            insertInParentState(parentDirPath, options.name),
            insertInParentMockDto(parentDirPath, options.name),
            insertInParentReducer(parentDirPath, options.name),
            schematics_1.mergeWith(templateSource),
        ])(host, context);
    };
}
exports.component = component;
//# sourceMappingURL=component.js.map