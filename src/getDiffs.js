
export const _KEY = Symbol.for('StateStore.key')

export const getDiffs = (o1, o2) => {
    return Object.keys(o2).reduce((diff, key) => {
        if (Array.isArray(o1[key]) && Array.isArray(o2[key])) {
            const arr1 = o1[key]
            const arr2 = o2[key]
            if (arr1.length !== arr2.length) {
                return {
                    ...diff,
                    [key]: o2[key],
                }
            } else {
                for (let i = 0, n = arr1.length; i < n; i++) {
                    if (arr1[i] === arr2[i] ||
                        (typeof arr1[i][_KEY] !== 'undefined' &&
                            arr1[i][_KEY] === arr2[i][_KEY])) {
                        continue
                    } else {
                        return {
                            ...diff,
                            [key]: o2[key],
                        }
                    }
                }
                return diff
            }
        }
        if (o1[key] === o2[key]) return diff
        return {
            ...diff,
            [key]: o2[key]
        }
    }, {})
}

export default {
    _KEY,
    getDiffs
}