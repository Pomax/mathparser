
/**
 * scripts/wrapper/MathFunction_header.js
 */

/**
 * Mathematical function object.
 */
(function loadMathParser(window, document, console, MathJax, isNaN, pow) {

/**
 * scripts/MathFunction/dependencies/FunctionTree.js
 */

var FunctionTree = function() {};

FunctionTree.prototype = {
  left: false,
  right: false,
  // check for right/left children
  hasRight: function() { return this.right!==false; },
  hasLeft: function() { return this.left!==false; },
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
  evaluate: function(var_names, values) { return false; },
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

/**
 * scripts/MathFunction/dependencies/SimpleNodes.js
 */

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
  return false; };
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

/**
 * scripts/MathFunction/dependencies/OperatorNodes.js
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


var AdditionNode = function(){};
AdditionNode.prototype = new OperatorNode("+", 1);
AdditionNode.prototype.evaluate = function(var_names, values) {
  var left = this.left, right = this.right;
  return left.evaluate(var_names, values) + right.evaluate(var_names, values);
};

var SubtractionNode = function(){};
SubtractionNode.prototype = new OperatorNode("-", 1);
SubtractionNode.prototype.evaluate = function(var_names, values) {
  var left = this.left, right = this.right;
  return left.evaluate(var_names, values) - right.evaluate(var_names, values);
};

var MultiplicationNode = function(){};
MultiplicationNode.prototype = new OperatorNode("*", 2);
MultiplicationNode.prototype.evaluate = function(var_names, values) {
  var left = this.left, right = this.right;
  return left.evaluate(var_names, values) * right.evaluate(var_names, values);
};
MultiplicationNode.prototype.toLaTeX = function() {
  return this.left.toLaTeX() + " \\cdot " + this.right.toLaTeX();
};


var DivisionNode = function(){};
DivisionNode.prototype = new OperatorNode("/", 2);
DivisionNode.prototype.evaluate = function(var_names, values) {
  var left = this.left, right = this.right;
  return left.evaluate(var_names, values) / right.evaluate(var_names, values);
};
DivisionNode.prototype.toLaTeX = function() {
  return "\\frac{" + this.left.toLaTeX() + "}{" + this.right.toLaTeX() + "}";
};


var NegativeNode = function(){};
NegativeNode.prototype = new OperatorNode("-", 3);
NegativeNode.prototype.hasLeft = function() { return false; };
NegativeNode.prototype.hasLeaves = function() { return this.right!==false; };
NegativeNode.prototype.setLeaves = function(l, r) { this.right = r; };
NegativeNode.prototype.evaluate = function(var_names, values) {
  return - this.right.evaluate(var_names, values);
};
NegativeNode.prototype.toLaTeX = function() { return "-" + this.right.toLaTeX(); };


var PowerNode = function(){};
PowerNode.prototype = new OperatorNode("^", 4);
PowerNode.prototype.evaluate = function(var_names, values) {
  var left = this.left, right = this.right;
  return Math.pow(left.evaluate(var_names, values), right.evaluate(var_names, values));
};


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


// builder functions
var getOperatorNode = function(op) {
  if(op == "+") return new AdditionNode();
  if(op == "-") return new SubtractionNode();
  if(op == "*") return new MultiplicationNode();
  if(op == "/") return new DivisionNode();
  if(op == "^") return new PowerNode();
  return false; };
var getUnaryOperatorNode = function(op) {
  if(op == "-") return new NegativeNode();
  if(op == "!") return new FactorialNode();
  return false; };

/**
 * scripts/MathFunction/dependencies/FunctionNodes.js
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

var WrapperNode = function(content) { this.setContent(content); };
WrapperNode.prototype = new FunctionNode("wrapper");
WrapperNode.prototype.toString = function() { return "(" + this.content.toString() + ")"; };
WrapperNode.prototype.toLaTeX = function() { return " \\left ( " + this.content.toLaTeX() + " \\right ) "; };
WrapperNode.prototype.evaluate = function(var_names, values) {
  return this.content.evaluate(var_names, values);
};

var FunctionNode_sin = function(content) { this.setContent(content); };
FunctionNode_sin.prototype = new FunctionNode("sin");
FunctionNode_sin.prototype.evaluate = function(var_names, values) {
  return Math.sin(this.content.evaluate(var_names, values));
};

var FunctionNode_cos = function(content) { this.setContent(content); };
FunctionNode_cos.prototype = new FunctionNode("cos");
FunctionNode_cos.prototype.evaluate = function(var_names, values) {
  return Math.cos(this.content.evaluate(var_names, values));
};

var FunctionNode_tan = function(content) { this.setContent(content); };
FunctionNode_tan.prototype = new FunctionNode("tan");
FunctionNode_tan.prototype.evaluate = function(var_names, values) {
  return Math.tan(this.content.evaluate(var_names, values));
};

var FunctionNode_asin = function(content) { this.setContent(content); };
FunctionNode_asin.prototype = new FunctionNode("asin");
FunctionNode_asin.prototype.evaluate = function(var_names, values) {
  return Math.asin(this.content.evaluate(var_names, values));
};

var FunctionNode_acos = function(content) { this.setContent(content); };
FunctionNode_acos.prototype = new FunctionNode("acos");
FunctionNode_acos.prototype.evaluate = function(var_names, values) {
  return Math.acos(this.content.evaluate(var_names, values));
};

var FunctionNode_atan = function(content) { this.setContent(content); };
FunctionNode_atan.prototype = new FunctionNode("atan");
FunctionNode_atan.prototype.evaluate = function(var_names, values) {
  return Math.atan(this.content.evaluate(var_names, values));
};

var FunctionNode_sinh = function(content) { this.setContent(content); };
FunctionNode_sinh.prototype = new FunctionNode("sinh");
FunctionNode_sinh.prototype.evaluate = function(var_names, values) {
  return Math.sinh(this.content.evaluate(var_names, values));
};

var FunctionNode_cosh = function(content) { this.setContent(content); };
FunctionNode_cosh.prototype = new FunctionNode("cosh");
FunctionNode_cosh.prototype.evaluate = function(var_names, values) {
  return Math.cosh(this.content.evaluate(var_names, values));
};

var FunctionNode_tanh = function(content) { this.setContent(content); };
FunctionNode_tanh.prototype = new FunctionNode("tanh");
FunctionNode_tanh.prototype.evaluate = function(var_names, values) {
  return Math.tanh(this.content.evaluate(var_names, values));
};

var FunctionNode_ln = function(content) { this.setContent(content); };
FunctionNode_ln.prototype = new FunctionNode("ln");
FunctionNode_ln.prototype.evaluate = function(var_names, values) {
  var v = this.content.evaluate(var_names, values);
  return Math.log(v) / Math.log(Math.E);
};

var FunctionNode_log = function(content) { this.setContent(content); };
FunctionNode_log.prototype = new FunctionNode("log");
FunctionNode_log.prototype.evaluate = function(var_names, values) {
  var v = this.content.evaluate(var_names, values);
  return Math.log(v) / Math.log(10);
};

var FunctionNode_sqrt = function(content) { this.setContent(content); };
FunctionNode_sqrt.prototype = new FunctionNode("sqrt");
FunctionNode_sqrt.prototype.evaluate = function(var_names, values) {
  return Math.sqrt(this.content.evaluate(var_names, values));
};
FunctionNode_sqrt.prototype.toLaTeX = function() { return "\\sqrt{" + this.content.toLaTeX() + "}"; };

var FunctionNode_abs = function(content) { this.setContent(content); };
FunctionNode_abs.prototype = new FunctionNode("abs");
FunctionNode_abs.prototype.evaluate = function(var_names, values) {
  return Math.abs(this.content.evaluate(var_names, values));
};
FunctionNode_abs.prototype.toLaTeX = function() { return "|" + this.content.toLaTeX() + "|"; };


// builder function
var getFunctionNode = function(functor, content) {
  if (functor == "sin")  return new FunctionNode_sin(content);
  if (functor == "cos")  return new FunctionNode_cos(content);
  if (functor == "tan")  return new FunctionNode_tan(content);
  if (functor == "asin") return new FunctionNode_asin(content);
  if (functor == "acos") return new FunctionNode_acos(content);
  if (functor == "atan") return new FunctionNode_atan(content);
  if (functor == "sinh") return new FunctionNode_sinh(content);
  if (functor == "cosh") return new FunctionNode_cosh(content);
  if (functor == "tanh") return new FunctionNode_tanh(content);
  if (functor == "ln")   return new FunctionNode_ln(content);
  if (functor == "log")  return new FunctionNode_log(content);
  if (functor == "sqrt") return new FunctionNode_sqrt(content);
  if (functor == "abs")  return new FunctionNode_abs(content);
  return false;
};

/**
 * scripts/MathFunction/dependencies/AggregatorNodes.js
 */

/**
 * Very special function node.
 */
var AggregateNode = function(label) { this.label = label; };
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
};
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
};
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
  return false; };

