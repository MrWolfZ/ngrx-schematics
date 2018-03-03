import { <% if(classify(name) <= 'Initialize') { %><%= classify(name) %>Actions, <% } %>Initialize<%= classify(name) %>Action<% if(classify(name) > 'Initialize') { %>, <%= classify(name) %>Actions<% } %> } from './<%= dasherize(name) %>.actions';
import { <% if(classify(name) <= 'INITIAL') { %><%= classify(name) %>State, <% } %>INITIAL_<%= toUpperCase(underscore(name)) %>_STATE<% if(classify(name) > 'INITIAL') { %>, <%= classify(name) %>State<% } %> } from './<%= dasherize(name) %>.state';

export function <%= camelize(name) %>Reducer(state = INITIAL_<%= toUpperCase(underscore(name)) %>_STATE, action: <%= classify(name) %>Actions): <%= classify(name) %>State {
  switch (action.type) {
    case Initialize<%= classify(name) %>Action.TYPE:
      return {
        ...state,
        ...action.dto,
      };

    default:
      return state;
  }
}
