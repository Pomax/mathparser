/**
 * A function tree models a mathematical expression
 * as a tree of operator nodes, with leaves modeling
 * either plain numbers, or variables that can be
 * substituted for plain numbers.
 */
abstract class FunctionTree {
  // Any operator has at most two child nodes.
  FunctionTree left, right;

  // check for right/left children
  boolean hasRight() { return true; }
  boolean hasLeft() { return true; }

  // set the child nodes.
  void setLeaves(FunctionTree l, FunctionTree r) { left = l; right = r; }

  // check whether this tree has its leaved instantiated.
  boolean hasLeaves() { return left!=null && right!=null; }

  /**
   * Evaluate the mathematica expression modelled
   * by this tree, by substituting all variables
   * in the [var_names] array with the corresponding
   * values in the [values] array.
   */
  abstract double evaluate(String[] var_names, double[] values) throws UnknownSubstitutionException;
  
  /**
   * for numbers/constants
   */
  double evaluate() { return Double.NaN; }

  /**
   * for variables
   */
  double evaluate(double v) { return Double.NaN; }

  /**
   * Returns the list of free parameters used in this function
   */
  ArrayList<String> getParameters() {
    ArrayList<String> free = new ArrayList<String>();
    addParametersFromChild(free, left);
    addParametersFromChild(free, right);
    return free;
  }

  // helper method
  protected void addParametersFromChild(ArrayList<String> list, FunctionTree child) {
    if(child!=null) {
      ArrayList<String> free = child.getParameters();
      for(String s: free) {
        if(list.contains(s)) continue;
        list.add(s);
      }
    }
  }
}

class UnknownSubstitutionException extends RuntimeException {
  String label, function;
  String[] var_names;
  UnknownSubstitutionException(String _label, String _function, String[] _var_names) { label=_label; function=_function; var_names=_var_names; }
  String toString() { return "no variable assignment resolution could be performed for "+label+" in {" + function + "} based on ["+var_names+"]"; }
}

// ===

/**
 * Checks whether a string is a clean number by
 * checking whether or not it can be parsed by
 * the Double.parseDouble() method.
 */
boolean isNumber(String s) {
  try { Double.parseDouble(s);  return true; }
  catch (Exception e) {} return false;
}

/**
 * 
 */
class NumberNode extends FunctionTree {
  double value;
  NumberNode(String value) { this.value = Double.parseDouble(value); }
  double evaluate(String[] var_names, double[] values) { return value; }
  double evaluate() { return value; }
  double evaluate(double v) { return value; }
  String toString() { return "num:"+value; }
}

class SimpleNode extends FunctionTree {
  String label;
  SimpleNode(String label) { this.label = label; }
  double evaluate(String[] var_names, double[] values) {
    for(int i=0, last=var_names.length; i<last; i++) {
      if(is(var_names[i],label)) {
        return values[i]; }}
    throw new UnknownSubstitutionException(label, toString(), var_names);
  }
  double evaluate(double v) { return v; }
  String toString() { return "var:"+label; }
  ArrayList<String> getParameters() {
    ArrayList<String> free = new ArrayList<String>();
    free.add(label);
    return free;
  }
}

class ConstantNode extends SimpleNode {
  ConstantNode(String label) { super(label); }
  ArrayList<String> getParameters() {
    return new ArrayList<String>(); 
  }
}

class SimpleNode_pi extends ConstantNode {
  SimpleNode_pi() { super("pi"); }
  double evaluate(String[] var_names, double[] values) {
    return Math.PI;
  }
}

class SimpleNode_e extends ConstantNode {
  SimpleNode_e() { super("e"); }
  double evaluate(String[] var_names, double[] values) {
    return Math.E;
  }
}

// builder function
FunctionTree getSimpleNode(String fragment) {
  if(is(fragment,"pi"))  return new SimpleNode_pi();
  if(is(fragment,"e"))   return new SimpleNode_e();
  if(isNumber(fragment)) return new NumberNode(fragment);
  return new SimpleNode(fragment);
}

// ===

interface OpStrength { int getStrength(); }

abstract class OperatorNode extends FunctionTree implements OpStrength {
  String operator;
  int strength;
  OperatorNode(String op, int s) { operator = op; strength = s; } 
  int getStrength() { return strength; }
  String toString() { return "(" + (left!=null ? left.toString() : "") + operator + (right!=null ? right.toString() : "") + ")"; }
}

class AdditionNode extends OperatorNode {
  AdditionNode() { super("+", 1); }
  double evaluate(String[] var_names, double[] values) {
    return left.evaluate(var_names, values) + right.evaluate(var_names, values);
  }
}

class SubtractionNode extends OperatorNode {
  SubtractionNode() { super("-",1); }
  double evaluate(String[] var_names, double[] values) {
    return left.evaluate(var_names, values) - right.evaluate(var_names, values);
  }
}

