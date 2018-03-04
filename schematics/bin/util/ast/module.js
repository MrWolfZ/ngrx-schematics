"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("@schematics/angular/node_modules/typescript");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const array_1 = require("./array");
const object_1 = require("./object");
const util_1 = require("./util");
function getDecoratorPropertyAssignmentNode(source, metadataField) {
    const nodes = ast_utils_1.getDecoratorMetadata(source, 'NgModule', '@angular/core');
    const decoratorMetadataNode = nodes[0];
    if (!decoratorMetadataNode) {
        throw new schematics_1.SchematicsException('Could not find NgModule decorator metadata');
    }
    return object_1.getPropertyAssignment(decoratorMetadataNode, metadataField);
}
exports.getDecoratorPropertyAssignmentNode = getDecoratorPropertyAssignmentNode;
function addSymbolToNgModuleMetadata(source, metadataField, symbolName) {
    const assignment = getDecoratorPropertyAssignmentNode(source, metadataField);
    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        throw new schematics_1.SchematicsException('Can only add symbols to arrays');
    }
    const arrLiteral = assignment.initializer;
    return array_1.insertLastInArray(arrLiteral, symbolName, 2);
}
exports.addSymbolToNgModuleMetadata = addSymbolToNgModuleMetadata;
function addSymbolToNgModule(modulePath, metadataField, symbolName) {
    return (host) => {
        const source = util_1.getFileSource(host, modulePath);
        const declarationChanges = addSymbolToNgModuleMetadata(source, metadataField, symbolName);
        return util_1.applyInsertChanges(host, modulePath, declarationChanges);
    };
}
exports.addSymbolToNgModule = addSymbolToNgModule;
function addSymbolsToNgModule(modulePath, metadataField, symbolNames) {
    return schematics_1.chain(symbolNames.map(t => addSymbolToNgModule(modulePath, metadataField, t)));
}
exports.addSymbolsToNgModule = addSymbolsToNgModule;
function addDeclarationsToModule(modulePath, symbolNames) {
    return addSymbolsToNgModule(modulePath, 'declarations', symbolNames);
}
exports.addDeclarationsToModule = addDeclarationsToModule;
function addImportsToModule(modulePath, symbolNames) {
    return addSymbolsToNgModule(modulePath, 'imports', symbolNames);
}
exports.addImportsToModule = addImportsToModule;
function addProvidersToModule(modulePath, symbolNames) {
    return addSymbolsToNgModule(modulePath, 'providers', symbolNames);
}
exports.addProvidersToModule = addProvidersToModule;
//# sourceMappingURL=module.js.map