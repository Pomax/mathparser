// global sketch
var sketch;

/**
 * bind the plotting sketch
 */
var bindPjs = function() {
  if(Processing) {
    sketch = Processing.getInstanceById("plot");
    if(sketch && sketch.plot) {
      find('#function_x').placeholder = sketch.getFunctionX();
      mathparser.tryPlot();
    }
    else { setTimeout(bindPjs, 250); }
  } else { setTimeout(bindPjs, 250); }
};

// kickoff
bindPjs();