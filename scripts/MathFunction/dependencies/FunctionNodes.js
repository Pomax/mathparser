/**
 *
 */
var FunctionNode = function(label) { this.label = label; };
FunctionNode.prototype = new FunctionTree();
FunctionNode.prototype.setContent = function(content) {
  this.setLeaves(false,content);
  this.content = content;
};
FunctionNode.prototype.replace = function(varname, replacement) {
  if(this.content instanceof SimpleNode && this.content.label===varname) {
    var mf = new MathFunction(replacement.toString());
    this.setContent(mf.functionTree);
  } else { this.content.replace(varname, replacement); }
};
FunctionNode.prototype.toString = function() { return /*"f:" +*/ this.label + "(" + this.content.toString() + ")"; };
FunctionNode.prototype.toLaTeX= function() { return this.label + "\\left ( " + this.content.toLaTeX() + " \\right ) "; };


/**
 *
 */
var WrapperNode = function(content) { this.setContent(content); };
WrapperNode.prototype = new FunctionNode("wrapper");
WrapperNode.prototype.toString = function() { return "(" + this.content.toString() + ")"; };
WrapperNode.prototype.toLaTeX = function() { return " \\left ( " + this.content.toLaTeX() + " \\right ) "; };
WrapperNode.prototype.evaluate = function(var_names, values) {
  return this.content.evaluate(var_names, values);
};


/**
 *
 */
var functionNodes = {};


/**
 *
 */
var FunctionNode_sin = function(content) { this.setContent(content); };
FunctionNode_sin.prototype = new FunctionNode("sin");
FunctionNode_sin.prototype.evaluate = function(var_names, values) {
  return Math.sin(this.content.evaluate(var_names, values));
};
functionNodes.sin = FunctionNode_sin;


/**
 *
 */
var FunctionNode_cos = function(content) { this.setContent(content); };
FunctionNode_cos.prototype = new FunctionNode("cos");
FunctionNode_cos.prototype.evaluate = function(var_names, values) {
  return Math.cos(this.content.evaluate(var_names, values));
};
functionNodes.cos = FunctionNode_cos;


/**
 *
 */
var FunctionNode_tan = function(content) { this.setContent(content); };
FunctionNode_tan.prototype = new FunctionNode("tan");
FunctionNode_tan.prototype.evaluate = function(var_names, values) {
  return Math.tan(this.content.evaluate(var_names, values));
};
functionNodes.tan = FunctionNode_tan;


/**
 *
 */
var FunctionNode_asin = function(content) { this.setContent(content); };
FunctionNode_asin.prototype = new FunctionNode("asin");
FunctionNode_asin.prototype.evaluate = function(var_names, values) {
  return Math.asin(this.content.evaluate(var_names, values));
};
functionNodes.asin = FunctionNode_asin;


/**
 *
 */
var FunctionNode_acos = function(content) { this.setContent(content); };
FunctionNode_acos.prototype = new FunctionNode("acos");
FunctionNode_acos.prototype.evaluate = function(var_names, values) {
  return Math.acos(this.content.evaluate(var_names, values));
};
functionNodes.acos = FunctionNode_acos;


/**
 *
 */
var FunctionNode_atan = function(content) { this.setContent(content); };
FunctionNode_atan.prototype = new FunctionNode("atan");
FunctionNode_atan.prototype.evaluate = function(var_names, values) {
  return Math.atan(this.content.evaluate(var_names, values));
};
functionNodes.atan = FunctionNode_atan;


/**
 *
 */
var FunctionNode_sinh = function(content) { this.setContent(content); };
FunctionNode_sinh.prototype = new FunctionNode("sinh");
FunctionNode_sinh.prototype.evaluate = function(var_names, values) {
  return Math.sinh(this.content.evaluate(var_names, values));
};
functionNodes.sinh = FunctionNode_sinh;


/**
 *
 */
var FunctionNode_cosh = function(content) { this.setContent(content); };
FunctionNode_cosh.prototype = new FunctionNode("cosh");
FunctionNode_cosh.prototype.evaluate = function(var_names, values) {
  return Math.cosh(this.content.evaluate(var_names, values));
};
functionNodes.cosh = FunctionNode_cosh;


/**
 *
 */
var FunctionNode_tanh = function(content) { this.setContent(content); };
FunctionNode_tanh.prototype = new FunctionNode("tanh");
FunctionNode_tanh.prototype.evaluate = function(var_names, values) {
  return Math.tanh(this.content.evaluate(var_names, values));
};
functionNodes.tanh = FunctionNode_tanh;


/**
 *
 */
var FunctionNode_ln = function(content) { this.setContent(content); };
FunctionNode_ln.prototype = new FunctionNode("ln");
FunctionNode_ln.prototype.evaluate = function(var_names, values) {
  var v = this.content.evaluate(var_names, values);
  return Math.log(v) / Math.log(Math.E);
};
functionNodes.ln = FunctionNode_ln;


/**
 *
 */
var FunctionNode_log = function(content) { this.setContent(content); };
FunctionNode_log.prototype = new FunctionNode("log");
FunctionNode_log.prototype.evaluate = function(var_names, values) {
  var v = this.content.evaluate(var_names, values);
  return Math.log(v) / Math.log(10);
};
functionNodes.log = FunctionNode_log;


/**
 *
 */
var FunctionNode_sqrt = function(content) { this.setContent(content); };
FunctionNode_sqrt.prototype = new FunctionNode("sqrt");
FunctionNode_sqrt.prototype.evaluate = function(var_names, values) {
  return Math.sqrt(this.content.evaluate(var_names, values));
};
FunctionNode_sqrt.prototype.toLaTeX = function() { return "\\sqrt{" + this.content.toLaTeX() + "}"; };
functionNodes.sqrt = FunctionNode_sqrt;


/**
 *
 */
var FunctionNode_abs = function(content) { this.setContent(content); };
FunctionNode_abs.prototype = new FunctionNode("abs");
FunctionNode_abs.prototype.evaluate = function(var_names, values) {
  return Math.abs(this.content.evaluate(var_names, values));
};
FunctionNode_abs.prototype.toLaTeX = function() { return "|" + this.content.toLaTeX() + "|"; };
functionNodes.abs = FunctionNode_abs;


// builder function
var getFunctionNode = function(functor, content) {
  if(functionNodes[functor]) {
    return new functionNodes[functor](content);
  }
  return false;
};
