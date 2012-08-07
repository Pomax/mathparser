/***
 *
 *  Math parser for plotting functions in Processing and Processing.js
 *
 ***/


// necessary helper function due to String equivalence vs. identity
boolean is(String a, String b) { return a.equals(b); }

// PLOTTING PARAMETERS
//String functionString = "t^3*0 + 3*t^2*(1-t)*90 + 3*t*(1-t)^2*10 + (1-t)^3*100";
//String functionString = "(1-t)";
//String functionString = "sin(1-t)";
String functionString = "sin(t) - cos(t^2)";
String controlledVar = "t";
double start = 0;
double end = 6;
int steps = 100;

/**
 * standard setup
 */
void setup() {
  size(400,400);
  noLoop();
}

/**
 * set up new plot parameters
 */
void plot(String _functionString, String _controlledVar, double _start, double _end, int _steps) {  
  functionString = _functionString;
  controlledVar = _controlledVar;
  start = _start;
  end = _end;
  steps = _steps;
  redraw();
}

/**
 * Draw a function
 */
void draw() {
  background(255,255,250);

  ArithmeticFragment a = new ArithmeticFragment(functionString);
//  println("a: "+a.toString());
  a.expand();
//  println("ae: "+a.toString());
  TreeNode t = a.formFunctionTree();
  println("using function tree: "+a.toString());
  
  double step = (end-start)/steps, result;
  String[] var_names = {controlledVar};
  double[] values = {0};
  
  double segments = (end-start)/step;
  int bins = (int) segments;
  double[] domain = new double[bins];
  double[] results = new double[bins];
  double minr = 999999999;
  double maxr = -minr;
  double v;

  // get values
  for(int bin = 0; bin<bins; bin++) {
    v = start + bin*step;
    domain[bin] = v;
    values[0] = v;
    result = t.evaluate(var_names, values);
    results[bin] = result;
    if(result>maxr) { maxr = result; }
    if(result<minr) { minr = result; }
  }
  
  // plot values, scaled to fit the surface

  double cx=0, cy=0, prevx=0, prevy=0;
  for(int bin = 0; bin<bins; bin++) {
    // first point is a point
    if(bin==0) {
      prevx = map(domain[bin],start,end,0,width);
      prevy = map(results[bin],minr,maxr,height,0);
      point(prevx, prevy);
      continue;
    }

    stroke(0);
    cx = map(domain[bin],start,end,0,width);
    cy = map(results[bin],minr,maxr,height,0);
    point(cx,cy);

    // NOTE: these lines may look completely wrong!
    stroke(150);
    line(prevx, prevy, cx, cy);
    prevx = cx;
    prevy = cy;
    
    //println(cx+","+cy);
  }
}
