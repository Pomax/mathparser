// global sketch
var sketch;

/**
 * bind the plotting sketch
 */
var bindPjs = function() {
  if(Processing) {
    sketch = Processing.getInstanceById("plot");
    if(sketch) {
      sketch.bindJavaScript(this);
      find('#function_x').placeholder = sketch.getFunctionX();
      MathParser.parseURL();
    }
    else { setTimeout(bindPjs, 250); }
  } else { setTimeout(bindPjs, 250); }
};

// kickoff
bindPjs();

var sketchLoaded = function(sketch) {
  //console.log("sketch loaded");
}

var plotFinished = function(sketch) {
  //console.log("plot finished");
  MathParser.plotFinished(sketch);
}