var getAggregateNode = function(functor, args, content) {
  if (functor == "sum") return new FunctionNode_sum(args, content);
  if (functor == "prod") return new FunctionNode_prod(args, content);
  if (functor == "area") return new FunctionNode_area(args, content);
  return false; };

/**
 * scripts/MathFunction/dependencies/Tape.js
 */

/**
 * Create a new tape based on a data string.
 * In order to ensure we don't screw up Unicode
 * strings, this splits the data into an array
 * of String, emphatically NOT a char array.
 *
 * If stripWhitespace is true, all whitespace
 * in the data will be removed. This can be
 * useful for things like math functions.
 */
var Tape  = function(data, stripWhiteSpace) {
  stripWhiteSpace = stripWhiteSpace || false;
  if(stripWhiteSpace) {
    data = data.replace(/[ \t\n\s]/g,'');
  }
  this.data = data.split("");
  this.length = data.length;
  this.position = 0;
};


Tape.prototype = {
  /**
   * read the current character on the tape.
   */
  read: function() { return this.data[this.position]; },
  /**
   * checks whether there are more characters that can be read.
   */
  more: function() { return this.position<this.length; },
  /**
   * advance the tape by one spot
   */
  advance: function() { if(this.position<this.length-1) this.position++; },
  /**
   * read the next unread character on the tape.
   */
  next: function() { return this.data[this.position++]; },
  /**
   * look at the next character without forwarding the read head.
   */
  peek: function() { return this.data[this.position+1]; },
  /**
   * Recursively skip over a grouped expression.
   * This is important for skipping over bracketed
   * strings such as '', "", (), {}, [] and <> groups
   */
  skipGroup: function(opener, closer) {
    var buffer = "",
        _tmp;
    while(this.position<this.length) {
      _tmp = this.data[this.position++];
      if(_tmp == opener) {
        buffer += this.skipGroup(opener, closer);
      }
      else if(_tmp == closer) { break; }
      else { buffer += _tmp; }
    }
    return opener + buffer + closer;
  },
  /**
   * Generate the String representation of this tape.
   */
  toString: function() {
    var s = join(this.data, '');
    s = s.substring(0,this.position)+" "+this.data[this.position]+" "+s.substring(this.position+1);
    return s;
  }
};

