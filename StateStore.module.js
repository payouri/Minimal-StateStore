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
/**
 * @typedef StateStoreModel
 * @property {Object} Model object to validate
 * @property {Function} checkValid
 */
/**
 * @typedef {class} StateStore
 */
class StateStore {
  constructor({ model, handlers, state = {}, lousyModel = false, enableWarnings = false } = {}) {

    /**
     * @property {StateStoreModel} 
    */
    this._model = StateStore.initModel(model, { lousyModel });
    this._state = StateStore.initState(this, state);
    this._handlers = StateStore.initHandlers(handlers);
    
    StateStore.enableWarnings = enableWarnings;

  }
  /**
   * 
   * @typedef {object} ModelOpts  
   * @property {boolean} lousyModel 
   */
  /**
   * 
   * @param {Object} model 
   * @param {ModelOpts} ModelOptions 
   */
  static initModel(model = {}, { lousyModel = false }) {
    if(Object.keys(model).length > 0) {
      const m = { };
      Object.defineProperties(m, {
        '_lousy': {
          value: lousyModel,
          enumerable: false,
        },
        'checkValid': {
          value: function(prop, value, fields) {

            const propToValidate = fields && fields[prop] || this[prop];

            if(this._lousy && !propToValidate)
              return true;

            else if(!this._lousy && !propToValidate)
              return false;

            else {
              if(typeof propToValidate == 'object' && !Array.isArray(propToValidate)) {
                for(let p in propToValidate) {
                  if(!this.checkValid(p, value[p], propToValidate))
                    return false;
                }
                return true;
              }
              else if(Array.isArray(propToValidate) && (propToValidate.indexOf(value) > -1 || propToValidate.indexOf(typeof value) > -1)) 
                return true;
              
              else if(Validators[propToValidate])
                return Validators.testVal(propToValidate, value);
              
              else if(propToValidate instanceof RegExp && propToValidate.test(value))
                return true;

              else if(typeof propToValidate == 'string' && typeof value === propToValidate)
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
      } else if(StateStore.enableWarnings) {
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
        
        const oldValue = rawStateObj[prop] ? ({...rawStateObj})[prop] : null,
              model = instance._model;

        if(!model || model.checkValid(prop, value))
          rawStateObj[prop] = value;
        else if(StateStore.enableWarnings)
          console.warn(`${value} isn't a valid value for ${prop} property`);
        
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
    else {
      if(StateStore.enableWarnings)
        console.warn(`cannot set ${state} handler ${handler.toString()} isn't a valid value`);
      return false;
    }
  }
  get handlers() {
    return this._handlers ? this._handlers : {};
  }
  get state() {
    return { ...this._state };
  }
  set state(val) {
    if(StateStore.enableWarnings)
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
    else {
      if(StateStore.enableWarnings)
        console.warn(`${stateObj} isn't an object`);
      return false;
    }

  }
  clearState(callback, initValues = {}) {

    
    this._state = StateStore.initState(this, initValues)

    typeof callback == 'function' && callback({ ...this._state });

  }
}

export default StateStore;