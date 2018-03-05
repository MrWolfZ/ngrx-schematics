import { strings } from '@angular-devkit/core';

export const moduleNames = {
  dir: (name: string) => `${strings.dasherize(name)}`,
  dirToName: (name: string) => name,
  route: (name: string) => `${strings.dasherize(name)}`,
  moduleClass: (name: string) => `${strings.classify(name)}Module`,
  routes: (name: string) => `${strings.camelize(name)}Routes`,
  moduleFile: (name: string) => `${strings.dasherize(name)}.module.ts`,
  moduleFileNoExt: (name: string) => `${strings.dasherize(name)}.module`,
  routingFile: (name: string) => `${strings.dasherize(name)}.routing.ts`,
  routingFileNoExt: (name: string) => `${strings.dasherize(name)}.routing`,
};

export const pageNames = {
  dir: (name: string) => `${strings.dasherize(name)}-page`,
  dirToName: (name: string) => name.replace(/-page$/, ''),
  route: (name: string) => `${strings.dasherize(name)}`,
  component: (name: string) => `${strings.classify(name)}Page`,
  guard: (name: string) => `${strings.classify(name)}PageInitializationGuard`,
  featureStateNameConstant: (name: string) => `${strings.underscore(name).toUpperCase()}_PAGE_STATE_FEATURE_NAME`,
  featureStateName: (name: string) => `${strings.camelize(name)}`,
  reducer: (name: string) => `${strings.camelize(name)}PageReducer`,
  effects: (name: string) => `${strings.classify(name)}PageEffects`,
  dto: (name: string) => `${strings.classify(name)}PageDto`,
  dtoMockConstant: (name: string) => `MOCK_${strings.underscore(name).toUpperCase()}_PAGE_DTO`,
  state: (name: string) => `${strings.classify(name)}PageState`,
  initialStateConstant: (name: string) => `INITIAL_${strings.underscore(name).toUpperCase()}_PAGE_STATE`,
  actions: (name: string) => `${strings.classify(name)}PageActions`,
  loadAction: (name: string) => `Load${strings.classify(name)}PageDataAction`,
  initializationAction: (name: string) => `Initialize${strings.classify(name)}PageAction`,
  actionsFile: (name: string) => `${strings.dasherize(name)}.actions.ts`,
  actionsFileNoExt: (name: string) => `${strings.dasherize(name)}.actions`,
  componentFile: (name: string) => `${strings.dasherize(name)}.page.ts`,
  componentFileNoExt: (name: string) => `${strings.dasherize(name)}.page`,
  componentTemplateFile: (name: string) => `${strings.dasherize(name)}.page.html`,
  effectsFile: (name: string) => `${strings.dasherize(name)}.effects.ts`,
  effectsFileNoExt: (name: string) => `${strings.dasherize(name)}.effects`,
  guardFile: (name: string) => `${strings.dasherize(name)}.guard.ts`,
  guardFileNoExt: (name: string) => `${strings.dasherize(name)}.guard`,
  reducerFile: (name: string) => `${strings.dasherize(name)}.reducer.ts`,
  reducerFileNoExt: (name: string) => `${strings.dasherize(name)}.reducer`,
  reducerSpecFile: (name: string) => `${strings.dasherize(name)}.reducer.spec.ts`,
  reducerSpecFileNoExt: (name: string) => `${strings.dasherize(name)}.reducer.spec`,
  stateFile: (name: string) => `${strings.dasherize(name)}.state.ts`,
  stateFileNoExt: (name: string) => `${strings.dasherize(name)}.state`,
};

export const componentNames = {
  selector: (name: string, prefix?: string) => prefix ? `${prefix}-${strings.dasherize(name)}` : strings.dasherize(name),
  dir: (name: string) => `${strings.dasherize(name)}`,
  component: (name: string) => `${strings.classify(name)}Component`,
  reducer: (name: string) => `${strings.camelize(name)}Reducer`,
  dto: (name: string) => `${strings.classify(name)}Dto`,
  dtoMockConstant: (name: string) => `MOCK_${strings.underscore(name).toUpperCase()}_DTO`,
  state: (name: string) => `${strings.classify(name)}State`,
  stateName: (name: string) => `${strings.camelize(name)}`,
  initialStateConstant: (name: string) => `INITIAL_${strings.underscore(name).toUpperCase()}_STATE`,
  actions: (name: string) => `${strings.classify(name)}Actions`,
  initializationAction: (name: string) => `Initialize${strings.classify(name)}Action`,
  actionsFile: (name: string) => `${strings.dasherize(name)}.actions.ts`,
  actionsFileNoExt: (name: string) => `${strings.dasherize(name)}.actions`,
  componentFile: (name: string) => `${strings.dasherize(name)}.component.ts`,
  componentFileNoExt: (name: string) => `${strings.dasherize(name)}.component`,
  componentTemplateFile: (name: string) => `${strings.dasherize(name)}.component.html`,
  reducerFile: (name: string) => `${strings.dasherize(name)}.reducer.ts`,
  reducerFileNoExt: (name: string) => `${strings.dasherize(name)}.reducer`,
  reducerSpecFile: (name: string) => `${strings.dasherize(name)}.reducer.spec.ts`,
  reducerSpecFileNoExt: (name: string) => `${strings.dasherize(name)}.reducer.spec`,
  stateFile: (name: string) => `${strings.dasherize(name)}.state.ts`,
  stateFileNoExt: (name: string) => `${strings.dasherize(name)}.state`,
};

export function getPageOrComponentName(directoryPath: string) {
  return directoryPath.replace(/-page$/, '');
}

export function isPagePath(directoryPath: string) {
  return /-page$/.test(directoryPath);
}
