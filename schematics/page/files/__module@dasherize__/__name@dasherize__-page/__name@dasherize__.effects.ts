import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { Initialize<%= classify(name) %>PageAction, Load<%= classify(name) %>PageDataAction } from './<%= dasherize(name) %>.actions';
import { <%= classify(name) %>PageDto } from './<%= dasherize(name) %>.state';

@Injectable()
export class <%= classify(name) %>PageEffects {

  @Effect()
  loadPageData$: Observable<Action> = this.actions$
    .ofType(Load<%= classify(name) %>PageDataAction.TYPE)
    .flatMap(() =>
      Observable.of(new Initialize<%= classify(name) %>PageAction({} as <%= classify(name) %>PageDto)).delay(100)
    );

  constructor(private actions$: Actions) { }
}
