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
    //println("forming "+uid+" for ["+fragment+"]");
    this.fragment = fragment;
  }

  /**
   * Expand this fragment, if possible
   */  
  private void expand() {
    boolean compound = false, unwrapped = false;

    // is this a function? if so, unwrap it
    if (fragment.matches("^\\w+\\(.+\\)")) {
      unwrapped = true;
      functor = fragment.replaceAll("\\(.*$","");
      fragment = fragment.replaceAll("^\\w+\\(","").replaceAll("\\)$","");
    }
    else if (fragment.matches("^\\(.+\\)$")) {
      unwrapped = true;
      functor = "";
      fragment = fragment.substring(1,fragment.length()-1);
    }

    // expand the fragment
    Tape tape = new Tape(fragment);
    String buffer = "";
    char token;
    while(!tape.eod()) {
      token = tape.next();
      // If we encounter an arithmetic operator,
      // split up the fragment
      if(isArithmeticOperator(token) && buffer!="") {
        fragment = "";
        compound = true;
        children.add(new ArithmeticFragment(buffer));
        children.add(new Operator(token));
        buffer = "";
      }
      // If we encounter a grouping token,
      // skip over the group content.
      else if (token=='(') {
        buffer += tape.skipGroup('(',')');
      }
      // Otherwise, move token to buffer
      else { buffer += token; }
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
   * does a char represent a mathematical operator?
   */
  boolean isArithmeticOperator(char t) {
    return t=='+' || t=='-' || t=='*' || t=='/' || t=='^';
  }
  
  /**
   * form the function tree that maps to this fragment
   */
  TreeNode formFunctionTree() {
    TreeNode finalNode;

    if(children.size()>0) {
      // bottom-up conversion
      ArrayList<TreeNode> nodes = new ArrayList<TreeNode>();
      for(int i=0, last=children.size(); i<last; i++) {
        ArithmeticFragment af = children.get(i);
        if(af instanceof Operator) { 
          nodes.add(getOperatorNode(((Operator)af).operator));
        }
        else { nodes.add(af.formFunctionTree()); }
      }

      // assemble these nodes into a tree.
      for(int s=3; s>0; s--) {
        for(int i=nodes.size()-1; i>=0; i--) {
          TreeNode tn = nodes.get(i);
          if(tn instanceof OpStrength) {
            if(((OpStrength)tn).getStrength()==s) {
              if (!tn.hasLeaves()) {
                TreeNode right = nodes.get(i+1);
                TreeNode left = nodes.get(i-1);
//   println("["+i+"] " + toString() + " - " + tn.toString() + "["+left.toString()+"] " + "["+right.toString()+"]");
                tn.setLeaves(left, right);
//   println("    " + tn.toString());
                nodes.remove(i+1);
                nodes.remove(i-1);
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
  char operator;
  Operator(char op) {
    super(""+op);
    operator = op;
    fragment = "";
  }
  String toString(String pad) {
    return ""+operator;
  }
}
