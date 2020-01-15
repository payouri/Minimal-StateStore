import { _KEY, getDiffs } from './getDiffs'

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
    const fn9 = jest.fn(() => getDiffs({
        arr: [
            {
                'aaa': 10
            }
        ],
    }, {
        arr: [
            {
                'aaa': 8
            },
        ]
    }))
    fn9()
    expect(fn9).toHaveReturnedWith({
        arr: [
            {
                'aaa': 8
            },
        ]
    })
})