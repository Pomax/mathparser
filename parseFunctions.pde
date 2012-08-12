/**
 * set up new plot parameters (normal function)
 */
boolean parseFunction(String _functionString) {
  functionString_y = "";
  ty = null;
  return parseFunctions(_functionString, null);
}


/**
 * set up new plot parameters (parametric function, 2 dimensions)
 */
boolean parseFunctions(String _functionString_x, String _functionString_y) {
  // variable snapshot pre-parse
  ArrayList<String> previous = getParameters();

  FunctionTree _tx = null, _ty = null;
  if (!is(functionString_x, _functionString_x)) {
    ArithmeticFragment a = new ArithmeticFragment(_functionString_x);
    if(!a.isBalanced()) { return false; }
    _tx = a.formFunctionTree();
  }

  if(_functionString_y!=null && !is(functionString_y,_functionString_y)) {
    ArithmeticFragment a = new ArithmeticFragment(_functionString_y);
    if(!a.isBalanced()) { return false; }
    _ty = a.formFunctionTree();
  }

  // if we get here, the functions make sense (somehow)
  if(_tx!= null) {
    functionString_x = _functionString_x;
    tx = _tx;
  }
  if(_ty!=null) {
    functionString_y = _functionString_y;
    ty = _ty;
  }

  // variable snapshot post-parse
  ArrayList<String> current = getParameters();
  
  // keep all variables in current, add any
  // variables that don't alreay exist, and
  // remove all variables in previous that
  // are not found in current.
  for(int s=previous.size()-1; s>=0; s--) {
    if(current.contains(previous.get(s))) {
      previous.remove(s); }}

  variables.allocate(current);
  variables.prune(previous);
  return true;
}

