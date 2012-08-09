abstract class TreeNode {
  TreeNode left, right;
  TreeNode(){}
  void setLeaves(TreeNode l, TreeNode r) { left = l; right = r; }
  boolean hasLeaves() { return left!=null && right!=null; }
  double evaluate(String[] var_names, double[] values) {
    return left.evaluate(var_names, values) + right.evaluate(var_names, values);
  }
}


// ===

class NumberNode extends TreeNode {
  double value;
  NumberNode(String value) { this.value = Double.parseDouble(value); }
  double evaluate(String[] var_names, double[] values) { return value; }
  String toString() { return ""+value; }
}

class SimpleNode extends TreeNode {
  String label;
  SimpleNode(String label) { this.label = label; }
  double evaluate(String[] var_names, double[] values) {
    for(int i=0, last=var_names.length; i<last; i++) {
      if(is(var_names[i],label)) {
        return values[i]; }}
    println("ERROR: no variable assignment resolution could be performed for "+label+" in {" + toString() + "} based on ["+var_names+"]");
    return Double.NaN;
  }
  String toString() { return label; }
}

class SimpleNode_pi extends SimpleNode {
  SimpleNode_pi() { super("pi"); }
  double evaluate(String[] var_names, double[] values) {
    return Math.PI;
  }
}

class SimpleNode_e extends SimpleNode {
  SimpleNode_e() { super("e"); }
  double evaluate(String[] var_names, double[] values) {
    return Math.E;
  }
}

// builder function
TreeNode getSimpleNode(String fragment) {
  if(is(fragment,"pi"))  return new SimpleNode_pi();
  if(is(fragment,"e"))   return new SimpleNode_e();
  if(isNumber(fragment)) return new NumberNode(fragment);
  return new SimpleNode(fragment);
}

boolean isNumber(String s) {
  try {
    Double.parseDouble(s);
    return true;
  } catch (Exception e) {}
  return false;
}

// ===

interface OpStrength { int getStrength(); }

// not sure how to get this one in yet. But it exists.
class NegativeNode extends SimpleNode implements OpStrength {
  int strength = 3;
  int getStrength() { return strength; }
  NegativeNode(String label) { super(label); }
  double evaluate(String[] var_names, double[] values) {
    return -super.evaluate(var_names, values);    
  }
}

class OperatorNode extends TreeNode implements OpStrength {
  String operator;
  int strength;
  int getStrength() { return strength; }
  String toString() { return "(" + (left!=null ? left.toString() : "") + operator + (right!=null ? right.toString() : "") + ")"; }
}

class AdditionNode extends OperatorNode {
  AdditionNode() { super(); operator = "+"; strength = 0; }
  double evaluate(String[] var_names, double[] values) {
    return left.evaluate(var_names, values) + right.evaluate(var_names, values);
  }
}

class SubtractionNode extends OperatorNode {
  SubtractionNode() { super(); operator = "-"; strength = 1; }
  double evaluate(String[] var_names, double[] values) {
    return left.evaluate(var_names, values) - right.evaluate(var_names, values);
  }
}

class MultiplicationNode extends OperatorNode {
  MultiplicationNode() { super(); operator = "*"; strength = 2; }
  double evaluate(String[] var_names, double[] values) {
    return left.evaluate(var_names, values) * right.evaluate(var_names, values);
  }
}

class DivisionNode extends OperatorNode {
  DivisionNode() { super(); operator = "/"; strength = 2; }
  double evaluate(String[] var_names, double[] values) {
    return left.evaluate(var_names, values) / right.evaluate(var_names, values);
  }
}

class PowerNode extends OperatorNode {
  PowerNode() { super(); operator = "^"; strength = 3; }
  double evaluate(String[] var_names, double[] values) {
    return Math.pow(left.evaluate(var_names, values), right.evaluate(var_names, values));
  }
}

// builder function
TreeNode getOperatorNode(String op) {
  if(is(op,"+"))  return new AdditionNode();
  if(is(op,"-"))  return new SubtractionNode();
  if(is(op,"*"))  return new MultiplicationNode();
  if(is(op,"/"))  return new DivisionNode();
  if(is(op,"^"))  return new PowerNode();
  return null;
}

// ===

class FunctionNode extends SimpleNode {
  TreeNode content;
  FunctionNode(String label, TreeNode content) {
    super(label);
    this.content = content;
  }
  double evaluate(String[] var_names, double[] values) {
    return Double.NaN;
  }
  String toString() { return label + "(" + content.toString() + ")"; }
}

class FunctionNode_sin extends FunctionNode {
  FunctionNode_sin(TreeNode content) {
    super("sin", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.sin(content.evaluate(var_names, values));
  }
}

class FunctionNode_cos extends FunctionNode {
  FunctionNode_cos(TreeNode content) {
    super("cos", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.cos(content.evaluate(var_names, values));
  }
}

class FunctionNode_tan extends FunctionNode {
  FunctionNode_tan(TreeNode content) {
    super("tan", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.tan(content.evaluate(var_names, values));
  }
}

class FunctionNode_asin extends FunctionNode {
  FunctionNode_asin(TreeNode content) {
    super("asin", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.asin(content.evaluate(var_names, values));
  }
}

class FunctionNode_acos extends FunctionNode {
  FunctionNode_acos(TreeNode content) {
    super("acos", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.acos(content.evaluate(var_names, values));
  }
}

class FunctionNode_atan extends FunctionNode {
  FunctionNode_atan(TreeNode content) {
    super("atan", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.atan(content.evaluate(var_names, values));
  }
}

class FunctionNode_sinh extends FunctionNode {
  FunctionNode_sinh(TreeNode content) {
    super("sinh", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.sinh(content.evaluate(var_names, values));
  }
}

class FunctionNode_cosh extends FunctionNode {
  FunctionNode_cosh(TreeNode content) {
    super("cosh", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.cosh(content.evaluate(var_names, values));
  }
}

class FunctionNode_tanh extends FunctionNode {
  FunctionNode_tanh(TreeNode content) {
    super("tanh", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.tanh(content.evaluate(var_names, values));
  }
}

class FunctionNode_ln extends FunctionNode {
  FunctionNode_ln(TreeNode content) {
    super("ln", content);
  }
  double evaluate(String[] var_names, double[] values) {
    double v = content.evaluate(var_names, values);
    return Math.log(v) / Math.log(Math.E);
  }
}

class FunctionNode_log extends FunctionNode {
  FunctionNode_log(TreeNode content) {
    super("log", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.log(content.evaluate(var_names, values));
  }
}

class FunctionNode_exp extends FunctionNode {
  FunctionNode_exp(TreeNode content) {
    super("exp", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.exp(content.evaluate(var_names, values));
  }
}

class FunctionNode_sqrt extends FunctionNode {
  FunctionNode_sqrt(TreeNode content) {
    super("sqrt", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.sqrt(content.evaluate(var_names, values));
  }
}

class FunctionNode_abs extends FunctionNode {
  FunctionNode_abs(TreeNode content) {
    super("abs", content);
  }
  double evaluate(String[] var_names, double[] values) {
    return Math.abs(content.evaluate(var_names, values));
  }
}

// builder function
TreeNode getFunctionNode(String functor, TreeNode content) {
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
  if (is(functor,"exp"))  return new FunctionNode_exp(content);
  if (is(functor,"sqrt"))  return new FunctionNode_sqrt(content);
  if (is(functor,"abs"))  return new FunctionNode_abs(content);
  println("ERROR: could not find object for ["+functor+"]");
  return null;
}

// ===

