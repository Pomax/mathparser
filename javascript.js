
// quick and dirty selector
var $ = function(s) { return document.querySelector(s); };

// vars
var undef,
    y_backup = "",
    y_placeholder = "cos(t) - sin(t)^2 + sin(t)",
    sketch;

/**
 * Set the range for the controlled variable
 */
function setRange(min, max, rangeinput) {
  var newval = prompt("new value?");
  if(newval === undef || parseFloat(newval) != newval) return;

  if(!min) {
    max.innerHTML = newval;
    while(!rangeinput.max) { rangeinput = rangeinput.previousSibling; }
    rangeinput.setAttribute("max", newval);
  }
  if(!max) {
    min.innerHTML = newval;
    while(!rangeinput.max) { rangeinput = rangeinput.nextSibling; }
    rangeinput.setAttribute("min", newval);
  }
  var label = $('#var_val_'+rangeinput.name),
       lval = parseFloat(label.innerHTML);
  if(lval<rangeinput.min) {
    setVarValue(rangeinput.name, rangeinput.min);
  }
  if(lval>rangeinput.max) {
    setVarValue(rangeinput.name, rangeinput.max);
  }
  sketch.setRange(rangeinput.name, rangeinput.min, rangeinput.max);
  plot();
}

/**
 * set the value for a variable
 */
function setVarValue(varname, val) {
  $('#var_val_'+varname).innerHTML = Math.round(val*1000)/1000;
  sketch.clamp(varname, val);
  plot();
}

/**
 * set the plotting resolution for a variable
 */
function setSteps(stepspan) {
  var val = parseInt(stepspan.innerHTML),
      rangeinput = stepspan;
  while(!rangeinput.step) { rangeinput = rangeinput.previousSibling; }

  var newval = prompt("plot interval?");
  if(newval === undef || parseFloat(newval) != newval) return;

  rangeinput.step = newval;
  stepspan.innerHTML = newval;
  sketch.setSteps(parseFloat(newval));
  plot();
}

/**
 * Set which variable is the controlled variable
 */
function setControlled(varname) {
  sketch.setControlled(varname);
  plot();
}

/**
 * generate the list of variables
 */
var oldvars = [];
function listVariables(varNames) {
  var i, last=varNames.length, stop=true;
  for(i=0; i<last; i++) {
    if(oldvars[i] != varNames[i]) {
      stop = false;
      break;
    }
  }
  if(stop) return;
  oldvars = varNames;

  var vars = $('#variables'),
      option, span,
      varName;
  vars.innerHTML = "";
  for(i=0; i<last; i++) {
    varName = varNames[i];
    option = document.createElement("div");
    option.setAttribute("class","variable");
    option.innerHTML = " " + varNames[i] +
                       " <input type='radio' name='var[]' onclick='setControlled(\""+varName+"\")'>"+
                       " <span class='clickme' onclick='setRange(this, null, this)'>0</span>" +
                       " <input type='range' name='"+varName+"' min='0' max='100' step='0.1' value='0' onchange='setVarValue(\""+varName+"\",this.value)'>"+
                       " <span class='clickme' onclick='setRange(null, this, this)'>100</span>" +
                       " - resolution: <span class='clickme' onclick='setSteps(this)' id='var_val_steps_"+varName+"'>0.1</span>" +
                       " - value: <span id='var_val_"+varName+"'>0</span>";
    vars.appendChild(option);
  }
}

/**
 * Plot the graph based on all the current information
 */
function plot() {
  var fx = $('#function_x').value || $('#function_x').placeholder;
  var fy = $('#function_y').value || $('#function_y').placeholder;
  fx = fx.replace(/ +/g,'');
  fy = fy.replace(/ +/g,'');
  if(!$('#parametric').checked) { fy = null; }

  if (sketch && sketch.plot) {
/*
    // build link
    var link = "?fx="+fx+"&fy="+fy+"&var="+v+"&start="+s+"&end="+e+"&steps="+steps;
    $('#link').href = link;
*/
    // show sketch
    sketch.plot(fx,fy); //,v,parseFloat(s),parseFloat(e),parseInt(steps));
    
    // let user pick which variable is controlled, and which are clamped
    var parameters = sketch.getParameters(), last=parameters.size(), i, s=[];
    for(i=0; i<last; i++) { s.push(parameters.get(i)); }
    listVariables(s);
  }
}

// ===========================================================================

/**
 * parametric or single
 */
function checkbox(input) {
  var on = input.checked, off = !on;
  $("#params").style.display = (off ? "none" : "block");
  $('#function_y').placeholder = y_placeholder;
  $('#paramlabel_x').innerHTML = (off ? "" : " for x");
  $('#paramlabel_y').innerHTML = (off ? "" : " for y");
  plot();
}

/**
 * set up key handling for all <input> text fields
 */
function bindInput() {
  document.removeEventListener("DOMContentLoaded",bindInput,false);
  var inputs = document.querySelectorAll("input[type=text]"),
      last = inputs.length,
      i;
  for(i=0; i<last; i++) {
    inputs[i].onkeyup = function() { try { plot(); } catch(e) { /* irrelevant */ } };
  }
}

/**
 * bind the plotting sketch
 */
function bindPjs() {
  sketch = Processing.getInstanceById("plot");
  if(sketch && sketch.plot) { plot(); }
  else { setTimeout(bindPjs, 250); }
}

/**
 * Do the demo plot, or if window.location shows there are
 * custom parameters, that one.
 */
function initialPlot() {
  bindPjs();
  document.removeEventListener("DOMContentLoaded",initialPlot,false);
  var l = window.location.toString(),
       sep = l.indexOf("?");
  if(sep > -1) {
    var terms = l.substring(sep+1).split("&"),
        last = terms.length,
        i, pair, property, value;
    for(i=0; i<last; i++) {
      pair = terms[i].split("=");
      property = pair[0];
      value = pair[1].replace(/%20/g,'');
      switch(property) {
        case "fx"    : $('#function_x').value = value; break;
        case "fy"    : if(value!="null") {
                          $('#function_y').value = value;
                          var input = $('#parametric');
                          input.checked = "checked";
                          checkbox(input);
                        } break;
        case "var"   : $('#variables').value = value; break;
        case "start" : $('#start').value = value; break;
        case "end"   : $('#end').value = value; break;
        case "steps" : $('#steps').value = value; break;
      }
    }
    plot();
  }
}

// set up the onload handling
document.addEventListener("DOMContentLoaded",bindInput,false);
document.addEventListener("DOMContentLoaded",initialPlot,false);
