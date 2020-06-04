/** @module EventDispatcher */

/** 
 * Mimic DOM Element event binding.
 * Purpose is to be able to attach listener to js object 
*/
export class EventDispatcher {

    constructor() {
        this._listeners = []
        this.hasEventListener = this.hasEventListener.bind(this)
        this.addEventListener = this.addEventListener.bind(this)
        this.removeEventListener = this.removeEventListener.bind(this)
        this.dropEventListeners = this.dropEventListeners.bind(this)
        this.dispatchEvent = this.dispatchEvent.bind(this)
    }

    /**
     * @method hasEventListener
     * @description Indicated if a listener function is already registered for a specific event.
     * 
     * @param {String} type 
     * @param {Function} listener 
     * @returns {Boolean}
     */
    hasEventListener(type, listener) {
        return this._listeners.some(item => item.type === type && item.listener === listener)
    }

    /**
     * @method addEventListener
     * @description Add a listener for a specific event type.
     * 
     * @param {String} type event type
     * @param {Function} listener handler function
     * @param {Boolean} once if set handler function will be called only once. 
     * 
     * @returns {EventDispatcher} Instance
     */
    addEventListener(type, listener, once) {
        if (typeof listener === 'function' && !this.hasEventListener(type, listener)) {
            this._listeners.push({ type, listener, options: { once: once ? !!once : false } })
        }
        return this
    }

    /**
     * @method removeEventListener
     * @description Remove a listener for a specific event type.
     * 
     * @param {String} type event type
     * @param {Function} listener handler function
     * 
     * @returns {EventDispatcher} Instance
     */
    removeEventListener(type, listener) {
        let index = this._listeners.findIndex(item => item.type === type && item.listener === listener)
        if (index >= 0) this._listeners.splice(index, 1)
        return this
    }

    /**
     * @method removeEventListeners
     * @description Drop all event listeners.
     * 
     * @returns {EventDispatcher} Instance
    */
    dropEventListeners() {
        this._listeners = []
        return this
    }

    /**
     * @method dispatchEvent
     * @description Call all registered listeners that match the event type.
     * 
     * @param {CustomEvent} event event to be dispatched
     * @returns {EventDispatcher} Instance.
    */
    dispatchEvent(event) {
        for(let index = 0, n = this._listeners.length; index < n; index++) {
            const { type, listener, options: { once } } = this._listeners[index]
            if(type === event.type) {
                listener.call(this, event)
                if(once === true) this.removeEventListener(type, listener)
            }
        }
        return this
    }
}