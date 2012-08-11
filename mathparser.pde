/***
 *
 *  Math parser for plotting functions in Processing and Processing.js
 *
 ***/

// function variables
String functionString_x = "sin(t + x)", functionString_y = null;
FunctionTree tx = (new ArithmeticFragment(functionString_x)).formFunctionTree(), ty = null;

// Keep a little bit of border cleared around our graph.
double padding = 20;

/**
 * standard setup
 */
void setup() {
  size(400,400);
  clamp("x",10);
  noLoop();
}

/**
 * Draw a function
 */
void draw() {
  background(255,255,250);
  double[] bounds;

  // See whether we can draw this/these function(s).
  // If we can't, exit the draw function so we don't clear
  // the previously drawn result.
  try {
    if(functionString_y==null) { bounds = drawSingle(); }
    else { bounds = drawParametric(); }}
  catch (UnknownSubstitutionException e) { return; }


  // draw the y/x axes
  stroke(0,50);
  line(padding,0,padding,height);
  line(0,height-padding,width,height-padding);
  // label stubs
  line(width-padding,5+height-padding,width-padding,-5+height-padding);
  line(padding-5,padding,padding+5,padding);
  
  // can we place axes for the 0/0 line(s)?
  stroke(0,20);
  double x, y;
  if((bounds[0]<0 && bounds[2]>0) || (bounds[0]>0 && bounds[2]<0)) {
    x = map(0,min(bounds[0],bounds[2]),max(bounds[0],bounds[2]),0,width);
    line(x,0,x,height); }
  if((bounds[1]<0 && bounds[3]>0) || (bounds[1]>0 && bounds[3]<0)) {
    y = map(0,min(bounds[1],bounds[3]),max(bounds[1],bounds[3]),height,0);
    line(0,y,width,y); }

  // label the axes
  fill(0);
  textAlign(LEFT);
  text(prec(bounds[1],2), 3, height-padding-3); // miny
  text(prec(bounds[3],2), 3, padding+15); // maxy
  text(prec(bounds[0],2), padding+5, height-3); // minx
  textAlign(RIGHT);
  text(prec(bounds[2],2), width-padding+4, height-3); // maxx
}


/**
 * set up new plot parameters (normal function)
 */
void plot(String _functionString) { //, String _controlledVar, double _start, double _end, int _steps) {
  plot(_functionString, null);
}

/**
 * set up new plot parameters (parametric function, 2 dimensions)
 */
void plot(String _functionString_x, String _functionString_y) { //, String _controlledVar, double _start, double _end, int _steps) {  
  functionString_x = _functionString_x;
  ArithmeticFragment a = new ArithmeticFragment(functionString_x);
  tx = a.formFunctionTree();

  functionString_y = _functionString_y;
  if(functionString_y!=null) {
    a = new ArithmeticFragment(functionString_y);
    ty = a.formFunctionTree(); }

  redraw();
}

/**
 * Plot function normally
 */
double[] drawSingle() throws UnknownSubstitutionException {
  double step = (end-start)/steps, result;

  ArrayList<String> keys = new ArrayList<String>(clamps.keySet());
  String[] var_names = new String[1+keys.size()];
  var_names[0] = controlledVar;
  double[] values = new double[1+keys.size()];
  values[0] = start;

  String key;
  for(int i=0, last=keys.size(); i<last; i++) {
    key = keys.get(i);
    var_names[i+1] = key;
    values[i+1] = clamps.get(key);
  }
  
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

    result = tx.evaluate(var_names, values);
    results[bin] = result;

    if(result>maxr) { maxr = result; }
    if(result<minr) { minr = result; }
  }
  
  // plot values, scaled to fit the surface
  double cx=0, cy=0, prevx=0, prevy=0;
  for(int bin = 0; bin<bins; bin++) {
    // first point is a point
    if(bin==0) {
      prevx = map(domain[bin],   start,end,  padding,width-padding);
      prevy = map(results[bin],  minr,maxr,  height-padding,padding);
      point(prevx, prevy);
      continue;
    }

    stroke(0);
    cx = map(domain[bin],   start,end,  padding,width-padding);
    cy = map(results[bin],  minr,maxr,  height-padding,padding);
    point(cx,cy);

    // NOTE: these lines may look completely wrong!
    stroke(0,0,50,25);
    line(prevx, prevy, cx, cy);
    prevx = cx;
    prevy = cy;
  }
  
  return new double[]{start,minr,end,maxr};
}

