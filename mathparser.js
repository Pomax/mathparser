// START OF CONDITIONAL LOADING
(function(){ if (true) {
// START OF CONDITIONAL LOADING

  /**
   * Our math parser object
   */
  window["mathparser"] = MathParser = {};

  /**
   * parametric or single
   */
  MathParser.checkbox = function(input) {
    var on = input.checked, off = !on;
    find("#params").css("display", off ? "none" : "block");
    MathParser.tryPlot();
  };

  /**
   * add listeners to the function text inputs
   */
  MathParser.tryPlot = function(input) {
    var fx = find('#function_x').value || find('#function_x').placeholder;
    var fy = find('#function_y').value || find('#function_y').placeholder;
    if(!find("#parametric").checked) { fy = false; }
    
    find('#variables').clear();
    if(fy===false) { sketch.parseFunction(fx); }
    else { sketch.parseFunctions(fx, fy); }

    // load the variables section
    var variables = sketch.getVariables(),
        values = variables.getValues(),
        i, last=values.size(), variable;
    for(i=0; i<last; i++) {
      variable = values.get(i);
      MathParser.addVariable(variable); }

    // also make "t" the controlled variable
    sketch.getVariables().setControlled("t");

    // and finally, let's see it:
    sketch.redraw();
  };

  /**
   * Add a variable's HTML representation to the page
   */
  MathParser.addVariable = function(variable) {
    var variables = find('#variables');
    variables.add(MathParser.formVariableDiv(variable));
  }
  
  /**
   * Get a value by prompting the user
   */
  MathParser.promptFor = function(selector, title) {
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
    var cur = find("#current_"+label);
    sketch.updateVariable(label, range.min, range.max, range.step, value);
    sketch.redraw();
  }

  /**
   * create an HTML element that represents and interacts with this variable
   */
  MathParser.formVariableDiv = function(variable) {
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
            create("span").set({"class": "value", id: "current_"+label}).html(""+value));
    return div;
  }



// END OF CONDITIONAL LOADING
}}());
// END OF CONDITIONAL LOADING