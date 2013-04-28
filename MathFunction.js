/**
 * Mathematical function object.
 */
(function(){

  /**
   * naive asymptote finding. Works by constructing a dy/dx value
   */
  var hasAsymptote = (function() {
    var px = false, py = false, dp = false, threshold = 4;
    return function(x,y) {
      if(px==false && py==false) { px = x; py = y; return false; }
      else if(dp==false) { dp = (y-py)/(x-px); px = x; py = y; return false; }
      var d = (y-py)/(x-px);
      var asym = (d>threshold && dp<-threshold) || (d<-threshold && dp>threshold);
      px = x;
      py = y;
      dp = d;
      return asym;
    };
  }());

  /**
   * generic mapping function, with safeties.
   */
  var map = function(value, d1, d2, r1, r2, retval) {
    if(isNaN(value)) return false;
    if(value==Infinity) { return Math.pow(2,31); }
    if(value==-Infinity) { return -Math.pow(2,31); }
    retval = r1 + (r2 - r1) * ((value - d1) / (d2 - d1));
    if(isNaN(retval)) return false;
    if(retval==Infinity) { return Math.pow(2,31); }
    if(retval==-Infinity) { return -Math.pow(2,31); }
    return retval;
  };

// ==========================================

  var MathFunction = function(functionText) {
    this.plotCanvas = false;
    this.functionString = "";
    this.LaTeX = "";
    this.arithmeticFragment = false;
    this.functionTree = false;
    this.init(functionText);
  };

  MathFunction.prototype = {
    /**
     * initialise this math function
     */
    init: function(functionString) {
      this.functionString = functionString.replace(/\s/g,'');
      this.arithmeticFragment = new ArithmeticFragment(this.functionString);
      var balance = this.arithmeticFragment.getBalance();
      if(balance===0) {
        this.functionTree = this.arithmeticFragment.formFunctionTree();
        this.LaTeX = this.functionTree.toLaTeX();
      } else { throw "Function is unbalanced: "+this.arithmeticFragment.toString()+" has "+balance+" open groups"; }
    },
    /**
     * show the function on the page, in LaTeX format. Typeset with MathJax, if available
     */
    render: function(container) {
      var str = "\\[" + this.LaTeX + "\\]";
      container.innerHTML = str;
      if(MathJax) { MathJax.Hub.Queue(["Typeset", MathJax.Hub]); }
    },
    /**
     * plot this function on the page
     */
    plot: function(container, options, viewbox) {
      viewbox = viewbox || {minx:0, maxx:container.clientWidth, miny:0, maxy:container.clientHeight};
      var context;
      if(!this.plotCanvas) {
        var canvas = document.createElement("canvas");
        canvas.width = options.width || 400;
        canvas.height = options.height || 400;
        canvas.style.border = "1px solid black";
        container.innerHTML="";
        container.appendChild(canvas);
        this.plotCanvas = canvas;
        context = this.plotCanvas.getContext("2d");
        this.clear(context);
      } else { context = this.plotCanvas.getContext("2d"); }
      var o = options,
          plotData = this.functionTree.plot(o.variable, o.start, o.end, o.step, o.clamps),
          v = viewbox,
          minmax = {minx:v.minx, maxx:v.maxx, miny:v.miny, maxy:v.maxy, asymptotes:[]};
      this.drawAxes(context, viewbox.axes, minmax);
      this.drawPlotData(context, plotData, minmax);
    },
    /**
     * draw the plot axes
     */
    drawAxes: function(context, axes, minmax) {
      axes = axes || {x:0, y:0};

      var axis = map(axes.x, minmax.minx ,minmax.maxx, 0, 400);
      context.strokeStyle = "#999";
      context.moveTo(axis, 0);
      context.lineTo(axis, 400);
      context.stroke();
      context.beginPath();

      var axis = map(axes.y, minmax.miny ,minmax.maxy, 0, 400);
      context.moveTo(0,axis);
      context.lineTo(400,axis);
      context.stroke();
      context.beginPath();
    },
    /**
     * draw the function onto the canvas
     */
    drawPlotData: function(context, plotData, minmax) {
      var context = this.plotCanvas.getContext("2d"),
          asymptotes = minmax.asymptotes;
      context.strokeStyle = "black";
      var i, last=plotData.length, ox, x, y;
      for(i=0; i<last; i++) {
        ox = plotData[i][0];
        x = map(ox, minmax.minx ,minmax.maxx, 0, 400);
        y = map(plotData[i][1], minmax.miny, minmax.maxy, 400, 0);
        asym = hasAsymptote(x,y);
        if(asym) {
          asymptotes.push(ox);
          context.stroke();
          context.beginPath();
          first = true;
        } else { context.lineTo(x,y); }
      };
      context.stroke();
      this.drawAsymptotes(context, minmax);
    },
    /**
     * draw asymptotes, if the function has any
     */
    drawAsymptotes: function(context, minmax) {
      if(!this.functionTree.x) {
        context.strokeStyle = "rgba(255,0,0,0.5)";
        minmax.asymptotes.forEach(function(x){
          x = map(x,minmax.minx,minmax.maxx,0,400);
          context.beginPath();
          context.moveTo(x,0);
          context.lineTo(x,400);
          context.stroke();
        });
      }
    },
    /**
     * clear the canvas. We should only do this automatically on a freshly built canvas.
     */
    clear: function(context) {
      context = context || this.plotCanvas.getContext("2d");
      context.fillStyle="white";
      context.clearRect(0,0,400,400);
      context.translate(0.5,0.5);
    },
    /**
     * Substitute a variable with a function
     */
    replace: function(varname, mf) {
      if(typeof mf === "string") { mf = new MathFunction(mf); }
      this.functionTree.replace(varname, mf.functionTree);
      var fstr = this.functionTree.toString();
      mf = new MathFunction(this.functionTree.toString());
      this.functionString = mf.functionString;
      this.LaTeX = mf.LaTeX;
      this.arithmeticFragment = mf.arithmeticFragment;
      this.functionTree = mf.functionTree;
    },
    toString: function() { return this.functionString; },
    toLaTeX: function() { return this.LaTeX; }
  };

  /**
   * Parametric function
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
     * show the function on the page, in LaTeX format. Typeset with MathJax, if available
     */
    render: function(container) {
      var str = "\\[\\left \\{ \\begin{array}{l}\n", ltx = [], i=1;
      this.functions.forEach(function(mf) {
        ltx.push("f_" + (i++) + " = " + mf.LaTeX);
      });
      str += ltx.join("\\\\\n") + "\n\\end{array} \\right . \\]";
      container.innerHTML = str;
      if(MathJax) { MathJax.Hub.Queue(["Typeset", MathJax.Hub]); }
    },
    /**
     * Plot a compound function. The options object is similar to
     * the one used for MathFunction, but has an extra property
     * "order", which is an array [<num>,<num>[,<num>]*] that
     * indicates which function to use for x, y, (z, etc).
     */
    plot: function(container, options, viewbox) {
      viewbox = viewbox || {minx:0, maxx:container.clientWidth, miny:0, maxy:container.clientHeight};
      var context;
      if(!this.plotCanvas) {
        var canvas = document.createElement("canvas");
        canvas.width = options.width || 400;
        canvas.height = options.height || 400;
        canvas.style.border = "1px solid black";
        container.innerHTML="";
        container.appendChild(canvas);
        this.plotCanvas = canvas;
        context = this.plotCanvas.getContext("2d");
        MathFunction.prototype.clear(context);
        this.functions.forEach(function(mf) {
          mf.plotCanvas = canvas;
        });
      } else { context = this.plotCanvas.getContext("2d"); }
      var o = options,
          plotData = [],
          minmax = [],
          v = viewbox;
      this.functions.forEach(function(mf) {
        plotData.push(mf.functionTree.plot(o.variable, o.start, o.end, o.step, o.clamps));
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
      var xid = order[0], yid = order[1];

      var axis = map(axes.x, minmax[xid].minx ,minmax[xid].maxx, 0, 400);
      context.strokeStyle = "#999";
      context.moveTo(axis, 0);
      context.lineTo(axis, 400);
      context.stroke();
      context.beginPath();

      var axis = map(axes.y, minmax[yid].miny ,minmax[yid].maxy, 0, 400);
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
      var context = this.plotCanvas.getContext("2d"),
          asymptotes = minmax.asymptotes;
      context.strokeStyle = "black";
      var i, last=plotData[0].length, ox, oy, x, y, xid=order[0], yid=order[1];
      for(i=0; i<last; i++) {
        ox = plotData[xid][i][1];
        oy = plotData[yid][i][1];
        x = map(ox, minmax[xid].minx, minmax[xid].maxx, 0, 400);
        y = map(oy, minmax[yid].miny, minmax[yid].maxy, 400, 0);
        context.lineTo(x,y);
      };
      context.stroke();
    },
    toString: function() {
      var str = [];
      this.functions.forEach(function(mf) {
        str.push(mf.toString());
      });
      return str.join(", ");
    },
    toLaTeX: function() {
      var str = [];
      this.functions.forEach(function(mf) {
        str.push(mf.toLaTeX());
      });
      return str;
    }
  };
  window.MathFunction = MathFunction;
}());
