"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
function insertLastInArray(arrayNode, content, arrayIndentation) {
    // check if already present
    const symbolsArray = arrayNode.elements.map(node => node.getText());
    if (symbolsArray.includes(content)) {
        return [];
    }
    if (arrayNode.elements.length === 0) {
        return [util_1.insertInEmptyArrayOrObject(arrayNode, `${content},`, arrayIndentation)];
    }
    const lastElement = arrayNode.elements[arrayNode.elements.length - 1];
    const position = lastElement.getEnd();
    return [util_1.insertAt(position, `,\n${util_1.makeWhitespace(arrayIndentation + 2)}${content}`)];
}
exports.insertLastInArray = insertLastInArray;
//# sourceMappingURL=array.js.map