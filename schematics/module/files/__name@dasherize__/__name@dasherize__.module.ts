import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { <%= camelize(name) %>Routes } from './<%= dasherize(name) %>.routing';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(<%= camelize(name) %>Routes),
    EffectsModule.forFeature([]),
  ],
  providers: [],
})
export class <%= classify(name) %>Module { }