/**
 * scripts/MathFunction/dependencies/ArithmeticFragment.js
 */

/**
 * An arithmetic fragment models a piece of a function.
 */
var ArithmeticFragment = function(fragment) {
  this.setup(fragment);
};

// uid counter
ArithmeticFragment.afCount = 1;

// prototype
ArithmeticFragment.prototype = {
  setup: function(fragment) {
    this.uid = ArithmeticFragment.afCount++;
    // only used for summation
    this.sumarguments = [],
    // As an object, there is either a simple string
    // descriptor for this fragment, or a set of
    // children describing the fragment as a compound.
    this.fragment = fragment,
    // array of ArithmeticFragment:
    this.children = [],
    // If this fragment represents a function,
    // it will have a functor and a set of
    // children.
    this.functor = "";
    // tells us whether to wrap our fragment
    this.wrapped = false;
    // tells us whether we're already expanded
    this.expanded = false;
  },
  /**
   * balanced parentheses?
   */
  getBalance: function() {
    var toks = this.fragment.split(""),
        pCount =0,
        i, last;
    for(i=0, last=toks.length; i<last; i++) {
      if(toks[i] == "(") pCount++;
      if(toks[i] == ")") pCount--; }
    return pCount;
  },
  // functor(...) fragment?
  isFunctionWrapped: function(fragment) {
    if(!fragment.match(/^\w+\(.+\)/)) return false;
    fragment = fragment.replace(/^\w+/g,'');
    return this.isParensWrapped(fragment);
  },
  // (...) fragment?
  isParensWrapped: function(fragment) {
    if(!fragment.match(/^\(.*\)$/)) return false;
    var tokens = fragment.split(""),
        groupCount = 0,
        last, i;
    for(i=0, last=tokens.length; i<last; i++) {
      if(tokens[i] === "") continue;
      if(tokens[i] === "(") groupCount++;
      if(tokens[i] === ")") groupCount--;
      if(groupCount===0 && i<last-1) return false;
    }
    return groupCount===0;
  },
  // does a char represent a mathematical operator?
  isArithmeticOperator: function(t) {
    return t=="+" || t=="-" || t=="*" || t=="/" || t=="^" || t=="!";
  },
  /**
   * Expand this fragment, if possible
   */
  expand: function() {
    if(this.expanded) return;
    var compound = false,
        unwrapped = false;

// WAY TOO MANY [this.] ENTRIES HERE:

    // is this a function? if so, unwrap it
    if (this.isFunctionWrapped(this.fragment)) {
      unwrapped = true;
      this.functor = this.fragment.substring(0,this.fragment.indexOf("("));
      this.fragment = this.fragment.replace(new RegExp("^"+this.functor),'');
    }
    if (this.isParensWrapped(this.fragment)) {
      if(!unwrapped) { this.wrapped = true; }
      unwrapped = true;
      this.fragment = this.fragment.substring(1,this.fragment.length-1);
    }
    // is this a summation?
    if(isAggregateNode(this.functor) && this.fragment.trim()!=="") {
      var pos = this.fragment.indexOf(","),
          capPos = this.fragment.indexOf("(");
      if(capPos===-1) { capPos = this.fragment.length(); }
      var arg = "";
      while(pos>-1 && pos<capPos) {
        arg = this.fragment.substring(0,pos);
        this.fragment = this.fragment.replace(new RegExp("^"+arg+",",'g'),'');
        capPos--;
        this.sumarguments.push(arg);
        pos = this.fragment.indexOf(",");
      }
    }

    // expand the fragment
    var tape = new Tape(this.fragment, true),
        buffer = "",
        token,
        just_inserted = false;

    while(tape.more()) {
      token = tape.next();

      // If we encounter an arithmetic operator, split up the fragment
      if(this.isArithmeticOperator(token)) {
        compound = true;
        if (buffer.trim() !== "" || just_inserted) {
          // content
          if(buffer.trim() !== "") {
            this.fragment = "";
            this.children.push(new ArithmeticFragment(buffer)); }
          // operator
          if(token == "!") { this.children.push(new UnaryOperator(token)); }
          else { this.children.push(new Operator(token)); }
          buffer = "";
        } else if(token === "-") {
          this.children.push(new UnaryOperator("-"));
        }
        just_inserted = true;
      }
      // If we encounter a grouping token,
      // skip over the group content.
      else if (token === "(") {
        buffer += tape.skipGroup("(",")");
      }
      // Otherwise, move token to buffer
      else {
        just_inserted = false;
        buffer += token;
      }
    }

    // If we have a non-empty buffer after expanding
    // we need to create a "final" fragment.
    if ((compound || unwrapped) && buffer!=="") {
      this.children.push(new ArithmeticFragment(buffer));
      compound = true;
    }

    // If we went from plain fragment to compound,
    // make sure to expand all children.
    if (compound) {
      this.children.forEach(function(c) {
        c.expand();
      });
    }

    this.expanded = true;
  },
  /**
   * form the function tree that maps to this fragment
   */
  formFunctionTree: function() {
    var finalNode,
        nodes = [];

    if(!this.expanded) { this.expand(); }

    if(this.children.length>0) {
      var i,
          last = this.children.length;
      // bottom-up conversion
      for(i=0; i<last; i++) {
        var af = this.children[i];
        if(af instanceof UnaryOperator) {
          nodes.push(getUnaryOperatorNode(af.operator));
        }
        else if(af instanceof Operator) {
          nodes.push(getOperatorNode(af.operator));
        }
        else { nodes.push(af.formFunctionTree()); }
      }

      // assemble these nodes into a tree.
      var rhs = false, lhs = false,
          tn, right, left;
      for(var s=6; s>=0; s--) {
        for(i=nodes.length-1; i>=0; i--) {
          tn = nodes[i];
          if(tn.getStrength) {
            if(tn.getStrength()==s) {
              if (!tn.hasLeaves()) {
                // right sibling
                rhs = tn.hasRight();
                right = (rhs ? false: nodes.splice(i+1,1)[0]);

                // left sibling
                lhs = tn.hasLeft();
                left = (lhs ? false : nodes.splice(i-1,1)[0]);

                // set node content
                tn.setLeaves(left, right);
              }
            }
          }
        }
      }

      finalNode = (nodes.length>0 ? nodes[0] : tn);
    }
    // no children: simple content
    else { finalNode = getSimpleNode(this.fragment); }

    // if this is function-wrapped, wrap it.
    if(this.functor) {
      var aggregator = getAggregateNode(this.functor, this.sumarguments, finalNode);
      finalNode = (aggregator ? aggregator : getFunctionNode(this.functor, finalNode));
    }

    // do we need to wrap?
    if(this.wrapped) { finalNode = new WrapperNode(finalNode); }

    return finalNode;
  },
  /**
   * toString - always useful
   */
  toString: function(pad) {
    if(!pad) return this.toString(" ");
    var s = "["+this.uid+"] ";
    s = (this.functor ? this.functor+"[" : '');
    if(this.children.length>0) {
      var cstrings = [];
      for(var i=0, last=this.children.length; i<last; i++) {
        cstrings[i] = this.children[i].toString(pad+" ");
      }
      s += cstrings.join('');
    }
    else { s += this.fragment; }
    return "{" + s + (this.functor? "]" : '') + "}";
  }
};


