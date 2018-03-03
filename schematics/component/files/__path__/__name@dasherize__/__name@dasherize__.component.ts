import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { <%= classify(name) %>State } from './<%= dasherize(name) %>.state';

@Component({
  templateUrl: './<%= dasherize(name) %>.component.html',
  styleUrls: ['./<%= dasherize(name) %>.component.<%= styleext %>'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <%= classify(name) %>Component {
  @Input() state: <%= classify(name) %>State;
}
