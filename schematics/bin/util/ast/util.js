"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("@schematics/angular/node_modules/typescript");
function getFileSource(host, filePath) {
    const text = host.read(filePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${filePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    return ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
}
exports.getFileSource = getFileSource;
function getNodeNameAsString(prop) {
    if (!prop) {
        return undefined;
    }
    switch (prop.kind) {
        case ts.SyntaxKind.Identifier:
            return prop.getText();
        case ts.SyntaxKind.StringLiteral:
            return prop.text;
        default:
            return undefined;
    }
}
exports.getNodeNameAsString = getNodeNameAsString;
function applyInsertChanges(host, filePath, changes) {
    const recorder = changes.reduce((r, c) => r.insertLeft(c.position, c.content), host.beginUpdate(filePath));
    host.commitUpdate(recorder);
    return host;
}
exports.applyInsertChanges = applyInsertChanges;
function insertAt(position, content) {
    return {
        position,
        content,
    };
}
exports.insertAt = insertAt;
function insertAfter(node, content) {
    return {
        position: node.getEnd(),
        content,
    };
}
exports.insertAfter = insertAfter;
function insertBefore(node, content) {
    return {
        position: node.getStart(),
        content,
    };
}
exports.insertBefore = insertBefore;
function nodesByPosition(first, second) {
    return first.getStart() - second.getStart();
}
function getLastOccurrence(nodes) {
    if (nodes.length === 0) {
        throw new Error('must have at least one node to get last occurrence');
    }
    return [...nodes].sort(nodesByPosition).pop();
}
exports.getLastOccurrence = getLastOccurrence;
function makeWhitespace(amount) {
    return new Array(amount).fill(' ').join('');
}
exports.makeWhitespace = makeWhitespace;
function insertBetweenBrackets(text, position, content, indentation) {
    const openingBracketOffset = /(\[|{)/.exec(text).index;
    position += openingBracketOffset;
    text = text.substring(openingBracketOffset);
    let toInsert = `\n${makeWhitespace(indentation + 2)}${content}\n${makeWhitespace(indentation)}`;
    if (/^(\[|{)[^\n\r]*(\r?\n)[^\n\r]*(\]|})$/.test(text)) {
        // literal is like `[\n]` or `{\n}`
        toInsert = `\n${makeWhitespace(indentation + 2)}${content}`;
    }
    else if (/^(\[|{)[^\n\r]*(\r?\n)[^\n\r]*(\r?\n)[^\n\r]*(\]|})$/.test(text)) {
        // literal is like `[\n\n]` or `{\n\n}`
        toInsert = `${makeWhitespace(indentation + 2)}${content}`;
        // if line break contains carriage return we need to increment position by 2, otherwise just 1
        position += /^(\[|{)[^\n\r]*(\r\n)/.test(text) ? 2 : 1;
    }
    return insertAt(position, toInsert);
}
exports.insertBetweenBrackets = insertBetweenBrackets;
function insertInEmptyArrayOrObject(node, content, indentation) {
    const text = node.getText();
    const position = node.getStart() + 1;
    return insertBetweenBrackets(text, position, content, indentation);
}
exports.insertInEmptyArrayOrObject = insertInEmptyArrayOrObject;
//# sourceMappingURL=util.js.map