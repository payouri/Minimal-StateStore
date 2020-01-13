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
  lousyModel: Boolean // default to false
});
```

## State, Model and Handlers relationship

## State Property
The state property allow you to store initial values while initializing the store
States can be updated using the stateStoreInstance.setState method, they can also be retrieved using the stateStoreInstance.state property

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
### LousyModel property
if stateStoreInstance is initialized with new StateStore({..., lousyModel: true}) it will be possible to update states that werent declared on stateStoreInstance init

## Handlers Property
handlers function are named after state so they can be triggered when a state is updated

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
  //this property holds functions that will be called when the associated state changes
  },
  lousyModel: Boolean // default to false
});
```