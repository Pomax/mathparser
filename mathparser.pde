
 /***
   *
   *  Math parser for plotting functions in Processing and Processing.js
   *
  ***/

void setup(){
  noLoop();
//  test();
}

void draw() {
  background(255);
  stroke(0);
  plot("t^3*0 + 3*t^2*(1-t)*90 + 3*t*(1-t)^2*10 + (1-t)^3*100","t",0,1,100);
}

int afCount = 1;

void test() {
  ArithmeticFragment a = new ArithmeticFragment("x^(y*y*x) + sin(x+pi) + cos(y+ln(x)) + sin(y)");
  a.expand();
  TreeNode t = a.formFunctionTree();
 
  String[] var_names = {"x", "y"};
  double[] values = {2.0, 3.0}; 
  double result = t.evaluate(var_names, values);
  println(result);

  exit(); 
}

void plot(String function, String var, double start, double end, int steps) {
  ArithmeticFragment a = new ArithmeticFragment(function);
  a.expand();
  TreeNode t = a.formFunctionTree();
  double step = (end-start)/steps, result;
  String[] var_names = {var};
  double[] values = {0};
  for(double v = start; v<=end; v+=step) {
    values[0] = v;
    result = t.evaluate(var_names, values);
    println(result);
    point(map(v,start,end,0,width), result);
  }
}

// helper
void point(double a, double b) { super.point((float)a, (float)b); }
float map(double a, double b, double c, double d, double e) { return super.map((float)a, (float)b, (float)c, (float)d, (float)e); }
