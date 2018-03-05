"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sortLexicographically(...strings) {
    return [...strings].sort((l, r) => l.toLowerCase() < r.toLowerCase() ? -1 : l.toLowerCase() > r.toLowerCase() ? 1 : 0);
}
exports.sortLexicographically = sortLexicographically;
function sortLexicographicallyBy(projection, ...items) {
    return [...items].sort((l, r) => projection(l).toLowerCase() < projection(r).toLowerCase() ? -1 : projection(l).toLowerCase() > projection(r).toLowerCase() ? 1 : 0);
}
exports.sortLexicographicallyBy = sortLexicographicallyBy;
//# sourceMappingURL=strings.js.map