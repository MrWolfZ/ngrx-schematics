"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ts = require("@schematics/angular/node_modules/typescript");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const change_1 = require("@schematics/angular/utility/change");
function addDeclarationToNgModule(sourceDir, path, name) {
    return (host) => {
        const pathParts = path.split('/');
        const moduleName = pathParts[0];
        const pageName = pathParts[1];
        const modulePath = `${sourceDir}/${moduleName}/${moduleName}.module.ts`;
        const text = host.read(modulePath);
        if (text === null) {
            throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
        }
        const sourceText = text.toString('utf-8');
        const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
        const importPath = `./${pageName}`;
        const classifiedName = core_1.strings.classify(`${name}Component`);
        const declarationChanges = ast_utils_1.addDeclarationToModule(source, modulePath, classifiedName, importPath);
        const declarationRecorder = host.beginUpdate(modulePath);
        for (const change of declarationChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        return host;
    };
}
function buildSelector(options) {
    let selector = core_1.strings.dasherize(options.name);
    if (options.prefix) {
        selector = `${options.prefix}-${selector}`;
    }
    return selector;
}
function component(options) {
    const sourceDir = 'src/app';
    const selector = buildSelector(options);
    options.path = core_1.normalize(options.path);
    return (host, context) => {
        const templateSource = schematics_1.apply(schematics_1.url('../../component/files'), [
            options.inlineStyle ? schematics_1.filter(path => !path.endsWith('.__styleext__')) : schematics_1.noop(),
            options.inlineTemplate ? schematics_1.filter(path => !path.endsWith('.html')) : schematics_1.noop(),
            schematics_1.template(Object.assign({}, core_1.strings, { toUpperCase: (s) => s.toUpperCase() }, options, { selector })),
            schematics_1.move(sourceDir),
        ]);
        return schematics_1.chain([
            addDeclarationToNgModule(sourceDir, options.path, options.name),
            schematics_1.mergeWith(templateSource),
        ])(host, context);
    };
}
exports.component = component;
//# sourceMappingURL=component.js.map