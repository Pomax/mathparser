/**
 * Very special function node.
 */
var AggregateNode = function(label) { this.label = label; }
AggregateNode.prototype = new FunctionNode();
AggregateNode.prototype.getParameters = function() { return this.content.getParameters(); };
AggregateNode.prototype.bindAll = function(parameters, content, startValue) {
  this.startValue = startValue;
  this.setContent(content);
  params = [];
  parameters.forEach(function(param) {
    params.push(getSimpleNode(param));
  });
  this.parameters = params;
};
AggregateNode.prototype.evaluate = function(var_names, values) {
  // augment variable names to include the special var "n"
  var pos, last = var_names.length;
  pos = var_names.indexOf("n");
  if(pos===-1) { pos = var_names.length; var_names.push("n"); }
  // calculate the start/end integer values
  var s = this.parameters[0].evaluate(var_names,values),
      e = this.parameters[1].evaluate(var_names,values);
  // and compute aggregate
  return this.computeAggregate(s,e,pos,var_names,values);
};

/**
 * parameters:
 * 0 = n_start value
 * 1 = n_end value
 */
var FunctionNode_sum = function(parameters, content) { this.bindAll(parameters, content, 0); };
FunctionNode_sum.prototype = new AggregateNode("sum");
FunctionNode_sum.prototype.computeAggregate = function(start, end, pos, var_names, values) {
  var value = this.startValue,
      s = Math.round(start)|0,
      e = Math.round(end)|0,
      i;
  for(i=s; i<=e; i++) {
    values[pos] = i;
    value += this.content.evaluate(var_names, values);
  }
  return value;
}
FunctionNode_sum.prototype.toLaTeX = function() {
  var params = this.parameters;
  return "\\sum_{n="+params[0].toLaTeX()+"}^{"+params[1].toLaTeX()+"} " + this.content.toLaTeX(); 
};

/**
 * parameters:
 * 0 = n_start value
 * 1 = n_end value
 */
var FunctionNode_prod = function(parameters, content) { this.bindAll(parameters, content, 1); };
FunctionNode_prod.prototype = new AggregateNode("prod");
FunctionNode_prod.prototype.computeAggregate = function(start, end, pos, var_names, values) {
  var value = this.startValue,
      s = Math.round(start)|0,
      e = Math.round(end)|0,
      i;
  for(i=s; i<=e; i++) {
    values[pos] = i;
    value *= this.content.evaluate(var_names, values);
  }
  return value;
}
FunctionNode_prod.prototype.toLaTeX = function() {
  var params = this.parameters;
  return "\\prod_{n="+params[0].toLaTeX()+"}^{"+params[1].toLaTeX()+"} " + this.content.toLaTeX(); 
};


/**
 * A Newtonian take on computing a definite integral:
 * compute the area under a function by adding rectangular areas.
 *
 * parameters:
 * 0 = interval start value
 * 1 = interval end value
 * 2 = number of slices in this interval
 * 3 = variable name (string) for which to evaluate the interval
 */
var FunctionNode_area = function(parameters, content) { this.bindAll(parameters, content, 0); };
FunctionNode_area.prototype = new AggregateNode("area");
FunctionNode_area.prototype.computeAggregate = function (s, e, pos, var_names, values) {
  var params = this.parameters,
      start = s,
      end = e,
      step = params[2].evaluate(),
      slen = (end-start)/step,
      varName = params[3].getParameters()[0],
      area = this.startValue,
      slice,
      v;
  
  for(pos=0; pos<var_names.length; pos++) {
    if(var_names[pos] == varName) break;
  }

  // compute area by strip-rect-addition
  for(v=start+slen/2; v<end; v+=slen) {
    values[pos] = v;
    slice = this.content.evaluate(var_names, values);
    area += slen * Math.abs(slice);
  }
  return area;
};
FunctionNode_area.prototype.toLaTeX = function() {
  var params = this.parameters;
  return "\\int_{"+params[0].toLaTeX()+"}^{"+params[1].toLaTeX()+"} " + this.content.toLaTeX() + " d"+params[3].label;
};


// builder functions
var isAggregateNode = function(functor) {
  if (functor == "sum") return true;
  if (functor == "prod") return true;
  if (functor == "area") return true;
  return false; }

var getAggregateNode = function(functor, arguments, content) {
  if (functor == "sum") return new FunctionNode_sum(arguments, content);
  if (functor == "prod") return new FunctionNode_prod(arguments, content);
  if (functor == "area") return new FunctionNode_area(arguments, content);
  return false; }
