import { Action } from '@ngrx/store';

import { <%= classify(name) %>PageDto } from './<%= dasherize(name) %>.state';

export class Initialize<%= classify(name) %>PageAction implements Action {
  static readonly TYPE = '<%= dasherize(module) %>/<%= dasherize(name) %>-page/INITIALIZE';
  readonly type = Initialize<%= classify(name) %>PageAction.TYPE;

  constructor(
    public dto: <%= classify(name) %>PageDto,
  ) {}
}

export type <%= classify(name) %>PageActions =
  | Initialize<%= classify(name) %>PageAction
  ;
