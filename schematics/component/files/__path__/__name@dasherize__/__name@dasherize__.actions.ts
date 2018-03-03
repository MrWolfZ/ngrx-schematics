import { Action } from '@ngrx/store';

import { <%= classify(name) %>Dto } from './<%= dasherize(name) %>.state';

export class Initialize<%= classify(name) %>Action implements Action {
  static readonly TYPE = '<%= dasherize(path) %>/<%= dasherize(name) %>/INITIALIZE';
  readonly type = Initialize<%= classify(name) %>Action.TYPE;

  constructor(
    public dto: <%= classify(name) %>Dto,
  ) {}
}

export type <%= classify(name) %>Actions =
  | Initialize<%= classify(name) %>Action
  ;