class MultiplicationNode extends OperatorNode {
  MultiplicationNode() { super("*",2); }
  double evaluate(String[] var_names, double[] values) {
    return left.evaluate(var_names, values) * right.evaluate(var_names, values);
  }
}

class DivisionNode extends OperatorNode {
  DivisionNode() { super("/",2); }
  double evaluate(String[] var_names, double[] values) {
    return left.evaluate(var_names, values) / right.evaluate(var_names, values);
  }
}

class NegativeNode extends OperatorNode {
  NegativeNode() { super("-",3); }
  boolean hasLeft() { return false; }
  boolean hasLeaves() { return right!=null; }
  void setLeaves(FunctionTree l, FunctionTree r) { right = r; }
  double evaluate(String[] var_names, double[] values) {
    return -right.evaluate(var_names, values);
  }
}

class PowerNode extends OperatorNode {
  PowerNode() { super("^",4); }
  double evaluate(String[] var_names, double[] values) {
    return Math.pow(left.evaluate(var_names, values), right.evaluate(var_names, values));
  }
}

class FactorialNode extends OperatorNode {
  FactorialNode() { super("!",5); }
  boolean hasRight() { return false; }
  boolean hasLeaves() { return left!=null; }
  void setLeaves(FunctionTree l, FunctionTree r) { left = l; }
  double evaluate(String[] var_names, double[] values) {
    double v = left.evaluate(var_names, values);
    return factorial(floor(v));
  }

  // This is a fairly dumb implementation,
  // but we'll add a LUT later for efficiency.
  double factorial(double n) {
    if(n<=1) return 1.0;
    return n * factorial(n-1);
  }
}

// builder function
FunctionTree getOperatorNode(String op) {
  if(is(op,"+")) return new AdditionNode();
  if(is(op,"-")) return new SubtractionNode();
  if(is(op,"*")) return new MultiplicationNode();
  if(is(op,"/")) return new DivisionNode();
  if(is(op,"^")) return new PowerNode();
  return null;
}

FunctionTree getUnaryOperatorNode(String op) {
  if(is(op,"-")) return new NegativeNode();
  if(is(op,"!")) return new FactorialNode();
  return null;
}

// ===

class FunctionNode extends FunctionTree {
  String label;
  FunctionTree content;
  FunctionNode(String label, FunctionTree content) {
    this.label = label;
    setLeaves(null,content);
    this.content = right;
  }
  double evaluate(String[] var_names, double[] values) {
    return Double.NaN;
  }
  String toString() { return "f:" + label + "(" + content.toString() + ")"; }
}

class FunctionNode_sin extends FunctionNode {
  FunctionNode_sin(FunctionTree content) {
    super("sin", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.sin(content.evaluate(var_names, values));
  }
}

class FunctionNode_cos extends FunctionNode {
  FunctionNode_cos(FunctionTree content) {
    super("cos", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.cos(content.evaluate(var_names, values));
  }
}

class FunctionNode_tan extends FunctionNode {
  FunctionNode_tan(FunctionTree content) {
    super("tan", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.tan(content.evaluate(var_names, values));
  }
}

class FunctionNode_asin extends FunctionNode {
  FunctionNode_asin(FunctionTree content) {
    super("asin", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.asin(content.evaluate(var_names, values));
  }
}

class FunctionNode_acos extends FunctionNode {
  FunctionNode_acos(FunctionTree content) {
    super("acos", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.acos(content.evaluate(var_names, values));
  }
}

class FunctionNode_atan extends FunctionNode {
  FunctionNode_atan(FunctionTree content) {
    super("atan", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.atan(content.evaluate(var_names, values));
  }
}

class FunctionNode_sinh extends FunctionNode {
  FunctionNode_sinh(FunctionTree content) {
    super("sinh", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.sinh(content.evaluate(var_names, values));
  }
}

class FunctionNode_cosh extends FunctionNode {
  FunctionNode_cosh(FunctionTree content) {
    super("cosh", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.cosh(content.evaluate(var_names, values));
  }
}

class FunctionNode_tanh extends FunctionNode {
  FunctionNode_tanh(FunctionTree content) {
    super("tanh", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.tanh(content.evaluate(var_names, values));
  }
}

class FunctionNode_ln extends FunctionNode {
  FunctionNode_ln(FunctionTree content) {
    super("ln", content);
  }
  double evaluate(String[] var_names, double[] values) {
    double v = content.evaluate(var_names, values);
    return Math.log(v) / Math.log(Math.E);
  }
}

class FunctionNode_log extends FunctionNode {
  FunctionNode_log(FunctionTree content) {
    super("log", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.log(content.evaluate(var_names, values));
  }
}

class FunctionNode_sqrt extends FunctionNode {
  FunctionNode_sqrt(FunctionTree content) {
    super("sqrt", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.sqrt(content.evaluate(var_names, values));
  }
}

class FunctionNode_abs extends FunctionNode {
  FunctionNode_abs(FunctionTree content) {
    super("abs", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.abs(content.evaluate(var_names, values));
  }
}

// builder function
FunctionTree getFunctionNode(String functor, FunctionTree content) {
  if (is(functor,"sin")) return new FunctionNode_sin(content);
  if (is(functor,"cos")) return new FunctionNode_cos(content);
  if (is(functor,"tan")) return new FunctionNode_tan(content);
  if (is(functor,"asin")) return new FunctionNode_asin(content);
  if (is(functor,"acos")) return new FunctionNode_acos(content);
  if (is(functor,"atan")) return new FunctionNode_atan(content);
  if (is(functor,"sinh")) return new FunctionNode_sinh(content);
  if (is(functor,"cosh")) return new FunctionNode_cosh(content);
  if (is(functor,"tanh")) return new FunctionNode_tanh(content);
  if (is(functor,"ln"))  return new FunctionNode_ln(content);
  if (is(functor,"log"))  return new FunctionNode_log(content);
  if (is(functor,"sqrt"))  return new FunctionNode_sqrt(content);
  if (is(functor,"abs"))  return new FunctionNode_abs(content);
  return null;
}

// ===

/**
 * Very special function node.
 */
abstract class AggregateNode extends FunctionNode {
  ArrayList<FunctionTree> arguments = new ArrayList<FunctionTree>();
  double startValue=0;
  AggregateNode(String label, ArrayList<String> _arguments, FunctionTree content, double _startValue) {
    super(label, content);
    for(String arg: _arguments) { arguments.add(getSimpleNode(arg)); }
    startValue = _startValue;
  }

