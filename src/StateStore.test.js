import {
    StateStore,
    StateModel,
    _KEY
} from './index'

const onStateChange = ({
    detail
}) => detail

const onStateChangeCallback = jest.fn(({
    differences,
    oldState,
    state
}) => {
    return [differences, oldState, state]
})

StateStore.enableWarnings = true

const testProp2 = () => {
    console.log('testProp2 changed')
}
const ss = new StateStore({
    state: {
        testProp: 'aaa'
    },
    model: {
        testProp: 'string',
        testProp2: 'number',
        testProp3: ['string', 'number'],
        array: 'object',
        subObject: {
            prop1: 'number',
            prop2: 'function',
            prop3: 'boolean',
        }
    },
    handlers: {
        testProp: ('test'),
        testProp2,
    },
    onStateChange: onStateChangeCallback
})

test('StateStore constructor init with defaults', () => {
    expect(new StateStore()).toBeInstanceOf(StateStore)
})

test('StateStore constructor init', () => {
    expect(ss).toBeInstanceOf(StateStore)
})

test('StateStore state init', () => {
    expect(ss.state).toStrictEqual({
        testProp: 'aaa'
    })
    expect(ss._state.undefinedProp).toBe(null)
})

test('StateStore state is not mutable', () => {
    // console.log(ss.state = { testProp: '123' })
    ss.state = {testProp: '123'}

    StateStore.enableWarnings = true

    expect(ss.state).toStrictEqual({
        testProp: 'aaa'
    })

    StateStore.enableWarnings = false
    
    expect(ss.state).toStrictEqual({
        testProp: 'aaa'
    })

    StateStore.enableWarnings = true
})

test('StateStore model init', () => {
    expect(ss._model).toBeInstanceOf(StateModel)
})

test('stateStore toggle model validation mode', () => {
    let mode = ss.toggleShallowValidation()
    expect(mode).toBe(true)
    mode = ss.toggleShallowValidation()
    expect(mode).toBe(false)
})

test('stateStore model get fields', () => {
    expect(ss.model).toStrictEqual({
        array: 'object',
        testProp: 'string',
        testProp2: 'number',
        testProp3: ['string', 'number'],
        subObject: {
            prop1: 'number',
            prop2: 'function',
            prop3: 'boolean',
        } 
    })
})

test('StateStore handlers init', () => {
    expect(ss.handlers).toStrictEqual({
        testProp2: testProp2
    })
})

test('StateStore set handler', () => {
    ss
    expect(ss.handlers).toStrictEqual({
        testProp2: testProp2
    })
})


test('stateStore onValidationFail callback', () => {
    const fn = jest.fn(val => val)
    ss.onValidationFail = fn
    expect(ss.onValidationFail).toBe(fn)
    const badfn = ('sqdsqd')
    ss.onValidationFail = badfn
    expect(ss.onValidationFail).toBe(fn)
    
})

test('StateStore setState', () => {
    const fn = jest.fn(({
        differences,
        oldState,
        state
    }) => {
        return [differences, oldState, state]
    })
    ss.setState({
        testProp2: 14
    }, fn)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveReturnedWith([{
        testProp2: 14
    }, {
        testProp: 'aaa',
    }, {
        testProp: 'aaa',
        testProp2: 14,
    }])
    const setState = jest.fn(ss.setState)
    setState(4)
    expect(setState).toHaveReturnedWith(false)
})

test('StateStore stateChangeCallback', () => {
    ss.setState({
        testProp: 'bbbaaa'
    })
    ss.setState({
        testProp2: 'qqsqdqsd'
    })
    expect(onStateChangeCallback).toHaveBeenCalledTimes(2)
    expect(onStateChangeCallback).toHaveLastReturnedWith([{
        testProp: 'bbbaaa'
    }, {
        testProp: 'aaa',
        testProp2: 14,
    }, {
        testProp: 'bbbaaa',
        testProp2: 14,
    }])
})

test('StateStore stateChange event binding', () => {
    const fn = jest.fn(val => onStateChange(val))
    ss.on('statechange', fn)
    ss.setState({
        testProp: '444saaa'
    })
    ss.setState({
        testProp2: 'qqsqdqsd'
    })
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveLastReturnedWith({
        differences: {
            testProp: '444saaa'
        },
        oldState: {
            testProp: 'bbbaaa',
            testProp2: 14,
        },
        state: {
            testProp: '444saaa',
            testProp2: 14,
        }
    })

})

test('StateStore stateChange event unbinding', () => {
    const fn = jest.fn(val => onStateChange(val))
    ss.off('statechange', fn)
    ss.setState({
        testProp: '9999'
    })
    expect(fn).toHaveBeenCalledTimes(0)
    expect(fn).toHaveReturnedTimes(0)

})

test('StateStore addHandler method with invalid arg', () => {
    ss.setHandler('testProp3', {})
    expect(ss.handlers['testProp3']).toBeFalsy()
})

test('StateStore addHandler method', () => {
    const fn = jest.fn(({
        oldValue,
        value
    }) => [oldValue, value])
    ss.setHandler('testProp3', fn)
    ss.setState({
        testProp3: 123
    })
    expect(fn).toHaveReturnedWith([null, 123])
})

test('StateStore unsetHandler method', () => {
    ss.unsetHandler('testProp3')
    expect(ss.handlers.testProp3).toBeFalsy()
})

test('setModelField method', () => {
    ss.setModelField('propX', 'number')
    expect(ss.model.propX).toBe('number')
})
test('unsetModelField method', () => {
    ss.unsetModelField('propX')
    expect(ss.model.propX).toBeFalsy()
})

test('StateStore state mutation through dot notation does not change state', () => {
    ss.state.testProp3 = 3
    expect(ss.state.testProp3).toBe(123)
    ss.state = {}
    expect(ss.state.testProp3).toBe(123)
})

test('stateStore onStateChange callback', () => {
    const fn = jest.fn(val => onStateChange(val))
    ss.onStateChange = fn
    expect(ss.onStateChange).toBe(fn)
    const badfn = ('sqdsqd')
    ss.onStateChange = badfn
    expect(ss.onStateChange).toBe(fn)
    
})

test('stateStore clearState', () => {
    const fn = jest.fn(val => onStateChange(val))
    const cb = jest.fn(e => e)
    ss.onStateChange = fn
    ss.clearState()
    expect(ss.state).toStrictEqual({})
    ss.clearState({
        a: '12'
    }, cb)
    expect(ss.state).toStrictEqual({
        a: '12'
    })
    expect(fn).toHaveBeenCalledTimes(0)
    expect(cb).toHaveBeenCalledTimes(1)
})

test('StateStore setState array state', () => {
    const fn = jest.fn(({
        differences,
        oldState,
        state
    }) => {
        return [differences, oldState, state]
    })
    ss.setState({
        array: [
            {
                label: '1'
            },
            {
                label: '2'
            },
            {
                label: '3'
            },
            {
                label: '4',
                _KEY: 'item4'
            },
        ]
    }, fn)
    let item3 = ss.state.array[2]
    let item4 = ss.state.array[3]
    expect(item3).toMatchObject({
        label: '3'
    })
    expect(item4).toMatchObject({
        label: '4',
        [_KEY]: 'item4'
    })
    const { array } = ss.state
    array[3].label = 'new label'
    ss.setState({ array })
    item4 = ss.state.array[3]
    expect(item4).toMatchObject({
        label: 'new label',
        [_KEY]: 'item4'
    })
})