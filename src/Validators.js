export const frenchPhone = RegExp(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
export const email = RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z](?:[a-zA-Z-]{0,61}[a-zA-Z])?(?:\.[a-zA-Z](?:[a-zA-Z-]{0,61}[a-zA-Z])?)*$/)
export const frenchZipcode = RegExp(/^\d{5}(?:[-\s]\d{4})?$/)
export const frenchSiren = RegExp(/((\d|\s){9,})$/)

export const RegExpValidators = {
    frenchPhone,
    email,
    zipcode,
    siren,
}

export default {
    frenchPhone,
    email,
    zipcode,
    siren,
    RegExpValidators
}