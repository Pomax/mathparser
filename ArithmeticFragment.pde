int afCount = 1;

class IllegalFunctionException extends RuntimeException {}

/**
 * An arithmetic fragment models a piece of a function.
 */
class ArithmeticFragment {
  private int uid = -1;

  // As an object, there is either a simple string
  // descriptor for this fragment, or a set of
  // children describing the fragment as a compound.
  String fragment;
  ArrayList<ArithmeticFragment> children = new ArrayList<ArithmeticFragment>();

  // If this fragment represents a function,
  // it will have a functor and a set of
  // children.
  String functor;

  /**
   * operation-less fragment
   */
  ArithmeticFragment(String fragment) {
    uid = afCount++;
    this.fragment = fragment;
  }
  
  // functor(...) fragment?
  private boolean isFunctionWrapped(String fragment) {
    if(fragment.matches("^\\w+\\(.+\\)")) {
      fragment = fragment.replaceAll("^\\w+","");
      return isParensWrapped(fragment);
    }
    return false;
  }

  // (...) fragment?
  private boolean isParensWrapped(String fragment) {
    if(!fragment.matches("^\\(.*\\)$")) return false;
    String[] tokens = fragment.split("");
    int groupCount = 0;
    for(int i=0, last=tokens.length; i<last; i++) {
      if(is(tokens[i],"")) continue;
      if(is(tokens[i],"(")) groupCount++;
      if(is(tokens[i],")")) groupCount--;
      if(groupCount==0 && i<last-1) return false;
    }
    return groupCount==0;
  }

  // does a char represent a mathematical operator?
  private boolean isArithmeticOperator(String t) {
    return is(t,"+") || is(t,"-") || is(t,"*") || is(t,"/") || is(t,"^") || is(t,"!");
  }

  /**
   * Expand this fragment, if possible
   */  
  private void expand() {
    boolean compound = false, unwrapped = false;

    // is this a function? if so, unwrap it
    if (isFunctionWrapped(fragment)) {
      unwrapped = true;
      functor = fragment.substring(0,fragment.indexOf("("));
      fragment = fragment.replaceAll("^"+functor,"");
    }
    if (isParensWrapped(fragment)) {
      unwrapped = true;
      fragment = fragment.substring(1,fragment.length()-1);
    }

    // expand the fragment
    Tape tape = new Tape(fragment, true);
    String buffer = "", token;
    boolean just_inserted = false;
    while(tape.more()) {
      token = tape.next();
      // If we encounter an arithmetic operator,
      // split up the fragment
      if(isArithmeticOperator(token)) {
        compound = true;
        if (!is(buffer.trim(),"") || just_inserted) {
          // content
          if(!is(buffer.trim(),"")) {
            fragment = "";
            children.add(new ArithmeticFragment(buffer)); }
          // operator
          if(is(token,"!")) { children.add(new UnaryOperator(token)); }
          else { children.add(new Operator(token)); }
          buffer = "";
        } else if(is(token,"-")) {
          children.add(new UnaryOperator("-"));
        }
        just_inserted = true;
      }
      // If we encounter a grouping token,
      // skip over the group content.
      else if (is(token,"(")) {
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
    if ((compound || unwrapped) && buffer!="") {
      children.add(new ArithmeticFragment(buffer)); 
    }

    // If we went from plain fragment to compound,
    // make sure to expand all children.
    if (compound) {
      for(ArithmeticFragment f: children) {
        f.expand(); }}
  }

 
  /**
   * form the function tree that maps to this fragment
   */
  // FIXME: ideally this generates "null" for nonsense functions
  FunctionTree formFunctionTree() throws IllegalFunctionException {
    FunctionTree finalNode;
    expand();

    if(children.size()>0) {
      // bottom-up conversion
      ArrayList<FunctionTree> nodes = new ArrayList<FunctionTree>();
      for(int i=0, last=children.size(); i<last; i++) {
        ArithmeticFragment af = children.get(i);
        if(af instanceof UnaryOperator) { 
          nodes.add(getUnaryOperatorNode(((Operator)af).operator));
        }
        else if(af instanceof Operator) { 
          nodes.add(getOperatorNode(((Operator)af).operator));
        }
        else { nodes.add(af.formFunctionTree()); }
      }

      // assemble these nodes into a tree.
      boolean rhs = false, lhs = false;
      FunctionTree tn, right, left;
      for(int s=5; s>=0; s--) {
        for(int i=nodes.size()-1; i>=0; i--) {
          tn = nodes.get(i);
          if(tn instanceof OpStrength) {
            if(((OpStrength)tn).getStrength()==s) {
              if (!tn.hasLeaves()) {

                // right sibling
                rhs = tn.hasRight();
                right = (rhs ? nodes.get(i+1) : null);
                if (rhs) { nodes.remove(i+1); }

                // left sibling
                lhs = tn.hasLeft();
                left = (lhs ? nodes.get(i-1) : null);
                if (lhs) { nodes.remove(i-1); }

                // set node content
                tn.setLeaves(left, right);
              }
            }
          }
        }
      }
      finalNode = nodes.get(0);
    }
    // no children: simple content
    else { finalNode = getSimpleNode(fragment); }
    
    // if this is function-wrapped, wrap it.
    if(functor != null && functor != "") {
      finalNode = getFunctionNode(functor, finalNode);
    }

    if(finalNode == null) throw new IllegalFunctionException();
    return finalNode;
  }

  /**
   * toString - always useful
   */  
  String toString() { return toString(" "); }
  String toString(String pad) {
    String s = "["+uid+"] ";
    s = (functor==null? "" : functor+"[");
    if(children.size()>0) {
      String[] cstrings = new String[children.size()];
      for(int i=0, last=cstrings.length; i<last; i++) {
        cstrings[i] = children.get(i).toString(pad+" ");
      }
      s += join(cstrings, "");
    }
    else { s += fragment; }
    return "{" + s + (functor==null? "" : "]") + "}";
  }
}

// operators are either +, -, *, / or ^ -- no op is represented as a space
class Operator extends ArithmeticFragment {
  String operator;
  Operator(String op) {
    super(op);
    operator = op;
    fragment = "";
  }
  String toString(String pad) {
    return ""+operator;
  }
}

// special operator class
class UnaryOperator extends Operator {
  UnaryOperator(String op) { super(op); }
}
