import {
    getDiffs,
    StateStore,
    _KEY
} from './StateStore-v2'
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
})

test('StateStore state is not mutable', () => {
    // console.log(ss.state = { testProp: '123' })
    expect(ss.state).toStrictEqual({
        testProp: 'aaa'
    })
})

test('StateStore model init', () => {
    expect(ss.model).toStrictEqual({
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

test('StateStore model type validation', () => {
    ss.setState({
        testProp2: 2
    })
    ss.setState({
        testProp2: 'bbb'
    })
    expect(ss.state).toStrictEqual({
        testProp: 'aaa',
        testProp2: 2
    })
})

test('StateStore model field rejection', () => {
    ss.setState({
        testProp5: 2
    })
    ss.setState({
        testProp4: 'bbb'
    })
    expect(ss.state).toStrictEqual({
        testProp: 'aaa',
        testProp2: 2
    })
})

const prop2 = () => { }
test('StateStore model subObject validation', () => {
    ss.setState({
        subObject: {
            prop1: 2,
            prop2,
            prop3: false
        }
    })
    expect(ss.state).toStrictEqual({
        subObject: {
            prop1: 2,
            prop2,
            prop3: false
        },
        testProp: 'aaa',
        testProp2: 2,
    })
})

test('StateStore model lousy validation', () => {
    let lousyMode = ss.toggleLousyValidation()
    expect(lousyMode).toBe(true)
    ss.setState({
        testProp5: 2,
        testProp4: 'bbb'
    })
    expect(ss.state).toStrictEqual({
        subObject: {
            prop1: 2,
            prop2,
            prop3: false
        },
        testProp: 'aaa',
        testProp2: 2,
        testProp4: 'bbb',
        testProp5: 2
    })
    lousyMode = ss.toggleLousyValidation()
    expect(lousyMode).toBe(false)
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
        subObject: {
            prop1: 2,
            prop2,
            prop3: false
        },
        testProp: 'aaa',
        testProp2: 2,
        testProp4: 'bbb',
        testProp5: 2
    }, {
        subObject: {
            prop1: 2,
            prop2,
            prop3: false
        },
        testProp: 'aaa',
        testProp2: 14,
        testProp4: 'bbb',
        testProp5: 2
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
    expect(onStateChangeCallback).toHaveBeenCalledTimes(5)
    expect(onStateChangeCallback).toHaveLastReturnedWith([{
        testProp: 'bbbaaa'
    }, {
        subObject: {
            prop1: 2,
            prop2,
            prop3: false
        },
        testProp: 'aaa',
        testProp2: 14,
        testProp4: 'bbb',
        testProp5: 2
    }, {
        subObject: {
            prop1: 2,
            prop2,
            prop3: false
        },
        testProp: 'bbbaaa',
        testProp2: 14,
        testProp4: 'bbb',
        testProp5: 2
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
            subObject: {
                prop1: 2,
                prop2,
                prop3: false
            },
            testProp: 'bbbaaa',
            testProp2: 14,
            testProp4: 'bbb',
            testProp5: 2
        },
        state: {
            subObject: {
                prop1: 2,
                prop2,
                prop3: false
            },
            testProp: '444saaa',
            testProp2: 14,
            testProp4: 'bbb',
            testProp5: 2
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

test('StateStore state mutation through dot notation does not change state', () => {
    ss.state.testProp3 = 3
    expect(ss.state.testProp3).toBe(123)
    ss.state = {}
    expect(ss.state.testProp3).toBe(123)
})

test('getDiffs cases', () => {
    const fn = jest.fn(() => getDiffs({
        'aaa': 'aaa'
    }, {
        'aaa': 'aaaa'
    }))
    fn()
    expect(fn).toHaveReturnedWith({
        'aaa': 'aaaa'
    })
    const fn2 = jest.fn(() => getDiffs({
        'aaa': ['']
    }, {
        'aaa': ['']
    }))
    fn2()
    expect(fn2).toHaveReturnedWith({})
    const fn3 = jest.fn(() => getDiffs({
        'aaa': [1]
    }, {
        'aaa': [1]
    }))
    fn3()
    expect(fn3).toHaveReturnedWith({})
    const fn4 = jest.fn(() => getDiffs({
        'aaa': {
            'bbb': 4
        }
    }, {
        'aaa': {
            'bbb': 4
        }
    }))
    fn4()
    expect(fn4).toHaveReturnedWith({
        'aaa': {
            'bbb': 4
        }
    })
    const fn5 = jest.fn(() => getDiffs({
        'aaa': {
            'bbb': 4
        }
    }, {
        'aaa': {
            'bbb': 4
        }
    }))
    fn5()
    expect(fn5).toHaveReturnedWith({
        'aaa': {
            'bbb': 4
        }
    })
    const fn6 = jest.fn(() => getDiffs({
        arr: [{
            'aaa': {
                'bbb': 4
            },
            [_KEY]: 'abc'
        }],
    }, {
        arr: [{
            'aaa': {
                'bbb': 4
            },
            [_KEY]: 'abc'
        }]
    }))
    fn6()
    expect(fn6).toHaveReturnedWith({})
    const fn7 = jest.fn(() => getDiffs({
        arr: [{
            'aaa': {
                'bbb': 4
            },
            [_KEY]: 'abc'
        }],
    }, {
        arr: null,
    }))
    fn7()
    expect(fn7).toHaveReturnedWith({
        arr: null
    })
    const fn8 = jest.fn(() => getDiffs({
        arr: [{
            'aaa': {
                'bbb': 4
            },
            [_KEY]: 'abc'
        }],
    }, {
        arr: [{
            'aaa': {
                'bbb': 4
            },
            [_KEY]: 'ccc'
        },
        {
            'aaa': {
                'bbb': 4
            },
            [_KEY]: 'abc'
        },
        ],
    }))
    fn8()
    expect(fn8).toHaveReturnedWith({
        arr: [{
            'aaa': {
                'bbb': 4
            },
            [_KEY]: 'ccc'
        },
        {
            'aaa': {
                'bbb': 4
            },
            [_KEY]: 'abc'
        },
        ]
    })
})