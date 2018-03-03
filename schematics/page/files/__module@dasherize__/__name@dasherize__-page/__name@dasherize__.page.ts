import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { <% if(classify(name) <= 'RootState') { %><%= classify(name) %>PageState, <% } %>RootState<% if(classify(name) > 'RootState') { %>, <%= classify(name) %>PageState<% } %> } from './<%= dasherize(name) %>.state';

@Component({
  templateUrl: './<%= dasherize(name) %>.page.html',
  styleUrls: ['./<%= dasherize(name) %>.page.<%= styleext %>'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <%= classify(name) %>Page {
  state$: Observable<<%= classify(name) %>PageState>;

  constructor(store: Store<RootState>) {
    this.state$ = store.select(s => s.<%= camelize(name) %>);
  }
}
