import { RootState as AppRootState } from '../../app.state';

export interface RootState extends AppRootState {
  <%= camelize(name) %>: <%= classify(name) %>PageState;
}

export interface <%= classify(name) %>PageDto {

}

export interface <%= classify(name) %>PageState extends <%= classify(name) %>PageDto {

}

export const INITIAL_<%= toUpperCase(underscore(name)) %>_PAGE_STATE: <%= classify(name) %>PageState = {

};

export const <%= toUpperCase(underscore(name)) %>_PAGE_STATE_FEATURE_NAME = '<%= camelize(name) %>';
