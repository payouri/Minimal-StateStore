import { Validators } from './Validators'

export class StateModel {
    constructor(fields = null, { lousyValidation = false } = {}) {
        this._lousy = !!lousyValidation
        this._fields = fields
    }
    toggleLousy() {
        this._lousy = !this._lousy
    }
    destroyFields() {
        this._fields = null
    }
    unsetModel(model) {
        delete this._fields[model]
    }
    setModel(model, value) {
        if(!this._fields) {
            this._fields = {}
        }
        this.fields[model] = value
    }
    get fields() {
        return this._fields ? { ...this._fields } : null
    }
    checkValid(prop, value, fields) {

        const propToValidate = typeof fields == 'object' && fields[prop] || this._fields[prop]

        if (this._lousy && !propToValidate)
            return true

        else if (!this._lousy && !propToValidate)
            return false

        else {
            if (typeof propToValidate == 'object' && !Array.isArray(propToValidate)) {
                for (let p in propToValidate) {
                    if (!this.checkValid(p, value[p], propToValidate))
                        return false
                }
                return true
            }
            else if (Array.isArray(propToValidate) && (propToValidate.indexOf(value) > -1 || propToValidate.indexOf(typeof value) > -1))
                return true
            else if (Validators[propToValidate])
                return Validators.testVal(propToValidate, value)
            else if (typeof propToValidate == 'function') {
                return propToValidate(value)
            }
            else if (propToValidate instanceof RegExp && propToValidate.test(value))
                return true
            else if (typeof propToValidate == 'string' && typeof value === propToValidate)
                return true
            else
                return false
        }

    }
}

export default StateModel