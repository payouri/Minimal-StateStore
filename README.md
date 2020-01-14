# Minimal-StateStore
store data and trigger functions on value update

```javascript
const stateStore = new StateStore({
  state: {
  //data value that will be observed
  },
  model: {
  //optional validation
  },
  handlers: {
  //this property holds functions that will be called when the associated state changes
  },
  modelOptions: {
    lousyValidation: Boolean, // default to false
  },
  onStateChange: Function // triggered only if the new state is different from the previous one
});
```

## State, Model and Handlers relationship
setState => Model Validation => State Update => Trigger Handler

## State Property
The state property allow you to store initial values while initializing the store
States can be updated using the stateStoreInstance.setState method, they can also be retrieved using the stateStoreInstance.state property
exemple of initialisation:
```javascript
  state: {
    name: 'John Doe',
    age: 29,
  }
``` 
**Note:** initial values won't be checked against the model

## Model Property
The model property allow you to validate data before setting state  
It can be: 
### a regexp
```javascript
  model: {
    name: new RegExp(/.{1,}/)
  }
``` 
### a function
```javascript
  model: {
    name: value => (typeof value == 'string' && value.length < 6)
  }
```
### a type
```javascript
  model: {
    name: 'string',
    age: 'number',
    other: ['number', 'boolean'],
  }
```
### a set of values
```javascript
  model: {
    status: [0, 1, 2, 3]
  }
```
### modelOptions.lousyValidation property
if stateStoreInstance is initialized with new StateStore({..., modelOptions = { lousyValidation: true, }}) it will be possible to update states that were not declared on stateStoreInstance init

## Handlers Property
handlers function are named after state so they can be triggered when a state is updated
**Note:** Handlers will be triggered after all state modifications occurred
```javascript
  handlers: {
    name: ({ oldValue, value, store }) => {
      console.log(oldValue) // previous state value
      console.log(value) // current state value
      console.log(store) // current state of the store
    }
  }
```
## Methods
### setState
setState function is the only way to update the stored values
```javascript
stateStoreInstance.setState({
  property: value
}, ({ differences, oldState, state }) => {
  differences //object containing only the updated states
  olState //object previous state of the store
  state //object actual state of the store
})
```
### clearState
clearState function allows you to empty/reset the state without triggering any handler
```javascript
stateStoreInstance.clearState({props: 'value to reset', prop2: 'value to reset'} /* defaults to an empty object */, () => {
  //doesn't get any params
})
```
### toggleLousyValidation
toggleLousyValidation allow you to switch the mode of state validation
when the value is true, state not declared in the model will be updatable
when set to false only the properties set to false only state declared in the model will be updatable
```javascript
  const enabled = stateStore.toggleLousyValidation
  console.log(enabled) //true || false
```
## Working exemple
```javascript
const stateStore = new StateStore({
  state: {
    name: '',
  },
  model: {
    name: 'string'
  },
  handlers: {
    name: ({ oldValue, value }) => {
      alert('Hello, ' + value)
      console.log(stateStore.state.value)
    }
  },
});

stateStore.setState({
  name: 'John Doe',
  age: 18,
}, ({ differences, oldState, state }) => {
  console.log(difference) // { name: 'John Doe' }
  console.log(oldState) // { name: '' }
  console.log(state) // { name: 'John Doe' }
})

const enabled = stateStore.toggleLousyValidation()
console.log(enabled) // true
stateStore.setState({
  age: 18
},  ({ differences, oldState, state }) => {
  console.log(difference) // { age: '18' }
  console.log(oldState) // { name: 'John Doe' }
  console.log(state) // { name: 'John Doe', age: 18 }
})

```