// operators are either +, -, *, / or ^ -- no op is represented as a space
var Operator = function(op) { this.setup(""); this.operator = op; };
Operator.prototype = new ArithmeticFragment("");
Operator.prototype.toString = function(pad) { return ''+this.operator; };

// special operator class
var UnaryOperator = function(op) { this.setup(""); this.operator = op; };
UnaryOperator.prototype = new Operator("");

/**
 * scripts/MathFunction/MathFunction.js
 */

/**
 * If we don't have MathJax, we can still plot, just not render
 * pretty formulae.
 */
if(!MathJax) {
  if(console && console.warn) {
    console.warn("MathJax is not available, math functions will not be able to render LaTeX.");
  }
}

/**
 * Naive asymptote finding. Works by constructing a running dy/dx value
 * and seeing whether the transition from "previous" to "current" is
 * reasonably speaking impossible. Note: the lower the fidelity, they more
 * like that this generates false positives.
 */
var hasAsymptote = (function() {
  var px = false,
      py = false,
      dp = false,
      threshold = 4;
  return function(x,y) {
    if(px===false && py===false) {
      px = x;
      py = y;
      return false;
    }
    else if(dp===false) {
      dp = (y-py)/(x-px);
      px = x;
      py = y;
      return false;
    }
    var d = (y-py)/(x-px);
    var asym = (d>threshold && dp<-threshold) || (d<-threshold && dp>threshold);
    px = x;
    py = y;
    dp = d;
    return asym;
  };
}());

