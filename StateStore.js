import { EventDispatcher } from './EventDispatcher'
import { StateModel } from './StateModel'
import { _KEY, getDiffs } from './getDiffs'

const createCreatedEvent = params => new CustomEvent('created', { detail: params })
const createStateChangeEvent = params => new CustomEvent('statechange', { detail: params })
const createValidationFailEvent = params => new CustomEvent('validationfail', { detail: params })

export const Stores = {

}
export class StateStore {
    static Stores = Stores
    static _initState(instance, state) {
        return new Proxy(state || instance._state || {}, {
            set: (rawStateObj, prop, value) => {
                const oldValue = typeof rawStateObj[prop] !== 'undefined' ? ({ ...rawStateObj })[prop] : null,
                    model = instance._model
                if (!model.fields || model.checkValid(prop, value)) {
                    rawStateObj[prop] = value
                    instance._changedState[instance._changedState.length] = [prop, { oldValue, value: rawStateObj[prop] }]
                } else {
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
    constructor({ namespace = '', state = {}, model, modelOptions = { lousyValidation: false, }, handlers, onStateChange, onValidationFail } = {}) {
        this._storeName = namespace || 'store-' + Object.keys(StateStore.Stores).length
        this._eventStore = new EventDispatcher()
        this._state = StateStore._initState(this, state)
        this._model = new StateModel(model, modelOptions)
        this._handlers = StateStore._initHandlers(handlers)
        this._changedState = []
        this._onStateChange = onStateChange
        this._onValidationFail = onValidationFail
        StateStore.Stores[this._storeName] = this
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
    toggleLousyValidation() {
        this._model.toggleLousy()
        return this._model.lousy
    }
    on(event, fn) {
        this._eventStore.addEventListener(event, fn)
    }
    off(event, fn) {
        this._eventStore.removeEventListener(event, fn)
    }
    set onStateChange(fn) {
        if (typeof fn == 'function')
            return this._onStateChange = fn
        else if (StateStore.enableWarnings)
            console.warn(`${fn} is not a function`)
    }
    get onStateChange() {
        return this._onStateChange
    }
    set onValidationFail(fn) {
        if (typeof fn == 'function')
            return this._onValidationFail = fn
        else if (StateStore.enableWarnings)
            console.warn(`${fn} is not a function`)
    }
    get onValidationFail() {
        return this._onValidationFail
    }
    get model() {
        return this._model.fields
    }
    get handlers() {
        return this._handlers
    }
    get state() {
        return { ...this._state }
    }
    set state(val) {
        if (StateStore.enableWarnings)
            console.warn('cannot set state using StateStoreInstance.state use StateStoreInstance.setState instead')
        return false
    }
    unsetModelField(field) {
        this._model.unsetModel(field)
    }
    setModelField(field, model) {
        this._model.setModel(field, model)
    }
    unsetHandler(state) {
        this._handlers[state] = null
    }
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
    clearState(stateObj = {}, callback) {
        this._state = StateStore._initState(this, stateObj)
        typeof callback == 'function' && callback()
    }
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

            if (this._changedState.length > 0) {
                for (let i = 0, n = this._changedState.length; i < n; i++) {
                    const [stateName, values] = this._changedState[i]
                    typeof this._handlers[stateName] == 'function' && this._handlers[stateName]({ ...values, store: state })
                }
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