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
   * Were the functions changed through user-
   * interaction? If so, we'll need to refetch
   * all variables when a plot occurred. If not
   * we don't have to do that.
   */
  MathParser.functionsChanged = true;
  
  /**
   * The list of current variables
   */
  MathParser.variables = [];
  
  /**
   * Debug logging
   */
  MathParser.log = function(s) {
    if(MathParser.debug) {
      console.log(s);
    }
  }
  
  /**
   * Parse a URL for predefined function arguments
   */
  MathParser.parseURL = function() {
    var url = window.location.toString();
    url = url.split("?")[1];
    if (url) {
      var pairs = url.split("&"),
          last = pairs.length,
          pair, property, value, i,
          labels, start, end, resolution, values;
      for(i=0; i<last; i++) {
        pair = pairs[i].split("=");
        property = pair[0];
        value    = pair[1];

        if(property == "fx") {
          MathParser.functionsChanged = true;
          find("#function_x").value = value; }
        else if(property == "fy") {
          if(value) {
            MathParser.functionsChanged = true;
            find("#function_y").value = value; 
            find("#parametric").set("checked","checked");
            find("#params").css("display", "block"); }}
        else if(property == "labels") { labels = value.split(","); }
        else if(property == "start") { start = value.split(",");}
        else if(property == "end") { end = value.split(","); }
        else if(property == "resolution") { resolution = value.split(","); }
        else if(property == "values") { values = value.split(","); }
      }

      if(labels) {
        var l, s, e, r, v;
        for(i=0, last=labels.length; i<last; i++) {
          l = labels[i];
          s = (start) ? parseFloat(start[i]) : 0;
          e = (end) ? parseFloat(end[i]) : 1;
          r = (resolution) ? parseFloat(resolution[i]) : 0.1;
          v = (values) ? parseFloat(values[i]) : s;
          sketch.updateVariable(l, s, e, r, v);
        }
      }
      
      if(MathParser.functionsChanged) {
        MathParser.tryPlot();
      }
    }
  }
  
  /**
   * Generate a URL tail for generating these results
   */
  MathParser.generateURL = function() {
    var labels=[], start=[], end=[], resolution=[], values=[],
         vars = MathParser.variables, last = vars.length, i, e;
    for(i=0; i<last; i++) {
      e = vars[i];
      labels.push(e.label);
      start.push(e.start);
      end.push(e.end);
      resolution.push(e.resolution);
      values.push(Math.round(10000*e.value)/10000);
    }
    var URL = "?";
        addFragment = function(name, array, skip) {
          URL += (skip? "":"&") +name+"="+array.join(",");
        };
    addFragment("fx", [sketch.getFunctionX()], true);
    addFragment("fy", [sketch.getFunctionY()]);
    addFragment("labels", labels);
    addFragment("start", start);
    addFragment("end", end);
    addFragment("resolution", resolution);
    addFragment("values", values);
    return URL;
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
    
    // if the functions changed, we'll need to load
    // the sketch's free variables anew (this will
    // recycle already used variables in the sketch).
    if(MathParser.functionsChanged) {
      var variables = p.getVariables(),
          keys = variables.getKeys(),
          values = variables.getValues(),
          i, last=values.size(), variable;

      // display each variable on the page
      // as a controllable entity.
      find('#variables').clear();
      MathParser.variables = [];
      for(i=0; i<last; i++) {
        variable = values.get(i);
        MathParser.addVariable(variable);
      }

      MathParser.functionsChanged = false;
    }
    
    // update the page link
    find("#link").set("href", "./" + MathParser.generateURL());
  }
  
  /**
   * Try a plot after noting that the reason
   * we do this is because we changed the function(s).
   */
  MathParser.updateFunction = function(input) {
    MathParser.functionsChanged = true;
    MathParser.tryPlot();
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
    MathParser.variables.push(variable);
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