import { EventDispatcher } from './EventDispatcher'

const ed = new EventDispatcher()
const testfn = jest.fn(e => e)
const notFn = 'notFn'
const createTestEvent = () => new CustomEvent('test')
test('EventDispatcher init', () => {
    expect(ed).toBeInstanceOf(EventDispatcher)
})

test('EventDispatcher addEventListener method', () => {
    ed.addEventListener('test', testfn)
    ed.addEventListener('test', notFn)
    expect(ed.hasEventListener('test', testfn)).toBe(true)
    expect(ed.hasEventListener('test', notFn)).toBe(false)
    console.log(ed._listeners)
})

test('EventDispatcher removeEventListener method', () => {
    ed.removeEventListener('test', testfn)
    expect(ed.hasEventListener('test', testfn)).toBe(false)
})

test('EventDispatcher addEventListener once param', () => {
    ed.addEventListener('test', testfn, true)
    ed.dispatchEvent(createTestEvent())
    expect(ed.hasEventListener('test', testfn)).toBe(false)
})

test('EventDispatcher removeEventListeners method', () => {
    ed.addEventListener('test', testfn)
    ed.dropEventListeners()
    expect(ed._listeners).toStrictEqual([])
})