/**
 * Generic mapping function, with safeties. Note that this is a generator,
 * and yields a map function based on the indicated target domain.
 */
var map = function(r1, r2) {
  return function(value, d1, d2, retval) {
    if(isNaN(value)) return false;
    if(value==Infinity) { return pow(2,31); }
    if(value==-Infinity) { return -pow(2,31); }
    retval = r1 + (r2 - r1) * ((value - d1) / (d2 - d1));
    if(isNaN(retval)) return false;
    if(retval==Infinity) { return pow(2,31); }
    if(retval==-Infinity) { return -pow(2,31); }
    return retval;
  };
};


// ==========================================


var MathFunction = function(functionText) {
  this.plotCanvas = false;
  this.functionString = "";
  this.LaTeX = "";
  this.arithmeticFragment = false;
  this.functionTree = false;
  this.init(functionText);
};

MathFunction.prototype = {
  /**
   * initialise this math function
   */
  init: function(functionString) {
    this.functionString = functionString.replace(/\s/g,'');
    this.arithmeticFragment = new ArithmeticFragment(this.functionString);
    var balance = this.arithmeticFragment.getBalance();
    if(balance===0) {
      this.functionTree = this.arithmeticFragment.formFunctionTree();
      this.LaTeX = this.functionTree.toLaTeX();
    } else { throw "Function is unbalanced: "+this.arithmeticFragment.toString()+" has "+balance+" open groups"; }
  },
  /**
   * get all parameters used in this function
   */
  getParameters: function() {
    return this.functionTree.getParameters();
  },
  /**
   * show the function on the page, in LaTeX format. Typeset with MathJax, if available
   */
  render: function(container) {
    if(MathJax) {
      var str = "\\[" + this.LaTeX + "\\]";
      container.innerHTML = str;
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, container]);
    } else { container.innerHTML = this.functionTree.toString(); }
  },
  /**
   * plot this function on the page
   */
  plot: function(container, options, viewbox) {
    this.options = options;
    viewbox = viewbox || {minx:0, maxx:container.clientWidth, miny:0, maxy:container.clientHeight};
    var context;
    if(!this.plotCanvas) {
      var canvas = document.createElement("canvas");
      canvas.width = options.width || 400;
      this.mapx = map(0,canvas.width);
      canvas.height = options.height || 400;
      this.mapy = map(canvas.height,0);
      canvas.style.border = "1px solid black";
      container.innerHTML="";
      container.appendChild(canvas);
      this.plotCanvas = canvas;
      context = this.plotCanvas.getContext("2d");
      this.clear(context);
    } else { context = this.plotCanvas.getContext("2d"); }
    var o = options,
        c = o.variable,
        plotData = this.functionTree.plot(c.label, c.start, c.end, c.step, o.clamped),
        v = viewbox,
        minmax = {minx:v.minx, maxx:v.maxx, miny:v.miny, maxy:v.maxy, asymptotes:[]};
    this.drawAxes(context, viewbox.axes, minmax);
    this.drawPlotData(context, plotData, minmax);
  },
  /**
   * draw the plot axes
   */
  drawAxes: function(context, axes, minmax) {
    axes = axes || {x:0, y:0};
    var axis;

    axis = this.mapx(axes.x, minmax.minx ,minmax.maxx);
    context.strokeStyle = "#999";
    context.moveTo(axis, 0);
    context.lineTo(axis, 400);
    context.stroke();
    context.beginPath();

    axis = this.mapy(axes.y, minmax.miny ,minmax.maxy);
    context.moveTo(0,axis);
    context.lineTo(400,axis);
    context.stroke();
    context.beginPath();
  },
  /**
   * draw the function onto the canvas
   */
  drawPlotData: function(context, plotData, minmax) {
    context = context || this.plotCanvas.getContext("2d");
    var asymptotes = minmax.asymptotes;
    context.strokeStyle = "black";
    var i, last=plotData.length, ox, x, y;
    for(i=0; i<last; i++) {
      ox = plotData[i][0];
      x = this.mapx(ox, minmax.minx ,minmax.maxx);
      y = this.mapy(plotData[i][1], minmax.miny, minmax.maxy);
      asym = hasAsymptote(x,y);
      if(asym) {
        asymptotes.push(ox);
        context.stroke();
        context.beginPath();
        first = true;
      } else { context.lineTo(x,y); }
    }
    context.stroke();
    this.drawAsymptotes(context, minmax);
  },
  /**
   * draw asymptotes, if the function has any
   */
  drawAsymptotes: function(context, minmax) {
    var mp = this;
    if(!this.functionTree.x) {
      context.strokeStyle = "rgba(255,0,0,0.5)";
      minmax.asymptotes.forEach(function(x){
        x = mp.mapx(x,minmax.minx,minmax.maxx);
        context.beginPath();
        context.moveTo(x,0);
        context.lineTo(x,400);
        context.stroke();
      });
    }
  },
  /**
   * clear the canvas. We should only do this automatically on a freshly built canvas.
   */
  clear: function(context) {
    if(!this.plotCanvas) return;
    this.plotCanvas.width = this.options.width;
    this.plotCanvas.height = this.options.height;
  },
  /**
   * Substitute a variable with a function
   */
  replace: function(varname, mf) {
    if(typeof mf === "string") { mf = new MathFunction(mf); }
    this.functionTree.replace(varname, mf.functionTree);
    var fstr = this.functionTree.toString();
    mf = new MathFunction(this.functionTree.toString());
    this.functionString = mf.functionString;
    this.LaTeX = mf.LaTeX;
    this.arithmeticFragment = mf.arithmeticFragment;
    this.functionTree = mf.functionTree;
  },
  toString: function() { return this.functionString; },
  toLaTeX: function() { return this.LaTeX; }
};

