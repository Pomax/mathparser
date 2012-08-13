// are we running in javascript?
boolean injs = (""+2.0==""+2);

// getters
Variables getVariables() { return variables; }
String getFunctionX() { return functionString_x; }
String getFunctionY() { return functionString_y; }
FunctionTree getFunctionTreeX() { return tx; }
FunctionTree getFunctionTreeY() { return ty; }

/**
 * Test this implementation.
 */
void test() {
  // add variable "t"
  Variable t = new Variable("t");
  t.setDomain(-10,10,0.05);
  variables.put(t.label, t);
  variables.setControlled("t");

  parseFunction("1/t");
}

///**
// * Test variable updating
// */
//void mousePressed() {
//  variables.get("t").setDomain(-1,1,0.01);
//  redraw();
//}

/**
 * update a variable's domain, plot resolution and clamped value
 */
void updateVariable(String label, double min, double max, double resolution, double value) {
  variables.update(label, min, max, resolution, value);
}


/**
 * Necessary helper function due to String equivalence vs. identity
 */
boolean is(String a, String b) { return a.equals(b); }


/**
 * get the free parameters in the function
 */
ArrayList<String> getParameters() {
  ArrayList<String> params = new ArrayList<String>();
  if(tx==null) return params;
  params = tx.getParameters();
  if(ty!=null) { 
    ArrayList<String> yparams = ty.getParameters();
    for(String s: yparams) {
      if(params.contains(s)) continue;
      params.add(s);
    }
  }
  return params;
}

/**
 * round for precision
 */
String prec(double d, int l) {
  double f = pow(10,l);
  d = round(f*d) / f;
  return "" + d;
}
