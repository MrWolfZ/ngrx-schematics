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
function insertLastInArray(arrayNode, content, arrayIndentation) {
    // check if already present
    const symbolsArray = arrayNode.elements.map(node => node.getText());
    if (symbolsArray.includes(content)) {
        return [];
    }
    if (arrayNode.elements.length === 0) {
        const position = arrayNode.getStart() + 1;
        // we assume the empty array literal to be `[]` without any white space
        return [insertAt(position, `\n${makeWhitespace(arrayIndentation + 2)}${content},\n${makeWhitespace(arrayIndentation)}`)];
    }
    const lastElement = arrayNode.elements[arrayNode.elements.length - 1];
    const position = lastElement.getEnd();
    return [insertAt(position, `,\n${makeWhitespace(arrayIndentation + 2)}${content}`)];
}
exports.insertLastInArray = insertLastInArray;
//# sourceMappingURL=util.js.map