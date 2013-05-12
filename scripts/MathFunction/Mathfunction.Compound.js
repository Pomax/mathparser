/**
 * Compound (parametric) function
 */
MathFunction.Compound = function(fns) {
  var functions = [];
  var addMathFunction = function(string) { functions.push(new MathFunction(string)); };
  if(fns instanceof Array) { fns.forEach(addMathFunction); }
  else { Array.prototype.forEach.call(arguments, addMathFunction); }
  this.functions = functions;
};

MathFunction.Compound.prototype = {
  /**
   * get all parameters used in this compound function
   */
  getParameters: function() {
    var parameters = [];
    this.functions.forEach(function(f) {
      f.functionTree.getParameters().forEach(function(p) {
        if(parameters.indexOf(p)===-1) {
          parameters.push(p);
        }
      });
    });
    return parameters;
  },

  /**
   * show the function on the page, in LaTeX format. Typeset with MathJax, if available
   */
  render: function(container) {
    var str = "\\[\\left \\{ \\begin{array}{l}\n", ltx = [], i=1;
    this.functions.forEach(function(mf) {
      ltx.push("f_" + (i++) + " = " + mf.LaTeX);
    });
    str += ltx.join("\\\\\n") + "\n\\end{array} \\right . \\]";
    container.innerHTML = str;
    if(MathJax) { MathJax.Hub.Queue(["Typeset", MathJax.Hub, container]); }
  },

  /**
   * Plot a compound function. The options object is similar to
   * the one used for MathFunction, but has an extra property
   * "order", which is an array [<num>,<num>[,<num>]*] that
   * indicates which function to use for x, y, (z, etc).
   */
  plot: function(container, options, viewbox) {
    this.options = options;
    viewbox = viewbox || {minx:0, maxx:container.clientWidth, miny:0, maxy:container.clientHeight};
    var context;
    if(!this.plotCanvas) {
      var canvas = document.createElement("canvas");
      canvas.width = options.width || 400;
      this.mapx = map(0,canvas.width);
      canvas.height = options.height || 400;
      this.mapy = map(canvas.height,0);
      canvas.style.border = "1px solid black";
      container.innerHTML="";
      container.appendChild(canvas);
      this.plotCanvas = canvas;
      context = this.plotCanvas.getContext("2d");
      this.clear(context);
      this.functions.forEach(function(mf) {
        mf.plotCanvas = canvas;
      });
    } else { context = this.plotCanvas.getContext("2d"); }
    var o = options,
        c = options.variable,
        plotData = [],
        minmax = [],
        v = viewbox;
    this.functions.forEach(function(mf) {
      plotData.push(mf.functionTree.plot(c.label, c.start, c.end, c.step, o.clamped));
      minmax.push({minx:v.minx, maxx:v.maxx, miny:v.miny, maxy:v.maxy, asymptotes:[]});
    });
    this.drawAxes(context, viewbox.order, viewbox.axes, minmax);
    this.drawPlotData(context, viewbox.order, plotData, minmax);
  },

  /**
   * draw the plot axes
   */
  drawAxes: function(context, order, axes, minmax) {
    order = order || [0,1];
    axes = axes || {x:0,y:0};
    var xid = order[0],
        yid = order[1],
        axis;

    axis = this.mapx(axes.x, minmax[xid].minx ,minmax[xid].maxx);
    context.strokeStyle = "#999";
    context.moveTo(axis, 0);
    context.lineTo(axis, 400);
    context.stroke();
    context.beginPath();

    axis = this.mapy(axes.y, minmax[yid].miny ,minmax[yid].maxy);
    context.moveTo(0,axis);
    context.lineTo(400,axis);
    context.stroke();
    context.beginPath();
  },

  /**
   * draw the function onto the canvas
   */
  drawPlotData: function(context, order, plotData, minmax) {
    order = order || [0,1];
    context.strokeStyle = "black";
    var i, last=plotData[0].length, ox, oy, x, y, xid=order[0], yid=order[1];
    for(i=0; i<last; i++) {
      ox = plotData[xid][i][1];
      oy = plotData[yid][i][1];
      x = this.mapx(ox, minmax[xid].minx, minmax[xid].maxx);
      y = this.mapy(oy, minmax[yid].miny, minmax[yid].maxy);
      context.lineTo(x,y);
    }
    context.stroke();
  },

  /**
   * clear all plots so far
   */
  clear: function(context) {
    MathFunction.prototype.clear.call(this,context);
  },

  /**
   *
   */
  toString: function() {
    var str = [];
    this.functions.forEach(function(mf) {
      str.push(mf.toString());
    });
    return str.join(", ");
  },

  /**
   *
   */
  toLaTeX: function() {
    var str = [];
    this.functions.forEach(function(mf) {
      str.push(mf.toLaTeX());
    });
    return str;
  }
};
