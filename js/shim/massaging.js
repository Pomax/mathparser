/*
  Helper function for dealing with jQuery UI sliders
*/
MathParser.onAddVariable = function(variable, htmlElement) {
  var label = variable.label,
      update = function(event, ui) {
        // This is ridiculous, but necessary: compute slider value manually
        var head = ui.handle,
            base = head.parentNode,
            l = $(base).offset().left,
            o = $(head).offset().left - l + $(head).width()/2,
            w = $(base).width(),
            hval = o/w,
            min = parseFloat(base.getAttribute("min")),
            max = parseFloat(base.getAttribute("max")),
            step = parseFloat(base.getAttribute("step")),
            iv = 1 / step,
            value = Math.round(iv*(min + hval * (max - min)))*step;
        // even more ridiculousness
        base.setAttribute("value",value);
        find("#current_"+label).html(Math.round(1000*value)/1000);
        MathParser.updateVariable(label, this, value);
      };
  $("#range_"+label).slider({change: update, start: update, slide: update, stop: update}).attr("id","range_"+label);
};

