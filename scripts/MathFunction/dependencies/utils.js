/**
 * If we don't have MathJax, we can still plot, just not render
 * pretty formulae.
 */
if(!MathJax) {
  if(console && console.warn) {
    console.warn("MathJax is not available, math functions will not be able to render LaTeX.");
  }
}


/**
 * Naive asymptote finding. Works by constructing a running dy/dx value
 * and seeing whether the transition from "previous" to "current" is
 * reasonably speaking impossible. Note: the lower the fidelity, they more
 * like that this generates false positives.
 */
var hasAsymptote = (function() {
  var px = false,
      py = false,
      dp = false,
      threshold = 4;
  return function(x,y) {
    if(px===false && py===false) {
      px = x;
      py = y;
      return false;
    }
    else if(dp===false) {
      dp = (y-py)/(x-px);
      px = x;
      py = y;
      return false;
    }
    var d = (y-py)/(x-px);
    var asym = (d>threshold && dp<-threshold) || (d<-threshold && dp>threshold);
    px = x;
    py = y;
    dp = d;
    return asym;
  };
}());


/**
 * Generic mapping function, with safeties. Note that this is a generator,
 * and yields a map function based on the indicated target domain.
 */
var map = function(r1, r2) {
  return function(value, d1, d2, retval) {
    if(isNaN(value)) return false;
    if(value==Infinity) { return pow(2,31); }
    if(value==-Infinity) { return -pow(2,31); }
    retval = r1 + (r2 - r1) * ((value - d1) / (d2 - d1));
    if(isNaN(retval)) return false;
    if(retval==Infinity) { return pow(2,31); }
    if(retval==-Infinity) { return -pow(2,31); }
    return retval;
  };
};