/**
 * Plot parametric function
 */
double[] drawParametric() throws UnknownSubstitutionException {
  double step = (end-start)/steps, result;
  String[] var_names = {controlledVar};
  double[] values = {0};
  
  double segments = (end-start)/step;
  int bins = (int) segments;
  double[] domain = new double[bins];

  double[] results_x = new double[bins];
  double minr_x = 999999999;
  double maxr_x = -minr_x;

  double[] results_y = new double[bins];
  double minr_y = minr_x;
  double maxr_y = maxr_x;
  
  double v, vx, vy;

  // get values
  for(int bin = 0; bin<bins; bin++) {
    v = start + bin*step;
    domain[bin] = v;
    values[0] = v;
    vx = tx.evaluate(var_names, values);
    results_x[bin] = vx;

    vy = ty.evaluate(var_names, values);
    results_y[bin] = vy;

    if(vx>maxr_x) { maxr_x = vx; }
    if(vx<minr_x) { minr_x = vx; }

    if(vy>maxr_y) { maxr_y = vy; }
    if(vy<minr_y) { minr_y = vy; }
  }
  
  // plot values, scaled to fit the surface
  double cx=0, cy=0, prevx=0, prevy=0;
  for(int bin = 0; bin<bins; bin++) {
    // first point is a point
    if(bin==0) {
      prevx = map(results_x[bin],  minr_x,maxr_x,  padding,width-padding);
      prevy = map(results_y[bin],  minr_y,maxr_y,  height-padding,padding);
      point(prevx, prevy);
      continue;
    }

    stroke(0);
    cx = map(results_x[bin],  minr_x,maxr_x,  padding,width-padding);
    cy = map(results_y[bin],  minr_y,maxr_y,  height-padding,padding);
    point(cx,cy);

    // NOTE: these lines may look completely wrong!
    stroke(0,0,50,25);
    line(prevx, prevy, cx, cy);
    prevx = cx;
    prevy = cy;
  }

  return new double[]{minr_x,minr_y,maxr_x,maxr_y};
}


// ========================================================================


/**
 * Necessary helper function due to String equivalence vs. identity
 */
boolean is(String a, String b) { return a.equals(b); }


/**
 * get the free parameters in the function
 */
ArrayList<String> getParameters() {
  ArrayList<String> params = tx.getParameters();
  if(ty!=null) { 
    ArrayList<String> yparams = ty.getParameters();
    for(String s: params) {
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


// ========================================================================


/**
 * This variable is the plot-controlling variable
 */
String controlledVar = "t";
void setControlled(String c) { 
  controlledVar = c; 
  if(clamps.containsKey(c)) {
    clamps.remove(c);
  }
}

/**
 * Set a non-controlling variable to a specific value
 */
HashMap<String,Double> clamps = new HashMap<String,Double>();
void clamp(String c, double v) { 
  if(!is(c,controlledVar)) {
    clamps.put(c,v);
  }
}

/**
 * Control the domain for the plotting variable
 */
double start = 0;
double end = 6.30;
void setRange(String varName, double _start, double _end) {
  if(is(varName,controlledVar)) {
    start = _start;
    end = _end;
  }
}

/**
 * Control the plotting resolution
 */
int steps = 250;
void setSteps(double plotInterval) {
  steps = (int) ((end-start)/plotInterval);
}

