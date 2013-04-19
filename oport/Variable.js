var Variable = function(label) {
  this.label = label;
  this.start = 0;
  this.end = 100;
  this.resolution = 1;
  this.value = 0;
  this.clamped = false;
  this.controlled = false;
};

Variable.prototype = {
  /**
   * set the domain for this variable, plus the
   * resolution at which it should be traversed.
   */
  setDomain: function(start, end, resolution) {
    this.start = start;
    this.end = end;
    this.resolution = resolution;
  },
  /**
   * mark this variable as control variable (or not)
   */
  setControlled: function(c) {
    this.controlled = c;
    this.clamped = !controlled;
  },
  /**
   * clamp the value for this variable
   */
  clamp: function(v) {
    this.clamped = true;
    this.value = v;
  },    
  /**
   * release this variable
   */
  unclamp: function() { this.clamped = false; }
};
