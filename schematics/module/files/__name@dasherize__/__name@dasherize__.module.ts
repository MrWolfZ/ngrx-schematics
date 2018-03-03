import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [
  ],
  imports: [
    EffectsModule.forFeature([]),
  ],
  providers: [],
})
export class <%= classify(name) %>Module { }
