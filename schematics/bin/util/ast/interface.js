"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("@schematics/angular/node_modules/typescript");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const util_1 = require("./util");
function addPropertyToNonEmptyInterface(node, content, interfaceIndentation) {
    const lastElement = util_1.getLastOccurrence(node.members);
    const position = lastElement.getEnd();
    return [util_1.insertAt(position, `\n${util_1.makeWhitespace(interfaceIndentation + 2)}${content};`)];
}
function addPropertyToInterface(filePath, interfaceNameFilter, propertyName, propertyType) {
    return (host) => {
        const source = util_1.getFileSource(host, filePath);
        const interfaceNode = ast_utils_1.findNodes(source, ts.SyntaxKind.InterfaceDeclaration)
            .map(n => n)
            .find(n => interfaceNameFilter(n.name.getText()));
        if (!interfaceNode) {
            throw new schematics_1.SchematicsException(`could not find interface that matches the filter in file ${filePath}`);
        }
        const properties = ast_utils_1.findNodes(interfaceNode, ts.SyntaxKind.PropertySignature)
            .map(n => n);
        // check if already present
        if (properties.some(prop => util_1.getNodeNameAsString(prop.name) === propertyName)) {
            return host;
        }
        const content = `${propertyName}: ${propertyType}`;
        if (properties.length === 0) {
            return util_1.applyInsertChanges(host, filePath, [util_1.insertBetweenBrackets(interfaceNode.getText(), interfaceNode.getStart() + 1, `${content};`, 0)]);
        }
        return util_1.applyInsertChanges(host, filePath, addPropertyToNonEmptyInterface(interfaceNode, content, 0));
    };
}
exports.addPropertyToInterface = addPropertyToInterface;
//# sourceMappingURL=interface.js.map