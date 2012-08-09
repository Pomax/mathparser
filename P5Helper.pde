
// helper functions for Processing - don't add for Processing.js
void point(double a, double b) { super.point((float)a, (float)b); }
void line(double a, double b, double c, double d) { super.line((float)a, (float)b, (float)c, (float)d); }
float map(double a, double b, double c, double d, double e) { return super.map((float)a, (float)b, (float)c, (float)d, (float)e); }
void text(String s, double a, double b) { super.text(s,(float)a,(float)b); }
double min(double a, double b) { return (a<b ? a : b); }
double max(double a, double b) { return (a<b ? b : a); }
double round(double d) { return Math.round(d); }
