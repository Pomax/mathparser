/**
 * Simple dictionary object (synchronised lists)
 */
var Dictionary = function() {
  this.keys = [];
  this.values = [];
};

Dictionary.prototype = {
  put: function(key,value) {
    var pos = this.keys.indexOf(key);
    if(pos===-1) { this.keys.push(key); this.values.push(value); }
    else { this.values[pos] = value; }
    return value;
  },
  get: function(key) {
    var pos = this.keys.indexOf(key);
    if(pos===-1) return false;
    return this.values[pos]
  },
  remove: function(key) {
    var pos = this.keys.indexOf(key);
    if(pos===-1) return false;
    var value = this.values[pos]
    this.keys.splice(pos,1);
    this.values.splice(pos,1);
    return value;
  }
};
