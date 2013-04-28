var FunctionTree = function() {};

FunctionTree.prototype = {
  left: false,
  right: false,
  // check for right/left children
  hasRight: function() { return this.right!=false; },
  hasLeft: function() { return this.left!=false; },
  // set the child nodes.
  setLeaves: function(l, r) { this.left = l; this.right = r; },
  // check whether this tree has its leaved instantiated.
  hasLeaves: function() { return (this.left && this.right); },
  /**
   * Evaluate the mathematical expression modelled
   * by this tree, by substituting all variables
   * in the [var_names] array with the corresponding
   * values in the [values] array.
   */
  evaluate: function(var_names, values) {},
  /**
   * for numbers/constants (if no args) and variables (if arg)
   */
  evaluate: function(v) { return false; },
  /**
   * Returns the list of free parameters used in this function
   */
  getParameters: function() {
    var free = [];
    this.addParametersFromChild(free, this.left);
    this.addParametersFromChild(free, this.right);
    return free;
  },
  // helper method
  addParametersFromChild: function(list, child) {
    if(child) {
      var free = child.getParameters();
      free.forEach(function(s){
        if(list.indexOf(s)>-1) return;
        list.push(s);
      });
    }
  },
  /**
   * generate plot data.
   * clamps: [{label:<str>,value:<num>},...]
   */
  plot: function(varname, start, end, step, clamps) {
    var data = [],
        values = [],
        var_names = [varname],
        v;
    clamps = clamps || [];
    clamps.forEach(function(clamp){
      var_names.push(clamp.label);
      values.push(clamp.value);
    });
    for(var i=start; i<=end; i+=step) {
      v = this.evaluate(var_names, [i].concat(values));
      data.push([i, v]);
    }
    return data;
  },
  /**
   * replace a variable with name [varname] with [replacement]
   */
  replace: function(varname, replacement) {
    var left = this.left, right = this.right;
    if(left && left instanceof SimpleNode && left.label===varname) { this.left = replacement; }
    if(right && right instanceof SimpleNode && right.label===varname) { this.right = replacement; }
  }
};
