// START OF CONDITIONAL LOADING
(function(){ if (true) {
// START OF CONDITIONAL LOADING

  /**
   * Our math parser object
   */
  window["mathparser"] = MathParser = {};

  /**
   * We all know what this does
   */
  MathParser.debug = false;
  
  /**
   * Debug logging
   */
  MathParser.log = function(s) {
    if(MathParser.debug) {
      console.log(s);
    }
  }

  /**
   * parametric or single
   */
  MathParser.checkbox = function(input) {
    MathParser.log("MathParser.checkbox");
    var on = input.checked, off = !on;
    find("#params").css("display", off ? "none" : "block");
    MathParser.tryPlot();
  };
  
  /**
   * called when the sketch has loaded for the first time
   */
  MathParser.plotFinished = function(p) {
    MathParser.log("MathParser.plotFinished");

    // load the sketch's free variables
    var variables = p.getVariables(),
        keys = variables.getKeys(),
        values = variables.getValues(),
        i, last=values.size(), variable;

    // display each variable on the page
    // as a controllable entity.
    find('#variables').clear();
    for(i=0; i<last; i++) {
      variable = values.get(i);
      MathParser.addVariable(variable); }
  }

  /**
   * add listeners to the function text inputs
   */
  MathParser.tryPlot = function(input) {
    MathParser.log("MathParser.tryPlot");
  
    var fx = find('#function_x').value || find('#function_x').placeholder;
    var fy = find('#function_y').value || find('#function_y').placeholder;
    if(!find("#parametric").checked) { fy = false; }
    
    var success = false;
    try {
      if(fy===false) { success = sketch.parseFunction(fx); }
      else { success = sketch.parseFunctions(fx, fy); }
      if(success) {
        MathParser.log("MathParser.tryPlot - parseFunction succeeded.");
        MathParser.log("MathParser.tryPlot - fx: "+fx);
        MathParser.log("MathParser.tryPlot - fy: "+fy);
      } else { MathParser.log("parseFunction failed"); return; }

      MathParser.log("MathParser.tryPlot - tx ", sketch.getFunctionTreeX().toString());
      MathParser.log("MathParser.tryPlot - pre ", sketch.getVariables().getKeys().toArray());

      // and finally, let's see it:
      sketch.redraw();
    } catch(e) {
      MathParser.log("error",e);
    }
  };

  /**
   * Add a variable's HTML representation to the page
   */
  MathParser.addVariable = function(variable) {
    MathParser.log("MathParser.addVariable");
    var variables = find('#variables');
    variables.add(MathParser.formVariableDiv(variable));
  }
  
  /**
   * Get a value by prompting the user
   */
  MathParser.promptFor = function(selector, title) {
    MathParser.log("MathParser.promptFor");
    var newval = prompt(title);
    if(newval==parseFloat(newval)) {
      find(selector).html(newval);
      return newval;
    }
  }
  
  /**
   * update the range slider and its associated label values
   */
  MathParser.updateRangeAndValue = function(label, min, max, step) {
    MathParser.log("MathParser.updateRangeAndValue");
    if(min===null && max==null && step==null) return;
    var cur = find("#current_"+label),
        curval = parseFloat(cur.html()),
        range = find("#range_"+label);
    if(min!=null) {
      range.min = min;
      if(curval<min) { cur.html(min); }
    }
    if(max!=null) {
      range.max = max;
      if(curval>max) { cur.html(max); }
    }
    if(step!=null) {
      range.step = step;
    }
    MathParser.updateVariable(label, range, cur.html());
  }
  
  /**
   * update a variable based on its range slider, then redraw the plot
   */
  MathParser.updateVariable = function(label, range, value) {
    MathParser.log("MathParser.updateVariable");
    var cur = find("#current_"+label);
    MathParser.log("MathParser.updateVariable - calling sketch.updateVariable");
    sketch.updateVariable(label, parseFloat(range.min), parseFloat(range.max), parseFloat(range.step), parseFloat(value));
    MathParser.tryPlot();
  }

  /**
   * create an HTML element that represents and interacts with this variable
   */
  MathParser.formVariableDiv = function(variable) {
    MathParser.log("MathParser.formVariableDiv");
    var label = variable.label,
        start = variable.start,
        end = variable.end,
        step = variable.resolution,
        value = variable.value,
        range_properties = {"class": "range", type: "range", id: "range_"+label, min: start, max: end, step: step, value: value};
    var div = create("div").set({"class": "variable", id: "variable_"+label});
    div.add(create("span").set("class","label").html(label),
            create("span").set({"class": "start", id: "start_"+label}).css("cursor","pointer").listen("click", function(){
              MathParser.updateRangeAndValue(label, MathParser.promptFor("#start_"+label, "start value?"), null, null);
            }).html(""+start),
            create("input").set(range_properties).listen("change", function() {
              find("#current_"+label).html(Math.round(1000*this.value)/1000);
              MathParser.updateVariable(label, this, this.value);
            }),
            create("span").set({"class": "end", id: "end_"+label}).css("cursor","pointer").listen("click", function(){
              MathParser.updateRangeAndValue(label, null, MathParser.promptFor("#end_"+label, "end value?"), null);
            }).html(""+end),
            create("span").set({"class": "resolution", id: "resolution_"+label}).css("cursor","pointer").listen("click", function(){
              MathParser.updateRangeAndValue(label, null, null, MathParser.promptFor("#resolution_"+label, "plot resolution?"));
            }).html(""+step),
            create("span").set({"class": "value", id: "current_"+label}).html(""+value),
            create("span").set({"class": "debug", id: "debug_"+label}).html("debug").listen("click",function(){
              window["current_variable"] = sketch.getVariables().get(label);
              MathParser.log("created a global 'current_variable' for inspecting variable "+label+". content: ",current_variable);
            }).set("title","refer to the console after clicking debug"));
    return div;
  }



// END OF CONDITIONAL LOADING
}}());
// END OF CONDITIONAL LOADING