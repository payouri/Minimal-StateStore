/** @module StateModel */

/**
 * @typedef  
*/

/** Serves the purpose of validating data types through it's checkValid method */
export class StateModel {
    /** @constructor */
    constructor(fields = null, { shallowValidation = false } = {}) {
        this._shallow = !!shallowValidation
        this._fields = fields
    }
    /**
     * @method toggleShallow 
     * @description Toggle {@link module:StateModel~shallow shallow} property.
    */
    toggleShallow() {
        this._shallow = !this._shallow
        return this._shallow
    }
    /**
     * @readonly
     * @description Shallow property determines the StateModel Instance behaviour
     * concerning field validation when a 
     * @member shallow 
     * @type {Boolean}
    */
    get shallow() {
        return this._shallow
    }
    /**
     * @method destroyFields
     * @description Drop model fields. Cancel validation at the same time.
    */
    destroyFields() {
        this._fields = null
    }
    /**
     * @method unsetField
     * @description Unset model property.
     * @param {String} field 
    */
    unsetField(field) {
        delete this._fields[field]
    }
    /**
     * @method setField
     * @description Set fields property.
     * @param {String} field 
     * @param {String|Array|Function} value
    */
    setField(field, value) {
        if (!this._fields) {
            this._fields = {}
        }
        this._fields[field] = value
    }
    /**
     * @member {Object.<string, (String|Array|Function)>} fields
     * @description Represents the actual properties that will be tested.
    */
    get fields() {
        return this._fields ? { ...this._fields } : null
    }
    /**
     * @method checkValid
     * @description Indicates if the tested value passes model validation.
     * @param {String} prop  
     * @param {any} value 
     * @param {Object.<string, any>} [fields] 
     * 
     * @returns {Boolean} 
     */
    checkValid(prop, value, fields) {

        const propToValidate = typeof fields == 'object' && fields[prop] || this._fields[prop]

        if (this._shallow && !propToValidate)
            return true

        else if (!this._shallow && !propToValidate)
            return false

        else {
            if (Array.isArray(propToValidate) && (propToValidate.indexOf(value) > -1 || propToValidate.indexOf(typeof value) > -1))
                return true
            else if (propToValidate instanceof RegExp)
                return propToValidate.test(value)
            else if (typeof propToValidate == 'object') {
                if (Object.keys(propToValidate).length !== Object.keys(value).length && !this._shallow)
                    return false
                for (let p in propToValidate) {
                    if (!this.checkValid(p, value[p], propToValidate))
                        return false
                }
                return true
            }
            else if (typeof propToValidate == 'function')
                return propToValidate(value)
            else if (typeof propToValidate == 'string' && typeof value === propToValidate)
                return true
            else
                return false
        }

    }
}

export default StateModel