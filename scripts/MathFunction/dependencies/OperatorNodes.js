/**
 * Operator prototype
 */
var OperatorNode  = function(op, str){
  this.operator = op;
  this.strength = str;
};
OperatorNode.prototype = new FunctionTree();
OperatorNode.prototype.getStrength = function() { return this.strength; };
OperatorNode.prototype.toString = function() {
  var left = this.left, right = this.right;
  return (left ? left.toString() : "") + this.operator + (right ? right.toString() : "");
};
OperatorNode.prototype.toLaTeX = function() {
  return this.left.toLaTeX() + this.operator + this.right.toLaTeX();
};

/**
 * Operator type lookup
 */
var operatorNodes = {},
    unaryOperatorNodes = {};

/**
 * ...
 */
var AdditionNode = function(){};
AdditionNode.prototype = new OperatorNode("+", 1);
AdditionNode.prototype.evaluate = function(var_names, values) {
  var left = this.left, right = this.right;
  return left.evaluate(var_names, values) + right.evaluate(var_names, values);
};
operatorNodes["+"] = AdditionNode;


/**
 * ...
 */
var SubtractionNode = function(){};
SubtractionNode.prototype = new OperatorNode("-", 1);
SubtractionNode.prototype.evaluate = function(var_names, values) {
  var left = this.left, right = this.right;
  return left.evaluate(var_names, values) - right.evaluate(var_names, values);
};
operatorNodes["-"] = SubtractionNode;


/**
 * ...
 */
var MultiplicationNode = function(){};
MultiplicationNode.prototype = new OperatorNode("*", 2);
MultiplicationNode.prototype.evaluate = function(var_names, values) {
  var left = this.left, right = this.right;
  return left.evaluate(var_names, values) * right.evaluate(var_names, values);
};
MultiplicationNode.prototype.toLaTeX = function() {
  return this.left.toLaTeX() + " \\cdot " + this.right.toLaTeX();
};
operatorNodes["*"] = MultiplicationNode;


/**
 * ...
 */
var DivisionNode = function(){};
DivisionNode.prototype = new OperatorNode("/", 2);
DivisionNode.prototype.evaluate = function(var_names, values) {
  var left = this.left, right = this.right;
  return left.evaluate(var_names, values) / right.evaluate(var_names, values);
};
DivisionNode.prototype.toLaTeX = function() {
  return "\\frac{" + this.left.toLaTeX() + "}{" + this.right.toLaTeX() + "}";
};
operatorNodes["/"] = DivisionNode;


/**
 * ...
 */
var PowerNode = function(){};
PowerNode.prototype = new OperatorNode("^", 4);
PowerNode.prototype.evaluate = function(var_names, values) {
  var left = this.left, right = this.right;
  return Math.pow(left.evaluate(var_names, values), right.evaluate(var_names, values));
};
operatorNodes["^"] = PowerNode;


// builder function
var getOperatorNode = function(op) {
  if(operatorNodes[op]) {
    return new operatorNodes[op]();
  }
  return false;
};


/**
 * ...
 */
var NegativeNode = function(){};
NegativeNode.prototype = new OperatorNode("-", 3);
NegativeNode.prototype.hasLeft = function() { return false; };
NegativeNode.prototype.hasLeaves = function() { return this.right!==false; };
NegativeNode.prototype.setLeaves = function(l, r) { this.right = r; };
NegativeNode.prototype.evaluate = function(var_names, values) {
  return - this.right.evaluate(var_names, values);
};
NegativeNode.prototype.toLaTeX = function() { return "-" + this.right.toLaTeX(); };
unaryOperatorNodes["-"] = NegativeNode;


/**
 * ...
 */
var FactorialNode = function(){};
FactorialNode.prototype = new OperatorNode("!", 5);
FactorialNode.prototype.hasLeft = function() { return false; };
FactorialNode.prototype.hasLeaves = function() { return this.left!==false; };
FactorialNode.prototype.setLeaves = function(l, r) { this.left = l; };
FactorialNode.prototype.factorial = function(n) {
  // TODO: add in LUT-speedup
  if(n<=1) return 1;
  return n * this.factorial(n-1);
};
FactorialNode.prototype.evaluate = function(var_names, values) {
  var v = this.left.evaluate(var_names, values) | 0;
  return this.factorial(v);
};
FactorialNode.prototype.toLaTeX = function() { return this.left.toLaTeX()+"!"; };
unaryOperatorNodes["!"] = FactorialNode;


// builder function
var getUnaryOperatorNode = function(op) {
  if(unaryOperatorNodes[op]) {
    return new unaryOperatorNodes[op]();
  }
  return false;
};
