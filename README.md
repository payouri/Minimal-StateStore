# Minimal-StateStore
Store data and trigger handlers on state update
Optional data validation
12.1kb minified
Uses ES6 Proxy
![can i use proxy table](https://caniuse.bitsofco.de/image/proxy.png)

```javascript
const stateStore = new StateStore({
  namespace: String, //optional store name
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
    shallowValidation: Boolean, // default to false
  },
  onStateChange: Function, // triggered only if the new state is different from the previous one
  onValidationFail: Function // triggered when a state fail model validation 
});
```

## npm scripts
```javascript
{
    "build": "node ./node_modules/webpack/bin/webpack.js --config ./webpack.config.js ./src/index.js",
    "generate-docs": "node_modules/.bin/jsdoc --configure .jsdoc.json --verbose",
    "test": "jest",
    "test-verbose": "jest --coverage --config ./jest.config.js"
}
```

## State, Model and Handlers relationship
setState => Model Validation() => State Update => Trigger Handler

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
### modelOptions.shallowValidation property
if stateStoreInstance is initialized with new StateStore({..., modelOptions = { shallowValidation: true, }}) it will be possible to update states that were not declared on stateStoreInstance init

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
### toggleShallowValidation
toggleShallowValidation allow you to switch the mode of state validation
when the value is true, state not declared in the model will be updatable
when set to false only the properties set to false only state declared in the model will be updatable
```javascript
  const enabled = stateStore.toggleShallowValidation
  console.log(enabled) //true || false
```
### on
```javascript
  const onStateChange = event => void console.log(event)
  stateStoreInstance.on('statechange', onStateChange)
```
### off
```javascript
  stateStoreInstance.off('statechange', onStateChange)
```
### setModelField
```javascript
  stateStoreInstance.setModelField('fieldname', fieldModel)
  console.log(stateStoreInstance.model.fieldname) // fieldModel
```
### unsetModelField
```javascript
  stateStoreInstance.unsetModelField('fieldname')
  console.log(stateStoreInstance.model.fieldname) // undefined
```
### setHandler
  add state handler
```javascript
  stateStoreInstance.setHandler('fieldname', Function)
```
### unsetHandler
  remove state handler
```javascript
  stateStoreInstance.unsetModelField('fieldname')
```

## Events
### created
created event is fired when new StateStore instance is created
```javascript
  stateStoreInstance.on('created', event => {
    console.log(event.detail) // { state: initial state, storeName: name of the created store }
  })
```
### statechange
statechange event is fired when the previous state is different form the current state
```javascript
  stateStoreInstance.on('statechange', event => {
    console.log(event.detail) // { state: current state, oldState: previous state, differences: states that changed }
  })
```
### validationfail
validationfail event is fired when a state update has failed model validation
```javascript
  stateStoreInstance.on('validationfail', event => {
    console.log(event.detail) // { state: state that failed to update, rejected: value that failed to validate }
  })
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

const enabled = stateStore.toggleShallowValidation()
console.log(enabled) // true
stateStore.setState({
  age: 18
},  ({ differences, oldState, state }) => {
  console.log(difference) // { age: '18' }
  console.log(oldState) // { name: 'John Doe' }
  console.log(state) // { name: 'John Doe', age: 18 }
})

```