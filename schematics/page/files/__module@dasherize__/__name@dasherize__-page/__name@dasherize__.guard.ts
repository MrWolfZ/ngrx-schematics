import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { ActionsSubject } from '@ngrx/store';

import { Initialize<%= classify(name) %>PageAction, Load<%= classify(name) %>PageDataAction } from './<%= dasherize(name) %>.actions';

@Injectable()
export class <%= classify(name) %>PageInitializationGuard implements CanActivate {
  constructor(private actionsSubject: ActionsSubject) { }

  canActivate() {
    this.actionsSubject.next(new Load<%= classify(name) %>PageDataAction());
    return this.actionsSubject
      .first(a => a.type === Initialize<%= classify(name) %>PageAction.TYPE)
      .map(() => true);
  }
}
