var NumberNode = function(value) { this.value = parseFloat(value); };
NumberNode.prototype = new FunctionTree();
NumberNode.prototype.nf = function(val) {
  var cap = (""+val).length-1-(""+(val|0)).length;
  if(cap<0) cap=0;
  return val.toFixed(cap);
};
NumberNode.prototype.evaluate = function() { return this.value; };
NumberNode.prototype.toString = function() { return /*"num:" +*/ this.nf(this.value); };
NumberNode.prototype.toLaTeX = function() { return "{" + this.nf(this.value) + "}"; };
NumberNode.prototype.getParameters = function() { return []; };
NumberNode.prototype.derive = function(varname) { return this; };

var SimpleNode = function(label) { this.label = label; };
SimpleNode.prototype = new FunctionTree();
SimpleNode.prototype.evaluate = function() {
  if(arguments.length==1) return this.evaluate$1(arguments[0]);
  if(arguments.length==2) return this.evaluate$2(arguments[0], arguments[1]);
  return false; }
SimpleNode.prototype.evaluate$1 = function(v) { return v; };
SimpleNode.prototype.evaluate$2 = function(var_names, values) {
  for(var i=0, last=var_names.length; i<last; i++) {
    if(var_names[i] == this.label) {
      return values[i]; }}
  return false; };
SimpleNode.prototype.getParameters = function() { return [this.label]; };
SimpleNode.prototype.toString = function() { return /*"var:"+*/ this.label; };
SimpleNode.prototype.toLaTeX = function() { return this.label; };

var ConstantNode = function(label, value) { this.label = label; this.value = value; };
ConstantNode.prototype = new NumberNode();


var ConstantNode_pi = function() {};
ConstantNode_pi.prototype = new ConstantNode("π", Math.PI);
ConstantNode_pi.prototype.toLaTeX = function() { return "π"; };


var ConstantNode_e = function() {};
ConstantNode_e.prototype = new ConstantNode("e", Math.E);
ConstantNode_e.prototype.toLaTeX = function() { return "e"; };


// builder functions
var isNumber = function (n) { return n == parseFloat(n); };
var getSimpleNode = function(term) {
  if(term == "π") return new ConstantNode_pi();
  if(term == "pi") return new ConstantNode_pi();
  if(term == "e") return new ConstantNode_e();
  if(isNumber(term)) return new NumberNode(term);
  return new SimpleNode(term); };
