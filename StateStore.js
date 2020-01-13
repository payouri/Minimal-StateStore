import { EventDispatcher } from './EventDispatcher'
import { StateModel } from './StateModel'
import { _KEY, getDiffs } from './getDiffs'

const createStateChangeEvent = params => new CustomEvent('statechange', { detail: params })

export class StateStore {
    constructor({ state = {}, model, modelOptions = { lousyValidation: false, }, handlers, onStateChange } = {}) {
        this._eventStore = new EventDispatcher()
        this._state = StateStore._initState(this, state)
        this._model = new StateModel(model, modelOptions)
        this._handlers = StateStore._initHandlers(handlers)
        this._changedState = []
        this._onStateChange = onStateChange
    }
    toggleLousyValidation() {
        this._model.toggleLousy()
        return this._model._lousy
    }
    on(event, fn) {
        this._eventStore.addEventListener(event, fn)
    }
    off(event, fn) {
        this._eventStore.removeEventListener(event, fn)
    }
    set onStateChange(fn) {
        return this._onStateChanged = fn
    }
    get onStateChange() {
        return this._onStateChange
    }
    get model() {
        return this._model.fields
    }
    get handlers() {
        return this._handlers ? this._handlers : {}
    }
    get state() {
        return { ...this._state }
    }
    set state(val) {
        if (StateStore.enableWarnings)
            console.warn('cannot set state using StateStoreInstance.state use StateStoreInstance.setState instead')
        return false
    }
    setHandler(state, handler) {
        if (typeof handler == 'function') {
            this._handlers[state] = handler;
            return true;
        }
        else {
            if (StateStore.enableWarnings)
                console.warn(`cannot set ${state} handler ${handler.toString()} isn't a valid value`);
            return false;
        }
    }
    setState(stateObj, callback) {
        if (typeof stateObj == 'object') {

            const oldState = { ...this._state }

            for (let state in stateObj) {
                if (Array.isArray(stateObj[state]))
                    this._state[state] = stateObj[state].map((item, index) => {
                        item[_KEY] = item._KEY ? item._KEY : 'key' + index
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

            const diffs = getDiffs(oldState, { ...this._state })

            if (Object.keys(diffs).length > 0) {
                typeof this._onStateChange == 'function' && this._onStateChange({ oldState, state, differences: diffs })
                this._eventStore.dispatchEvent(createStateChangeEvent({ oldState, state, differences: diffs }))
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
    static _initState(instance, state) {
        const stateMachine = new Proxy(state || instance._state || {}, {
            set: (rawStateObj, prop, value) => {
                const oldValue = typeof rawStateObj[prop] !== 'undefined' ? ({ ...rawStateObj })[prop] : null,
                    model = instance._model

                if (!model.fields || model.checkValid(prop, value)) {
                    rawStateObj[prop] = value
                    instance._changedState[instance._changedState.length] = [prop, { oldValue, value: rawStateObj[prop] }]
                } else if (StateStore.enableWarnings)
                    console.warn(`${value} isn't a valid value for ${prop} field`)

                return true

            },
            get: (rawStateObj, prop) => {
                return typeof rawStateObj[prop] !== 'undefined' ? rawStateObj[prop] : null
            }
        })
        return stateMachine
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
}

export default StateStore