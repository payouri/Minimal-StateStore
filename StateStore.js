'use strict';

const Validators = {
  PHONE: /^((0[1-9])|(\+[1-9]{2,3}))((([0-9]{2}){4})|(( [0-9]{2}){4})|((-[0-9]{2}){4}))$/,
  EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  ZIPCODE: /^\d{5}$/,
}
Object.defineProperty(Validators, 'testVal', {
  
  value: (validName, val) => Validators[validName] instanceof RegExp && Validators[validName].test(val),
  enumerable: false,
  writable: false,
  
});

class StateStore {
  constructor({ model, handlers, state = {}, lousyModel = false } = {}) {

    this._model = StateStore.initModel(model, { lousyModel });
    this._state = StateStore.initState(this, state);
    this._handlers = StateStore.initHandlers(handlers);
    
  }
  static initModel(model = {}, { lousyModel }) {
    if(Object.keys(model).length > 0) {
      const m = { };
      Object.defineProperties(m, {
        '_lousy': {
          value: lousyModel,
          enumerable: false,
        },
        'checkValid': {
          value: function(prop, value) {

            if(this._lousy && !this[prop])
              return true;

            else if(!this._lousy && !this[prop])
              return false;

            else {
              if(Array.isArray(this[prop]) && (this[prop].indexOf(value) > -1 || this[prop].indexOf(typeof value) > -1)) 
                return true;
              
              else if(Validators[model[prop]])
                return Validators.testVal(model[prop], value);
              
              else if(model[prop] instanceof RegExp && model[prop].test(value))
                return true;

              else if(typeof model[prop] == 'string' && typeof value === model[prop])
                return true;
                
              else
                return false;
            }

          },
          writable: false,
          enumerable: false,
        }
      })
      for(let prop in model) {
        m[prop] = model[prop];
      }
      return m;
    }
    return null;
  }
  static initHandlers(obj = {}) {
    const h = {};
    for(let prop in obj) {
      if(typeof obj[prop] == 'function') {
        const handlerName = StateStore._getHandlerName(prop);
        h[handlerName] = obj[prop];
      } else {
        console.warn(prop + obj[prop].toString() + ', is not a valid handler')
      }
    }
    return h;
  }
  static _getHandlerName(name) {
    return `on${name[0].toUpperCase() + name.substring(1)}StateChange`
  }
  static initState(instance, state) {
    return new Proxy(state || instance._state || {}, {
      set: (rawStateObj, prop, value) => {
        
        const oldValue = rawStateObj[prop] ? rawStateObj[prop] : null,
              model = instance._model;
        
        if(!model || model.checkValid(prop, value))
          rawStateObj[prop] = value;
        
        const handlerName = StateStore._getHandlerName(prop);
        
        typeof instance._handlers[handlerName] == 'function' && 
          instance._handlers[handlerName]({oldValue, value: rawStateObj[prop]});
        
        return true;
        
      },
      get: (rawStateObj, prop) => {

        return rawStateObj[prop] ? rawStateObj[prop] : null;

      }
    })
  }
  deleteHandler(state) {
    delete this._handlers[StateStore._getHandlerName(state)];
  }
  setHandler(state, handler) {
    if(typeof handler == 'function') {
      this._handlers[StateStore._getHandlerName(state)] = handler;
      return true;
    }
    else
      return false;
  }
  get handlers() {
    return this._handlers ? this._handlers : {};
  }
  get state() {
    return { ...this._state };
  }
  set state(val) {
    console.warn('cannot set state using StateStoreInstance.state use StateStoreInstance.setState instead');
    return false;
  }
  setState(stateObj, callback) {
    if(typeof stateObj == 'object') {
      
      const oldState = { ...this._state };
      
      for(let state in stateObj) {
        this._state[state] = stateObj[state];
      }
      
      typeof callback == 'function' && callback({ oldState, state: {...this._state}});
      
      return true
    } 
    else
      return false;
  }
} 
// const s = new StateStore({
//   state: {
//     test: 123,
//   },
//   model: {
//     test: 'number',
//     phone: 'PHONE',
//   },
//   lousyModel: false,
//   handlers: {
//     test: (test) => { console.log('dsqdq', test) }
//   }
// });

// s.setState({ qdqd: 232, test: 'dqsdq', phone: '0677332211'}, stateObj => {
//   console.log(stateObj)
// })