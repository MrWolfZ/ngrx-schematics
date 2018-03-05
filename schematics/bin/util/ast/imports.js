"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("@schematics/angular/node_modules/typescript");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const util_1 = require("./util");
const strings_1 = require("../strings");
function insertSymbolToExistingImport(importsFromFile, symbolName, importOnSingleLine) {
    const identifiers = [];
    for (const i of importsFromFile) {
        // if imports * from fileName, don't add symbolName
        if (ast_utils_1.findNodes(i, ts.SyntaxKind.AsteriskToken).length > 0) {
            return [];
        }
        for (const n of ast_utils_1.findNodes(i, ts.SyntaxKind.Identifier)) {
            const identifier = n;
            // if already imported, don't add symbolName
            if (identifier.text === symbolName) {
                return [];
            }
            identifiers.push(identifier);
        }
    }
    const sortedAlphabetically = strings_1.sortLexicographicallyBy(i => i.text, ...identifiers);
    let successorNodeIdx = sortedAlphabetically.findIndex(i => i.text.toLowerCase() > symbolName.toLowerCase());
    successorNodeIdx = successorNodeIdx === -1 ? sortedAlphabetically.length : successorNodeIdx;
    const separator = `${importOnSingleLine ? ' ' : '\n  '}`;
    if (successorNodeIdx === 0) {
        return [util_1.insertBefore(sortedAlphabetically[0], `${symbolName},${separator}`)];
    }
    return [util_1.insertAfter(sortedAlphabetically[successorNodeIdx - 1], `,${separator}${symbolName}`)];
}
function insertImport(source, symbolName, importPath, importOnSingleLine, separateWithExtraNewline) {
    const rootNode = source;
    const allImports = ast_utils_1.findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);
    // get nodes that map to import statements from the file fileName
    const relevantImports = allImports.filter(node => {
        // StringLiteral of the ImportDeclaration is the import file (fileName in this case).
        const importFiles = node.getChildren()
            .filter(child => child.kind === ts.SyntaxKind.StringLiteral)
            .map(n => n.text);
        return importFiles.filter(file => file === importPath).length === 1;
    });
    if (relevantImports.length > 0) {
        return insertSymbolToExistingImport(relevantImports, symbolName, importOnSingleLine);
    }
    const insertAtBeginning = allImports.length === 0;
    const separator = insertAtBeginning ? '' : `;\n${separateWithExtraNewline ? '\n' : ''}`;
    const symbol = importOnSingleLine ? ` ${symbolName} ` : `\n  ${symbolName},\n`;
    const content = `${separator}import {${symbol}} from '${importPath}'${insertAtBeginning ? ';\n\n' : ''}`;
    if (insertAtBeginning) {
        return [util_1.insertAt(0, content)];
    }
    const lastImport = util_1.getLastOccurrence(allImports);
    const lastStringLiteralInLastImport = util_1.getLastOccurrence(ast_utils_1.findNodes(lastImport, ts.SyntaxKind.StringLiteral));
    return [util_1.insertAfter(lastStringLiteralInLastImport, content)];
}
function addImport(filePath, importPath, symbolName, importOnSingleLine = true, separateWithExtraNewline = false) {
    return (host) => {
        const source = util_1.getFileSource(host, filePath);
        const importChange = insertImport(source, symbolName.replace(/\..*$/, ''), importPath, importOnSingleLine, separateWithExtraNewline);
        return util_1.applyInsertChanges(host, filePath, importChange);
    };
}
exports.addImport = addImport;
function addImports(modulePath, importPath, symbolNames, importOnSingleLine = true, separateWithExtraNewline = false) {
    return schematics_1.chain(symbolNames.map(t => addImport(modulePath, importPath, t, importOnSingleLine, separateWithExtraNewline)));
}
exports.addImports = addImports;
//# sourceMappingURL=imports.js.map