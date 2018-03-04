"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("@schematics/angular/node_modules/typescript");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const util_1 = require("./util");
function getPropertyAssignments(objectNode, propertyName) {
    // Get all the children property assignment of object literals.
    return objectNode.properties
        .filter(prop => prop.kind === ts.SyntaxKind.PropertyAssignment)
        .map(prop => prop)
        .filter(prop => {
        if (propertyName === undefined) {
            return true;
        }
        return util_1.getNodeNameAsString(prop.name) === propertyName;
    });
}
exports.getPropertyAssignments = getPropertyAssignments;
function getPropertyAssignment(objectNode, propertyName) {
    // Get all the children property assignment of object literals.
    const matchingProperties = getPropertyAssignments(objectNode, propertyName);
    if (matchingProperties.length !== 1) {
        throw new schematics_1.SchematicsException(`Found more than one property assignment for '${propertyName}'`);
    }
    return matchingProperties[0];
}
exports.getPropertyAssignment = getPropertyAssignment;
function insertLastInObject(objectNode, propertyName, value, objectIndentation) {
    // check if already present
    if (getPropertyAssignments(objectNode, propertyName).length > 0) {
        return [];
    }
    const content = `${propertyName}: ${value}`;
    const propertyAssignments = getPropertyAssignments(objectNode);
    if (propertyAssignments.length === 0) {
        return [util_1.insertInEmptyArrayOrObject(objectNode, `${content},`, objectIndentation)];
    }
    const lastElement = util_1.getLastOccurrence(propertyAssignments);
    const position = lastElement.getEnd();
    return [util_1.insertAt(position, `,\n${util_1.makeWhitespace(objectIndentation + 2)}${content}`)];
}
exports.insertLastInObject = insertLastInObject;
function addPropertyToExportObjectLiteral(filePath, exportNameFilter, propertyName, propertyType) {
    return (host) => {
        const source = util_1.getFileSource(host, filePath);
        const exportNode = ast_utils_1.findNodes(source, ts.SyntaxKind.VariableDeclaration)
            .map(n => n)
            .filter(n => !!util_1.getNodeNameAsString(n.name))
            .find(n => exportNameFilter(util_1.getNodeNameAsString(n.name)));
        if (!exportNode) {
            throw new schematics_1.SchematicsException(`could not find export that matches the filter in file ${filePath}`);
        }
        const literal = ast_utils_1.findNodes(exportNode, ts.SyntaxKind.ObjectLiteralExpression, 1)[0];
        return util_1.applyInsertChanges(host, filePath, insertLastInObject(literal, propertyName, propertyType, 0));
    };
}
exports.addPropertyToExportObjectLiteral = addPropertyToExportObjectLiteral;
//# sourceMappingURL=object.js.map