import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { RootState } from './<%= dasherize(name) %>.state';

@Component({
  templateUrl: './<%= dasherize(name) %>.page.html',
  styleUrls: ['./<%= dasherize(name) %>.page.<%= styleext %>'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <%= classify(name) %>Page {

  constructor(store: Store<RootState>) { 

  }
}