/** @module StateStore */
import { EventDispatcher } from './EventDispatcher'
import { StateModel } from './StateModel'
import { _KEY, getDiffs } from './getDiffs'

const createCreatedEvent = params => new CustomEvent('created', { detail: params })
const createStateChangeEvent = params => new CustomEvent('statechange', { detail: params })
const createValidationFailEvent = params => new CustomEvent('validationfail', { detail: params })

/**
 * @description Types of events a store can fire.
 * @enum {string} EventTypes
 * @readonly
*/
const eventTypes = {
    /** created */
    CREATED: 'created',
    /** statechange */
    STATE_CHANGE: 'statechange',
    /** validationfail */
    VALIDATION_FAIL: 'validationfail'
}

export const Stores = {

}
/**
 * @typedef {Object} StateStoreInit
 * @property {String} [namespace=""] 
 * @property {Object.<string, any>} [state={}] initial state object
 * @property {Object.<string, (string|Array|Function)>} [model] initial model validation object
 * @property {Object.<string, Function>} handlers
 * @property {Function} onStateChange callback function called on each state change
 * @property {Function} onValidationFail callback function called when a state update is rejected because of model validation fail
 * @property {Object} modelOptions 
 * @property {Boolean} [modelOptions.shallowValidation=false]
*/
/**
 * @typedef {Object} StateChangeObj
 * @property {any} oldValue state previous value
 * @property {any} value state current value
*/
/**
 * @typedef {[String, StateChangeObj]} StateChangeTuple
 * First element is the state property that has been modified.
 * The second is an object of type {@link StateChangeObj StateChangeObj}.
*/
/**
 * Allows to store data and trigger handlers when values are modified.
*/
export class StateStore {
    /**
     * @static
     * @description Contains all created instances of StateStore.
     * @type {StateStore[]} Stores
    */
    static Stores = Stores
    /**
     * @static
     * @description If set, invalid operations will be logged in the console.
     * @type {Boolean}
    */
    static enableWarnings = false
    /**
     * @description Create a Proxy object that use {@link module:StateModel~checkValid} before assigning new values
     * @param {StateStore} instance StateStore Instance.
     * @param {StateStoreInit.state} state StateStore._state initial properties
     * 
     * @returns {Proxy}
     */
    static _initState(instance, state) {
        return new Proxy(state, {
            set: (rawStateObj, prop, value) => {
                const oldValue = typeof rawStateObj[prop] !== 'undefined' ? ({ ...rawStateObj })[prop] : null,
                    model = instance._model
                if (!model.fields || model.checkValid(prop, value)) {
                    rawStateObj[prop] = value
                    instance._changedState.push([prop, { oldValue, value: rawStateObj[prop] }])
                } else {
                    /**
                     * @fires validationfail 
                    */
                    instance._eventStore.dispatchEvent(createValidationFailEvent({ state: prop, rejected: value }))
                    typeof instance._onValidationFail == 'function' && instance._onValidationFail({ state: prop, rejected: value })
                    if (StateStore.enableWarnings) {
                        console.warn(`${value} isn't a valid value for ${prop} field`)
                    }
                }
                return true
            },
            get: (rawStateObj, prop) => {
                return typeof rawStateObj[prop] !== 'undefined' ? rawStateObj[prop] : null
            }
        })
    }
    /**
     * 
     * @param {StateStoreInit.model} handlers 
     * 
     * @returns {Object.<string, Function>}
    */
    static _initHandlers(handlers) {
        const h = {}
        for (const handler in handlers) {
            if (typeof handlers[handler] == 'function') {
                h[handler] = handlers[handler]
            } else if (StateStore.enableWarnings) {
                console.warn(`${handler}:${handlers[handler].toString()} is not a valid handler`)
            }
        }
        return h
    }
    /**
     * @constructor
     * @param {StateStoreInit}
    */
    constructor({ namespace = '', state = {}, model, modelOptions = { shallowValidation: false, }, handlers, onStateChange, onValidationFail } = {}) {
        this._storeName = namespace || 'store-' + Object.keys(StateStore.Stores).length
        this._eventStore = new EventDispatcher()
        this._state = StateStore._initState(this, state)
        this._model = new StateModel(model, modelOptions)
        this._handlers = StateStore._initHandlers(handlers)
        /** @type {StateChangeTuple[]} */
        this._changedState = []
        this._onStateChange = onStateChange
        this._onValidationFail = onValidationFail
        StateStore.Stores[this._storeName] = this
        /**
         * @fires created 
        */
        this._eventStore.dispatchEvent(createCreatedEvent({ state: { ...this._state }, storeName: this._storeName }))
    }
    /*     dismantle() {
            this._eventStore.removeEventListeners()
            this._state = StateStore._initState(this, {})
            this._model = new StateModel({}, { lousyValidation: false, })
            this._handlers = StateStore._initHandlers({})
            this._changedState = []
            this._onStateChange = undefined
            this._onValidationFail = undefined
        } */
    /**
     * @method toggleShallowValidation
     * @description Toggle {@link module:StateModel~shallow stateStore.model.shallow} property
     * 
     * @returns {Boolean} model new shallow value  
    */
    toggleShallowValidation() {
        this._model.toggleShallow()
        return this._model.shallow
    }
    /**
     * @method on
     * @description Add a listener. See {@link module:StateStore~eventTypes eventTypes} for the complete list of events. 
     * 
     * @param {String} event 
     * @param {Function} fn 
    */
    on(event, fn) {
        this._eventStore.addEventListener(event, fn)
    }
    /**
     * @method off
     * @description Remove a listener. See {@link module:StateStore~eventTypes eventTypes} for the complete list of events. 
     * 
     * @param {String} event 
     * @param {Function} fn 
    */
    off(event, fn) {
        this._eventStore.removeEventListener(event, fn)
    }
    set onStateChange(fn) {
        if (typeof fn == 'function')
            return this._onStateChange = fn
        else if (StateStore.enableWarnings)
            console.warn(`${fn} is not a function`)
    }
    /**
     * @description Called after state modification.
     * @member {Function} [onStateChange=undefined]
    */
    get onStateChange() {
        return this._onStateChange
    }
    set onValidationFail(fn) {
        if (typeof fn == 'function')
            return this._onValidationFail = fn
        else if (StateStore.enableWarnings)
            console.warn(`${fn} is not a function`)
    }
    /**
     * @description Called when a value fails validation test.
     * @member {Function} [onValidationFail=undefined]
    */
    get onValidationFail() {
        return this._onValidationFail
    }
    /**
     * @readonly
     * @description Get current state model {@link module:StateModel~fields fields}.
     * @member {Object.<string, (String|Array|Function)>} model
    */
    get model() {
        return this._model.fields
    }
    /**
     * @readonly
     * @description Get current state handlers.
     * Set handlers property after initialization using {@link module:StateStore~setHandler StateStoreInstance.setHandler}.
     * @member {Object.<string, Function>} handlers
    */
    get handlers() {
        return this._handlers
    }
    /**
     * @member {Object.<string, any>} state
     * @description Get current state values. 
     * To set store inner state object use instead {@link module:StateStore~setState StateStoreInstance.setState}.
     * @readonly
    */
    get state() {
        return { ...this._state }
    }
    set state(val) {
        if (StateStore.enableWarnings)
            console.warn('cannot set state using StateStoreInstance.state use StateStoreInstance.setState instead')
        return false
    }
    /**
     * @method unsetModelField
     * @description Unset an existing model field.
     * @param {String} field 
    */
    unsetModelField(field) {
        this._model.unsetField(field)
    }
    /**
     * @method setModelField
     * @description Set a model field property.
     * @param {String} field 
     * @param {String|Array|Function} model 
     */
    setModelField(field, model) {
        this._model.setField(field, model)
    }
    /**
     * @method unsetHandler
     * @description Unset state property handler function.
     * @param {String} state 
     */
    unsetHandler(state) {
        this._handlers[state] = null
    }
    /**
     * @method setHandler
     * @description Set state property handler function.
     * @param {String} state 
     * @param {Function} handler 
     */
    setHandler(state, handler) {
        if (typeof handler == 'function') {
            this._handlers[state] = handler;
            return true;
        }
        else {
            if (StateStore.enableWarnings)
                console.warn(`cannot set ${state} handler ${handler.toString()} isn't a valid function`);
            return false;
        }
    }
    /**
     * @method clearState
     * @description Unset all state properties by default, if a stateObj is given replace
     * current state obj with the provided stateObj.
     * 
     * @param {Object.<string, any>} [stateObj={}] values the store should be reset to
     * @param {Function} [callback] function called after the store has been cleared
     */
    clearState(stateObj = {}, callback) {
        this._state = StateStore._initState(this, stateObj)
        typeof callback == 'function' && callback()
    }
    /**
     * @method setState
     * @description Set new state value if validation is successful
     * @param {Object.<string, any>} stateObj 
     * @param {Function} [callback] 
     */
    setState(stateObj, callback) {
        if (typeof stateObj == 'object') {

            const oldState = { ...this._state }

            for (let state in stateObj) {
                if (Array.isArray(stateObj[state]))
                    this._state[state] = stateObj[state].map((item, index) => {
                        item[_KEY] = item._KEY ? item._KEY : item[_KEY] ? item[_KEY] : `${index}_${(new Date).getTime().toString(16)}`
                        return item
                    })
                else
                    this._state[state] = stateObj[state]
            }

            const state = { ...this.state }

            // triggers state corresponding handler
            if (this._changedState.length > 0) {
                for (let i = 0, n = this._changedState.length; i < n; i++) {
                    const [stateName, values] = this._changedState[i]
                    typeof this._handlers[stateName] == 'function' && this._handlers[stateName]({ ...values, store: state })
                }
                // reset changed state array
                this._changedState = []
            }

            const diffs = getDiffs(oldState, state)

            if (Object.keys(diffs).length > 0) {
                this._eventStore.dispatchEvent(createStateChangeEvent({ oldState, state, differences: diffs }))
                typeof this._onStateChange == 'function' && this._onStateChange({ oldState, state, differences: diffs })
            }

            typeof callback == 'function' && callback({ oldState, state, differences: diffs })

            return true
        }
        else {
            if (StateStore.enableWarnings)
                console.warn(`${stateObj} isn't an object`)
            return false
        }
    }
}

export default StateStore