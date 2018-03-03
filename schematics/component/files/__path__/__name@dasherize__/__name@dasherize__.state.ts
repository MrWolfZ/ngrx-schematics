export interface <%= classify(name) %>Dto {

}

export interface <%= classify(name) %>State extends <%= classify(name) %>Dto {

}

export const INITIAL_<%= toUpperCase(underscore(name)) %>_STATE: <%= classify(name) %>State = {

};