/**
 * Compound (parametric) function
 */
MathFunction.Compound = function(fns) {
  var functions = [];
  var addMathFunction = function(string) { functions.push(new MathFunction(string)); };
  if(fns instanceof Array) { fns.forEach(addMathFunction); }
  else { Array.prototype.forEach.call(arguments, addMathFunction); }
  this.functions = functions;
};
MathFunction.Compound.prototype = {
  /**
   * get all parameters used in this compound function
   */
  getParameters: function() {
    var parameters = [];
    this.functions.forEach(function(f) {
      f.functionTree.getParameters().forEach(function(p) {
        if(parameters.indexOf(p)===-1) {
          parameters.push(p);
        }
      });
    });
    return parameters;
  },
  /**
   * show the function on the page, in LaTeX format. Typeset with MathJax, if available
   */
  render: function(container) {
    var str = "\\[\\left \\{ \\begin{array}{l}\n", ltx = [], i=1;
    this.functions.forEach(function(mf) {
      ltx.push("f_" + (i++) + " = " + mf.LaTeX);
    });
    str += ltx.join("\\\\\n") + "\n\\end{array} \\right . \\]";
    container.innerHTML = str;
    if(MathJax) { MathJax.Hub.Queue(["Typeset", MathJax.Hub, container]); }
  },
  /**
   * Plot a compound function. The options object is similar to
   * the one used for MathFunction, but has an extra property
   * "order", which is an array [<num>,<num>[,<num>]*] that
   * indicates which function to use for x, y, (z, etc).
   */
  plot: function(container, options, viewbox) {
    this.options = options;
    viewbox = viewbox || {minx:0, maxx:container.clientWidth, miny:0, maxy:container.clientHeight};
    var context;
    if(!this.plotCanvas) {
      var canvas = document.createElement("canvas");
      canvas.width = options.width || 400;
      this.mapx = map(0,canvas.width);
      canvas.height = options.height || 400;
      this.mapy = map(canvas.height,0);
      canvas.style.border = "1px solid black";
      container.innerHTML="";
      container.appendChild(canvas);
      this.plotCanvas = canvas;
      context = this.plotCanvas.getContext("2d");
      this.clear(context);
      this.functions.forEach(function(mf) {
        mf.plotCanvas = canvas;
      });
    } else { context = this.plotCanvas.getContext("2d"); }
    var o = options,
        c = options.variable,
        plotData = [],
        minmax = [],
        v = viewbox;
    this.functions.forEach(function(mf) {
      plotData.push(mf.functionTree.plot(c.label, c.start, c.end, c.step, o.clamped));
      minmax.push({minx:v.minx, maxx:v.maxx, miny:v.miny, maxy:v.maxy, asymptotes:[]});
    });
    this.drawAxes(context, viewbox.order, viewbox.axes, minmax);
    this.drawPlotData(context, viewbox.order, plotData, minmax);
  },
  /**
   * draw the plot axes
   */
  drawAxes: function(context, order, axes, minmax) {
    order = order || [0,1];
    axes = axes || {x:0,y:0};
    var xid = order[0],
        yid = order[1],
        axis;

    axis = this.mapx(axes.x, minmax[xid].minx ,minmax[xid].maxx);
    context.strokeStyle = "#999";
    context.moveTo(axis, 0);
    context.lineTo(axis, 400);
    context.stroke();
    context.beginPath();

    axis = this.mapy(axes.y, minmax[yid].miny ,minmax[yid].maxy);
    context.moveTo(0,axis);
    context.lineTo(400,axis);
    context.stroke();
    context.beginPath();
  },
  /**
   * draw the function onto the canvas
   */
  drawPlotData: function(context, order, plotData, minmax) {
    order = order || [0,1];
    context = context || this.plotCanvas.getContext("2d");
    context.strokeStyle = "black";
    var i, last=plotData[0].length, ox, oy, x, y, xid=order[0], yid=order[1];
    for(i=0; i<last; i++) {
      ox = plotData[xid][i][1];
      oy = plotData[yid][i][1];
      x = this.mapx(ox, minmax[xid].minx, minmax[xid].maxx);
      y = this.mapy(oy, minmax[yid].miny, minmax[yid].maxy);
      context.lineTo(x,y);
    }
    context.stroke();
  },
  /**
   * clear all plots so far
   */
  clear: function(context) {
    MathFunction.prototype.clear.call(this,context);
  },
  toString: function() {
    var str = [];
    this.functions.forEach(function(mf) {
      str.push(mf.toString());
    });
    return str.join(", ");
  },
  toLaTeX: function() {
    var str = [];
    this.functions.forEach(function(mf) {
      str.push(mf.toLaTeX());
    });
    return str;
  }
};

// bind object
window.MathFunction = MathFunction;

/**
 * scripts/wrapper/MathFunction_footer.js
 */


}(window, document, window.console, MathJax, isNaN, Math.pow));