  ArrayList<String> getParameters() {
    ArrayList<String> free = new ArrayList<String>();
    for(FunctionTree arg: arguments) { addParametersFromChild(free, arg); }
    addParametersFromChild(free, content);
    return free;
  }

  double evaluate(String[] var_names, double[] values) {
    // augment variable names to include the special var "n"
    int pos, last = var_names.length;
    for(pos=0; pos<last; pos++) { if(is(var_names[pos],"n")) break; }
    // calculate the start/end integer values
    double s = arguments.get(0).evaluate(var_names,values),
           e = arguments.get(1).evaluate(var_names,values);
    // and compute aggregate
    return computeAggregate(s,e,pos,var_names,values);
  }

  abstract double computeAggregate(double start, double end, int pos, String[] var_names, double[] values);
}

class FunctionNode_sum extends AggregateNode {
  FunctionNode_sum(ArrayList<String> arguments, FunctionTree content) {
    super("sum", arguments, content, 0);
  }
  double computeAggregate(double start, double end, int pos, String[] var_names, double[] values) {
    double value = startValue;
    int s = (int)round(start), e = (int)round(end);
    for(int i=s; i<=e; i++) {
      values[pos] = i;
      value += content.evaluate(var_names, values); }
    return value;
  }
}

class FunctionNode_prod extends AggregateNode {
  FunctionNode_prod(ArrayList<String> arguments, FunctionTree content) {
    super("prod", arguments, content, 1);
  }
  double computeAggregate(double start, double end, int pos, String[] var_names, double[] values) {
    double value = startValue;
    int s = (int)round(start), e = (int)round(end);
    for(int i=s; i<=e; i++) {
      values[pos] = i;
      value *= content.evaluate(var_names, values); }
    return value;
  }
}

// A newtonian take on computing a definite integral:
// compute the area under a function by adding rectangle areas.
class FunctionNode_area extends AggregateNode {
  FunctionNode_area(ArrayList<String> arguments, FunctionTree content) {
    super("area", arguments, content, 0);
  }
  double computeAggregate(double s, double e, int pos, String[] var_names, double[] values) {
    double start = s,
           end = e,
           step = arguments.get(2).evaluate(),
           slen = (end-start)/step;
    String varName = arguments.get(3).getParameters().get(0);
    
    // Use a different double[] for value passing inside this function,
    // as we'll likely be messing with the controlled variable "t"
    double[] new_values = new double[values.length];
    arrayCopy(values,0,new_values,0,values.length);
    for(pos=0; pos<values.length; pos++) {
      if(is(var_names[pos],varName)) break; }

    // compute area by strip-rect-addition
    double area = startValue;
    for(double v=start+slen/2; v<end; v+=slen) {
      new_values[pos] = v;
      area += slen * content.evaluate(var_names, new_values);
    }
    return area;
  }
}

boolean isAggregateNode(String functor) {
  if (is(functor,"sum")) return true;
  if (is(functor,"prod")) return true;
  if (is(functor,"area")) return true;
  return false;
}

// builder function
FunctionTree getAggregateNode(String functor, ArrayList<String> arguments, FunctionTree content) {
  if (is(functor,"sum")) return new FunctionNode_sum(arguments, content);
  if (is(functor,"prod")) return new FunctionNode_prod(arguments, content);
  if (is(functor,"area")) return new FunctionNode_area(arguments, content);
  return null;
}
