const StateStore = require('./StateStore.cjs')


const s = new StateStore({
    state: {
        test: 123,
    },
    model: {
        test: 'number',
        phone: 'PHONE',
        test2: {
            a: 'number',
            b: [1, 2, 3],
            c: 'string',
            e: 'boolean'
        }
    },
    lousyModel: false,
    enableWarnings: true,
    handlers: {
        test: (test) => {
            console.log('dsqdq', test)
        }
    }
});

s.setState({
    qdqd: 232,
    test: 'dqsdq',
    phone: '0677332211'
}, stateObj => {
    console.log(stateObj)
})
//for sub objects adding more property than declared in the model doesn't raise an err
s.setState({
    test2: {
        a: 1000,
        b: 3,
        c: 'blabla',
        d: 'false',
        e: false
    }
}, stateObj => {
    console.log(stateObj)
})
//for sub objects if one of the declared prop model fails to validate the entire sub object will be rejected
s.setState({
    test2: {
        a: '1000',
        b: '3',
        c: 'blabla',
        d: 'false',
        e: 'false'
    }
}, stateObj => {
    console.log(stateObj)
})