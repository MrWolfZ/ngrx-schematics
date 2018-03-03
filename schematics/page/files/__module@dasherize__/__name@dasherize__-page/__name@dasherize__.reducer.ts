import { <% if(classify(name) <= 'Initialize') { %><%= classify(name) %>PageActions, <% } %>Initialize<%= classify(name) %>PageAction<% if(classify(name) > 'Initialize') { %>, <%= classify(name) %>PageActions<% } %> } from './<%= dasherize(name) %>.actions';
import { <% if(classify(name) <= 'INITIAL') { %><%= classify(name) %>PageState, <% } %>INITIAL_<%= toUpperCase(underscore(name)) %>_PAGE_STATE<% if(classify(name) > 'INITIAL') { %>, <%= classify(name) %>PageState<% } %> } from './<%= dasherize(name) %>.state';

export function <%= camelize(name) %>PageReducer(state = INITIAL_<%= toUpperCase(underscore(name)) %>_PAGE_STATE, action: <%= classify(name) %>PageActions): <%= classify(name) %>PageState {
  switch (action.type) {
    case Initialize<%= classify(name) %>PageAction.TYPE:
      return {
        ...state,
        ...action.dto,
      };

    default:
      return state;
  }
}
