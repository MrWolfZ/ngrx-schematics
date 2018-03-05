"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
exports.moduleNames = {
    dir: (name) => `${core_1.strings.dasherize(name)}`,
    dirToName: (name) => name,
    route: (name) => `${core_1.strings.dasherize(name)}`,
    moduleClass: (name) => `${core_1.strings.classify(name)}Module`,
    routes: (name) => `${core_1.strings.camelize(name)}Routes`,
    moduleFile: (name) => `${core_1.strings.dasherize(name)}.module.ts`,
    moduleFileNoExt: (name) => `${core_1.strings.dasherize(name)}.module`,
    routingFile: (name) => `${core_1.strings.dasherize(name)}.routing.ts`,
    routingFileNoExt: (name) => `${core_1.strings.dasherize(name)}.routing`,
};
exports.pageNames = {
    dir: (name) => `${core_1.strings.dasherize(name)}-page`,
    dirToName: (name) => name.replace(/-page$/, ''),
    route: (name) => `${core_1.strings.dasherize(name)}`,
    component: (name) => `${core_1.strings.classify(name)}Page`,
    guard: (name) => `${core_1.strings.classify(name)}PageInitializationGuard`,
    featureStateNameConstant: (name) => `${core_1.strings.underscore(name).toUpperCase()}_PAGE_STATE_FEATURE_NAME`,
    featureStateName: (name) => `${core_1.strings.camelize(name)}`,
    reducer: (name) => `${core_1.strings.camelize(name)}PageReducer`,
    effects: (name) => `${core_1.strings.classify(name)}PageEffects`,
    dto: (name) => `${core_1.strings.classify(name)}PageDto`,
    dtoMockConstant: (name) => `MOCK_${core_1.strings.underscore(name).toUpperCase()}_PAGE_DTO`,
    state: (name) => `${core_1.strings.classify(name)}PageState`,
    initialStateConstant: (name) => `INITIAL_${core_1.strings.underscore(name).toUpperCase()}_PAGE_STATE`,
    actions: (name) => `${core_1.strings.classify(name)}PageActions`,
    loadAction: (name) => `Load${core_1.strings.classify(name)}PageDataAction`,
    initializationAction: (name) => `Initialize${core_1.strings.classify(name)}PageAction`,
    actionsFile: (name) => `${core_1.strings.dasherize(name)}.actions.ts`,
    actionsFileNoExt: (name) => `${core_1.strings.dasherize(name)}.actions`,
    componentFile: (name) => `${core_1.strings.dasherize(name)}.page.ts`,
    componentFileNoExt: (name) => `${core_1.strings.dasherize(name)}.page`,
    componentTemplateFile: (name) => `${core_1.strings.dasherize(name)}.page.html`,
    effectsFile: (name) => `${core_1.strings.dasherize(name)}.effects.ts`,
    effectsFileNoExt: (name) => `${core_1.strings.dasherize(name)}.effects`,
    guardFile: (name) => `${core_1.strings.dasherize(name)}.guard.ts`,
    guardFileNoExt: (name) => `${core_1.strings.dasherize(name)}.guard`,
    reducerFile: (name) => `${core_1.strings.dasherize(name)}.reducer.ts`,
    reducerFileNoExt: (name) => `${core_1.strings.dasherize(name)}.reducer`,
    reducerSpecFile: (name) => `${core_1.strings.dasherize(name)}.reducer.spec.ts`,
    reducerSpecFileNoExt: (name) => `${core_1.strings.dasherize(name)}.reducer.spec`,
    stateFile: (name) => `${core_1.strings.dasherize(name)}.state.ts`,
    stateFileNoExt: (name) => `${core_1.strings.dasherize(name)}.state`,
};
exports.componentNames = {
    selector: (name, prefix) => prefix ? `${prefix}-${core_1.strings.dasherize(name)}` : core_1.strings.dasherize(name),
    dir: (name) => `${core_1.strings.dasherize(name)}`,
    component: (name) => `${core_1.strings.classify(name)}Component`,
    reducer: (name) => `${core_1.strings.camelize(name)}Reducer`,
    dto: (name) => `${core_1.strings.classify(name)}Dto`,
    dtoMockConstant: (name) => `MOCK_${core_1.strings.underscore(name).toUpperCase()}_DTO`,
    state: (name) => `${core_1.strings.classify(name)}State`,
    stateName: (name) => `${core_1.strings.camelize(name)}`,
    initialStateConstant: (name) => `INITIAL_${core_1.strings.underscore(name).toUpperCase()}_STATE`,
    actions: (name) => `${core_1.strings.classify(name)}Actions`,
    initializationAction: (name) => `Initialize${core_1.strings.classify(name)}Action`,
    actionsFile: (name) => `${core_1.strings.dasherize(name)}.actions.ts`,
    actionsFileNoExt: (name) => `${core_1.strings.dasherize(name)}.actions`,
    componentFile: (name) => `${core_1.strings.dasherize(name)}.component.ts`,
    componentFileNoExt: (name) => `${core_1.strings.dasherize(name)}.component`,
    componentTemplateFile: (name) => `${core_1.strings.dasherize(name)}.component.html`,
    reducerFile: (name) => `${core_1.strings.dasherize(name)}.reducer.ts`,
    reducerFileNoExt: (name) => `${core_1.strings.dasherize(name)}.reducer`,
    reducerSpecFile: (name) => `${core_1.strings.dasherize(name)}.reducer.spec.ts`,
    reducerSpecFileNoExt: (name) => `${core_1.strings.dasherize(name)}.reducer.spec`,
    stateFile: (name) => `${core_1.strings.dasherize(name)}.state.ts`,
    stateFileNoExt: (name) => `${core_1.strings.dasherize(name)}.state`,
};
function getPageOrComponentName(directoryPath) {
    return directoryPath.replace(/-page$/, '');
}
exports.getPageOrComponentName = getPageOrComponentName;
function isPagePath(directoryPath) {
    return /-page$/.test(directoryPath);
}
exports.isPagePath = isPagePath;
//# sourceMappingURL=names.js.map