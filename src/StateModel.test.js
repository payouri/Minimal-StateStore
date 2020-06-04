import { StateModel } from './StateModel'

const sm = new StateModel(
    { 
        a: 'number',
        b: ['number', 'string'],
        c: 'boolean',
        d: {
            e: 'string',
            f: 'string',
            g: 'number',
        },
        fun: value => value % 2 === 0,
        rexp: /^[a-z]{1,}$/,
        s: [1, 2, 3, 4],
        z: value => false
    }
)

test('Model init', () => {
    expect(sm).toBeInstanceOf(StateModel)
})

test('model get lousy state', () => {
    expect(sm.shallow).toBe(false)
})

test('model add field', () => {
    sm.setField('h', RegExp(/^(?!(\d+))$/))
})

test('model remove field', () => {
    sm.unsetField('z')
})

test('model type validation', () => {
    const fn = jest.fn(() => sm.checkValid('a', 2))
    fn()
    expect(fn).toHaveReturnedWith(true)
})

test('model set validation', () => {
    const fn = jest.fn(() => sm.checkValid('s', 2))
    fn()
    expect(fn).toHaveReturnedWith(true)
    const fn2 = jest.fn(() => sm.checkValid('s', 8))
    fn2()
    expect(fn2).toHaveReturnedWith(false)
})

test('model function validation', () => {
    const fn = jest.fn(() => sm.checkValid('fun', 4))
    fn()
    expect(fn).toHaveReturnedWith(true)
    const fn2 = jest.fn(() => sm.checkValid('fun', 5))
    fn2()
    expect(fn2).toHaveReturnedWith(false)
})

test('model function validation', () => {
    const fn = jest.fn(() => sm.checkValid('fun', 4))
    fn()
    expect(fn).toHaveReturnedWith(true)
    const fn2 = jest.fn(() => sm.checkValid('fun', 5))
    fn2()
    expect(fn2).toHaveReturnedWith(false)
})

test('model RegExp validation', () => {
    const fn = jest.fn(() => sm.checkValid('rexp', 'abcdef'))
    fn()
    expect(fn).toHaveReturnedWith(true)
    const fn2 = jest.fn(() => sm.checkValid('rexp', 'abCdef'))
    fn2()
    expect(fn2).toHaveReturnedWith(false)
})

test('model field rejection', () => {
    const fn = jest.fn(() => sm.checkValid('a', '2'))
    fn()
    expect(fn).toHaveReturnedWith(false)
    const fn2 = jest.fn(() => sm.checkValid('w', '2'))
    fn2()
    expect(fn2).toHaveReturnedWith(false)
})

test('model subObject validation', () => {
    const fn = jest.fn(() => sm.checkValid('d', {
        e: 'a',
        f: 'b',
        g: 3,
    }))
    fn()
    expect(fn).toHaveReturnedWith(true)
    const fn2 = jest.fn(() => sm.checkValid('d', {
        e: 'a',
        f: 'b',
        h: '10'
    }))
    fn2()
    expect(fn2).toHaveReturnedWith(false)
    const fn3 = jest.fn(() => sm.checkValid('d', {
        e: 'a',
        f: 'b',
        g: 3,
        h: '10',
    }))
    fn3()
    expect(fn3).toHaveReturnedWith(false)
})

test('model lousy validation toggle', () => {
    let lousyMode = sm.toggleShallow()
    expect(lousyMode).toBe(true)
    lousyMode = sm.toggleShallow()
    expect(lousyMode).toBe(false)
})

test('model lousy field validation', () => {
    let lousyMode = sm.toggleShallow()
    expect(lousyMode).toBe(true)
    const fn = jest.fn(() => sm.checkValid('y', 'aaa'))
    fn()
    expect(fn).toHaveReturnedWith(true)
    const fnbis = jest.fn(() => sm.checkValid('d', {
        e: 'a',
        f: 'b',
        g: 3,
        h: '10'
    }))
    fnbis()
    expect(fnbis).toHaveReturnedWith(true)
    lousyMode = sm.toggleShallow()
    expect(lousyMode).toBe(false)
    const fn2 = jest.fn(() => sm.checkValid('y', 'aaa'))
    fn2()
    expect(fn2).toHaveReturnedWith(false)
})

test('destroy model fields', () => {
    sm.destroyFields()
    expect(sm.fields).toBeFalsy()
})

test('add fields after destroy', () => {
    sm.setField('z', 'number')
    expect(sm.fields).toStrictEqual({
        z: 'number'
    })
}) 