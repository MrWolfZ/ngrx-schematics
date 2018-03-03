"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
function module(options) {
    const sourceDir = 'src/app';
    return (host, context) => {
        const templateSource = schematics_1.apply(schematics_1.url('../../module/files'), [
            schematics_1.template(Object.assign({}, core_1.strings, { toUpperCase: (s) => s.toUpperCase() }, options)),
            schematics_1.move(sourceDir),
        ]);
        return schematics_1.chain([
            schematics_1.mergeWith(templateSource),
        ])(host, context);
    };
}
exports.module = module;
//# sourceMappingURL=module.js.map