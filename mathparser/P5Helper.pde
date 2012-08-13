/**
 * A helper class for Processing, as most functions (annoyingly) do not support doubles.
 */

// drawing functions just wrap, since double or float doesn't matter when it's all int-cast anyway
void point(double a, double b) { super.point((float)a, (float)b); }
void line(double a, double b, double c, double d) { super.line((float)a, (float)b, (float)c, (float)d); }
void rect(double a, double b, double c, double d) { super.rect((float)a, (float)b, (float)c, (float)d); }
void ellipse(double a, double b, double c, double d) { super.ellipse((float)a, (float)b, (float)c, (float)d); }
void triangle(double a, double b, double c, double d, double e, double f) { super.triangle((float)a, (float)b, (float)c, (float)d, (float)e, (float)f); }
void arc(double a, double b, double c, double d, double e, double f) { super.arc((float)a, (float)b, (float)c, (float)d, (float)e, (float)f); }
void quad(double a, double b, double c, double d, double e, double f, double g, double h) { super.quad((float)a, (float)b, (float)c, (float)d, (float)e, (float)f, (float)g, (float)h); }
void bezier(double a, double b, double c, double d, double e, double f, double g, double h) { super.bezier((float)a, (float)b, (float)c, (float)d, (float)e, (float)f, (float)g, (float)h); }
void curve(double a, double b, double c, double d, double e, double f, double g, double h) { super.curve((float)a, (float)b, (float)c, (float)d, (float)e, (float)f, (float)g, (float)h); }
void text(String s, double a, double b) { super.text(s,(float)a,(float)b); }

// helper functions do not wrap, since they're basically arithmetic macros
double constrain(double a, double b, double c) { return (a<b ? b : (a>c ? c : a)); }
double map(double a, double b, double c, double d, double e) { double i1=c-b, i2=e-d; return ((a-b) * i2/i1)+d; }
double abs(double a) { return (a<0 ? -a : a); }
double min(double a, double b) { return (a<b ? a : b); }
double max(double a, double b) { return (a<b ? b : a); }

// math functions call Math.function instead
double floor(double d) { return Math.floor(d); }
double round(double d) { return Math.round(d); }
double ceil(double d) { return Math.ceil(d); }
double sqrt(double d) { return Math.sqrt(d); }
double pow(double d, double p) { return Math.pow(d,p); }

// trig
double sin(double d) { return Math.sin(d); }
double cos(double d) { return Math.cos(d); }
double tan(double d) { return Math.tan(d); }
double asin(double d) { return Math.asin(d); }
double acos(double d) { return Math.acos(d); }
double atan(double d) { return Math.atan(d); }
double sinh(double d) { return Math.sinh(d); }
double cosh(double d) { return Math.cosh(d); }
double tanh(double d) { return Math.tanh(d); }

// fake trig!
double atan2(double dy, double dx) { return Math.atan2(dy,dx); }

// Why ln vs. log? BECAUSE THAT'S WHAT WE HAVE THOSE NAMES FOR!
// The "log" function is the decimal logarithm, it is not the natural logarithm!
double ln(double d) { return Math.log(d); }
double log(double d) { return Math.log10(d); }

