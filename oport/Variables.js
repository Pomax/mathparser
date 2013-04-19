var Variables = function() {
  this.controlled = false;
  this.varpool = new Dictionary();
  this.active = new Dictionary();
};

Variables.prototype = {
  /**
   * Get a variable
   */
  get: function(label) { return this.active.get(label); },    
  /**
   * Add a variable, but only if its label is non-whitespace.
   */
  add: function(variable) {
    var label = variable.label;
    if(label.match(/^[a-zA-Z0-9]+$/)==null) return false;
    // already in the varpool? recycle
    var _tmp = this.varpool.get(label);
    if(_tmp) { variable = _tmp; }
    else { this.varpool.put(label, variable); }
    return this.active.put(label, variable);
  },
  /**
   * More convenient than the keySet() method.
   */
  getKeys: function() { return this.active.keys; },
  /**
   * More convenient than the values() method.
   */
  getValues: function() { return this.active.values(); },
  /**
   * Make this variable for the indicated label
   * the control variable. Every other variable
   * will be treated as a clamped value.
   */
  setControlled: function(label) {
    var controlled = this.controlled;
    if(controlled) { controlled.setControlled(false); }
    controlled = active.get(label);
    controlled.setControlled(true);
  },
  /**
   * Get the name/value set for these variables
   */
  getNameValueSet: function() { return new NameValueSet(this, this.getKeys()); },
  /**
   * Check whether this variable is known
   */
  contains: function(label) { return (this.active.get(label)!=false); },
  /**
   * Update a variable's properties
   */
  update: function(label, min, max, resolution, value) {
    var v = this.active.get(label);
    if(!v) { v = new Variable(label); this.add(v); }
    v.setDomain(min, max, resolution);
    v.value = value;
  },    
  /**
   * Create and add new variables for any entry in
   * the passed list not already in the set.
   */
  allocate: function(allocate) {
    var alias = this,
        active = this.active;
    allocate.forEach(function(s) {
      if(!active.get(s)) {
        alias.add(new Variable(s));
      }
    });
  },
  /**
   * Remove all variables that match the prune list
   */
  prune: function(prune) {
    var active = this.active;
    prune.forEach(function(s){
      active.remove(s);
    });
  }
};
