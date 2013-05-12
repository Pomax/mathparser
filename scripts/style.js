/**
 * Style a MathFunction on the page
 */
var update = (function() {

  var curFn = "",
      curMF = false,
      parameters = [],
      clamped = [],
      section;

  /**
   * plotting function based on on-page parameters
   */
  return function plot(container) {
    section = container || find('section[data-visible]');
    var fn = section.find('.function').value,
        p = section.find('.prettyFormula'),
        plotDiv = section.find('.plots'),
        mathFunction;

    /**
     * Administrative code for when a function has changed
     */
    if(curFn!=fn) {
      // bind math function
      curFn = fn;
      if(fn.indexOf(',')!==-1) {
        args = fn.split(',');
        mathFunction = new MathFunction.Compound(args);
      } else { mathFunction = new MathFunction(fn) }
      curMF = mathFunction;
      // add clamp parameters
      parameters = curMF.getParameters();
      parameters.splice(parameters.indexOf('x'),1);
      var clamps = section.find("div.clamps");
      // clean out clamps that are no longer relevant
      clamped.forEach(function(clamp) {
        if(parameters.indexOf(clamp)===-1) {
          clamps.find(".label"+clamp).remove();
          clamps.find(".label"+clamp+"label").remove();
        }
      });
      clamped = [];
      // add new clamps based on the function parameters
      parameters.forEach(function(clamp) {
        if(clamps.find(".label"+clamp).length>0) return;
        clamped.push(clamp);
        var range = create("input");
        range.set("type","range");
        range.set({min:0,max:100,step:1,value:1});
        range.onchange = function() { plot(); };
        range.classes().add("label"+clamp);
        clamps.add(range);
        clamps.add(create("span",{"class":"label"+clamp+"label"},clamp));
      });
    } else { mathFunction = curMF; }

    // show formula on the page
    mathFunction.render(p);

    // get the variable plotting values
    var start = parseFloat(section.find('div[type=range].start').get("value")),
        end   = parseFloat(section.find('div[type=range].end').get("value")),
        step  = parseFloat(section.find('div[type=range].step').get("value"));

    if(end<start) {
      end = start + 0.1;
      section.querySelector('div[type=range].end').set("value",end); }

    step = (step>0 ? step : 0.001);
    section.find('.startval').innerHTML = Math.round(start*1000)/1000;
    section.find('.endval').innerHTML   = Math.round(end*1000)/1000;
    section.find('.stepval').innerHTML  = Math.round(step*100000)/100000;

    // get the clamped values
    var clamps = [];
    parameters.forEach(function(clamp) {
      var val = parseFloat(section.find('div[type=range].label'+clamp).get("value"));
      clamps.push({ label: clamp, value: val });
    });

    // construct the plotting options object
    var options = {
      width: 400,
      height: 200,
      variable: { label: 'x', start: start, end: end, step: step },
      clamped: clamps
    };

    // plot the plotting viewbox
    var viewbox = {
      minx: parseFloat(section.querySelector(".v_minx").value),
      maxx: parseFloat(section.querySelector(".v_maxx").value),
      miny: parseFloat(section.querySelector(".v_miny").value),
      maxy: parseFloat(section.querySelector(".v_maxy").value),
      axes: { x: 0, y: 0 }
    };

    // and finally, plot the math function onto the page
    mathFunction.clear();
    mathFunction.plot(plotDiv, options, viewbox);
  }
}());
