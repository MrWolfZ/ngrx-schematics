"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("@schematics/angular/node_modules/typescript");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const util_1 = require("./util");
function modifyFunction(filePath, functionNameFilter, modificator) {
    return (host) => {
        const source = util_1.getFileSource(host, filePath);
        const functionNode = ast_utils_1.findNodes(source, ts.SyntaxKind.FunctionDeclaration)
            .map(n => n)
            .find(n => !!n.name && functionNameFilter(n.name.getText()));
        if (!functionNode) {
            throw new schematics_1.SchematicsException(`could not find interface that matches the filter in file ${filePath}`);
        }
        return util_1.applyInsertChanges(host, filePath, modificator(functionNode));
    };
}
exports.modifyFunction = modifyFunction;
function getFunctionCall(node, functionName) {
    const functionNode = ast_utils_1.findNodes(node, ts.SyntaxKind.CallExpression)
        .map(n => n)
        .find(n => util_1.getNodeNameAsString(n.expression) === functionName);
    if (!functionNode) {
        throw new schematics_1.SchematicsException(`could not find function call to ${functionName}`);
    }
    return node;
}
exports.getFunctionCall = getFunctionCall;
//# sourceMappingURL=function.js.map