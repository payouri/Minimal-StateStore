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

##State, Model and Handlers relationship

##State Property
The state property allow you to store initial values while initializing the store
States can be updated using the stateStoreInstance.setState method, they can also be retrieved using the stateStoreInstance.state property

##Model Property
The model property allow you to validate data before setting state
It can be a regexp or a function

###LousyModel property
if stateStoreInstance is initialized with new StateStore({..., lousyModel: true}) it will be possible to update states that werent declared on stateStoreInstance init

##Handlers Property
