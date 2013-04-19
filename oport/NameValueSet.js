/**
 * Wrapped dictionary
 */
var NameValueSet = function(variables, keys) {
  this.dictionary = new Dictionary();
  this.controlPosition = -1;
  for(var i=0, end=keys.length, v, key; i<end; i++) {
    key = keys[i];
    v = variables.get(key);
    if(v.controlled) { this.controlPosition = i; }
    dictionary.put(v.label,v.value);
  };
}

NameValueSet.prototype = {
  getNames: function() { return this.dictionary.names; },
  getValues: function() { return this.dictionary.values; },
  getControlPosition: function() { return this.controlPosition; }
};
