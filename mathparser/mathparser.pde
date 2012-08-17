/***
 *
 *  Math parser for plotting functions in Processing and Processing.js
 *
 ***/

// function variables
Variables variables = new Variables();
String functionString_x="", functionString_y="";
FunctionTree tx=null, ty=null;

String controlledVar = "";

// Keep a little bit of border cleared around our graph.
double padding = 20;

/**
 * standard setup
 */
void setup() {
  size(400,400);
  noLoop();
  test();
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
    x = map(0,min(bounds[0],bounds[2]),max(bounds[0],bounds[2]),padding,width-padding);
    line(x,0,x,height); }
  if((bounds[1]<0 && bounds[3]>0) || (bounds[1]>0 && bounds[3]<0)) {
    y = map(0,min(bounds[1],bounds[3]),max(bounds[1],bounds[3]),height-padding,padding);
    line(0,y,width,y); }

  // label the axes
  fill(0);
  textAlign(LEFT);
  text(prec(bounds[1],2), 3, height-padding-3); // miny
  text(prec(bounds[3],2), 3, padding+15); // maxy
  text(prec(bounds[0],2), padding+5, height-3); // minx
  textAlign(RIGHT);
  text(prec(bounds[2],2), width-padding+4, height-3); // maxx
  textAlign(CENTER);
  text((ty==null ? variables.controlled.label : "x") + " →", width/2, height-5);
  text("↑\n" + (ty==null ? "f(t)" : "y"), padding/2, height/2);
  
  if(js!=null) { js.MathParser.plotFinished(this); }
}

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
         v=start, vx, vy,
         stepSize = (end-start)/segments;

  // calculate graphing values
  for(int bin = 0; bin<bins; bin++) {
    v = map(bin, 0,bins-1, start,end);
    
    domain[bin] = v;
    values[controlPosition] = v;
    
    vx = tx.evaluate(var_names, values);
    if(ty!=null) { vy = ty.evaluate(var_names, values); }
    else { vy = vx; vx = v; }

    results_x[bin] = vx;
    if(!is(""+vx,"Infinity")) {
      if(vx>maxr_x) { maxr_x = vx; }
      if(vx<minr_x) { minr_x = vx; }
    }

    results_y[bin] = vy;
    if(!is(""+vy,"Infinity")) {
      if(vy>maxr_y) { maxr_y = vy; }
      if(vy<minr_y) { minr_y = vy; }
    }
  }
  
  // plot values, scaled to fit the surface
  double cx=0, cy=0, prevx=0, prevy=0;
  for(int bin = 0; bin<bins; bin++) {
    // draw point
    cx = map(results_x[bin],  minr_x,maxr_x,  padding,width-padding);
    cy = map(results_y[bin],  minr_y,maxr_y,  height-padding,padding);

    // skip over NaN values
    if(is(""+cx,"NaN") || is(""+cy,"NaN")) continue;
   
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

  double[] bounds = {minr_x,minr_y,maxr_x,maxr_y};
  return bounds;
}
