/***
 *
 *  Math parser for plotting functions in Processing and Processing.js
 *
 ***/

// function variables
Variables variables = new Variables();
Variables getVariables() { return variables; }

String functionString_x="", functionString_y="";
String getFunctionX() { return functionString_x; }
String getFunctionY() { return functionString_y; }

FunctionTree tx=null, ty=null;
FunctionTree getFunctionTreeX() { return tx; }
FunctionTree getFunctionTreeY() { return ty; }

String controlledVar = "";

// Keep a little bit of border cleared around our graph.
double padding = 20;

// are we running in javascript?
boolean injs = (""+2.0==""+2);

/**
 * standard setup
 */
void setup() {
  size(400,400);
  noLoop();
  
  functionString_x = "x1*t^3 + 3*x2*t^2*(1-t) + 3*x3*t*(1-t)^2 + x4*t^3";
//  functionString_x = "sin(t) - cos(t)";
  tx = (new ArithmeticFragment(functionString_x)).formFunctionTree();

//  functionString_y = "cos(t) - sin(t)^2 + sin(t)";
//  ty = (new ArithmeticFragment(functionString_y)).formFunctionTree();

  // add variable "t"
  Variable t = new Variable("t");
  t.setDomain(0,1,0.01);
  variables.put(t.label, t);

  // add variables "x"
  Variable x;
  for(int i=1; i<=4; i++) {
    x = new Variable("x"+i);
    x.clamp(random(0,100));
    variables.put(x.label, x);
  }

  // make "t" our control variable
  variables.setControlled("t");
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
  try { bounds = plotGraph(); }
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
void parseFunction(String _functionString) {
  functionString_y = "";
  ty = null;
  parseFunctions(_functionString, null);
}

/**
 * set up new plot parameters (parametric function, 2 dimensions)
 */
void parseFunctions(String _functionString_x, String _functionString_y) {
  // variable snapshot pre-parse
  ArrayList<String> previous = getParameters();
  
  if (!is(functionString_x, _functionString_x)) {
    ArithmeticFragment a = new ArithmeticFragment(_functionString_x);
    FunctionTree _tx = a.formFunctionTree();
    functionString_x = _functionString_x; 
    tx = _tx;
  }

  if(_functionString_y!=null && !is(functionString_y,_functionString_y)) {
    ArithmeticFragment a = new ArithmeticFragment(_functionString_y);
    FunctionTree _ty = a.formFunctionTree();
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
}

/**
 * request a new plot
 */
void plot() { redraw(); }

/**
 * Plot parametric function
 */
double[] plotGraph() throws UnknownSubstitutionException {
  // this variable will act as our x-axis
  Variable contr = variables.controlled;

  // alias its values  
  double start = contr.start,
         end = contr.end,
         resolution = contr.resolution,
         segments = (end-start)/resolution;

  // set up the variable substitution arrays
  NameValueSet nvs = variables.getNameValueSet();
  String[] var_names = nvs.getNames();
  double[] values = nvs.getValues();
  int controlPosition = nvs.getControlPosition();

  int bins = 1 + (int) segments;
  double[] domain = new double[bins],
           results_x = new double[bins],
           results_y = new double[bins];
  double minr_x = 999999999,
         minr_y = minr_x,
         maxr_x = -minr_x,
         maxr_y = maxr_x,
         v, vx, vy;

  // calculate graphing values
  for(int bin = 0; bin<bins; bin++) {
    v = map(bin, 0,bins, start,end);
    domain[bin] = v;
    values[controlPosition] = v;

    vx = tx.evaluate(var_names, values);
    if(ty!=null) { vy = ty.evaluate(var_names, values); }
    else { vy = vx; vx = bin*resolution; }

    results_x[bin] = vx;
    if(vx>maxr_x) { maxr_x = vx; }
    if(vx<minr_x) { minr_x = vx; }

    results_y[bin] = vy;
    if(vy>maxr_y) { maxr_y = vy; }
    if(vy<minr_y) { minr_y = vy; }
  }
  
  // plot values, scaled to fit the surface
  double cx=0, cy=0, prevx=0, prevy=0;
  for(int bin = 0; bin<bins; bin++) {
    // draw point
    cx = map(results_x[bin],  minr_x,maxr_x,  padding,width-padding);
    cy = map(results_y[bin],  minr_y,maxr_y,  height-padding,padding);

    // connect the dots, BUT: this can completely misrepresent the graph =)
    if(bin>0) {
      strokeWeight(1);    
      stroke(0,0,100,50);
      line(prevx, prevy, cx, cy);
    }

    // draw the dots
    stroke(0);
    if(!injs) { strokeWeight(1.9); }
    point(cx,cy);
    prevx = cx;
    prevy = cy;
  }

  return new double[]{minr_x,minr_y,maxr_x,maxr_y};
}

/**
 * update a variable's domain, plot resolution and clamped value
 */
void updateVariable(String label, double min, double max, double resolution, double value) {
  variables.update(label, min, max, resolution, value);
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


// ========================================================================
