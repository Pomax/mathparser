// are we running in javascript?
boolean injs = (1.0/2.0==1/2);

// getters
Variables getVariables() { return variables; }
String getFunctionX() { return functionString_x; }
String getFunctionY() { return functionString_y; }
FunctionTree getFunctionTreeX() { return tx; }
FunctionTree getFunctionTreeY() { return ty; }
String getXLaTeX() { return tx.toLaTeX(); }
String getYLaTeX() { return ty.toLaTeX(); }

/**
 * Test this implementation.
 */
void test() {
  // add variable "t"
  Variable t = new Variable("t");
  t.setDomain(0,6.283,0.05);
  variables.add(t);
  variables.setControlled("t");

  String[] labels = {"a", "b", "c", "d"};
  for(String s: labels) {
    Variable v = new Variable(s);
    v.setDomain(0,1,0.01);
    v.value = 1;
    variables.add(v);
  }

  parseFunction("area(0,t,10,t,sin(t) / (1+a*cos(b*t-c*sin(d*t))))");
}


/**
 * update a variable's domain, plot resolution and clamped value
 */
void updateVariable(String label, double min, double max, double resolution, double value) {
  variables.update(label, min, max, resolution, value);
}


/**
 * Necessary helper function due to String equivalence vs. identity
 */
boolean is(String a, String b) {
  if(a==null && b==null) return true;
  if(a==null) return false;
  if(b==null) return false;
  return a.equals(b); }


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
