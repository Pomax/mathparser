/**
 * define object
 */
var MathFunction = function(functionText) {
  this.plotCanvas = false;
  this.functionString = "";
  this.LaTeX = "";
  this.arithmeticFragment = false;
  this.functionTree = false;
  this.init(functionText);
};

/**
 * define object
 */
window.MathFunction = MathFunction;


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
   * Build the page representation for this function:
   *
   * - a plotted graph
   * - a (LaTeX) formula
   * - variable controls
   *
   */
  build: function(panel, options, viewbox) {
     // ...
  },

  /**
   * get all parameters used in this function
   */
  getParameters: function() {
    return this.functionTree.getParameters();
  },

  /**
   * show the function on the page, in LaTeX format. Typeset with MathJax, if available
   */
  render: function(container) {
    if(MathJax) {
      var str = "\\[" + this.LaTeX + "\\]";
      container.innerHTML = str;
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, container]);
    } else { container.innerHTML = this.functionTree.toString(); }
  },

  /**
   * plot this function on the page
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
      container.innerHTML = "";
      container.appendChild(canvas);
      this.plotCanvas = canvas;
      context = this.plotCanvas.getContext("2d");
      this.clear(context);
    } else { context = this.plotCanvas.getContext("2d"); }
    var o = options,
        c = o.variable,
        plotData = this.functionTree.plot(c.label, c.start, c.end, c.step, o.clamped),
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
    var axis;

    axis = this.mapx(axes.x, minmax.minx ,minmax.maxx);
    context.strokeStyle = "#999";
    context.moveTo(axis, 0);
    context.lineTo(axis, 400);
    context.stroke();
    context.beginPath();

    axis = this.mapy(axes.y, minmax.miny ,minmax.maxy);
    context.moveTo(0,axis);
    context.lineTo(400,axis);
    context.stroke();
    context.beginPath();
  },

  /**
   * draw the function onto the canvas
   */
  drawPlotData: function(context, plotData, minmax) {
    var asymptotes = minmax.asymptotes;
    context.strokeStyle = "black";
    var i, last=plotData.length, ox, x, y;
    for(i=0; i<last; i++) {
      ox = plotData[i][0];
      x = this.mapx(ox, minmax.minx ,minmax.maxx);
      y = this.mapy(plotData[i][1], minmax.miny, minmax.maxy);
      asym = hasAsymptote(x,y);
      if(asym) {
        asymptotes.push(ox);
        context.stroke();
        context.beginPath();
        first = true;
      } else { context.lineTo(x,y); }
    }
    context.stroke();
    this.drawAsymptotes(context, minmax);
  },

  /**
   * draw asymptotes, if the function has any
   */
  drawAsymptotes: function(context, minmax) {
    var mp = this;
    if(!this.functionTree.x) {
      context.strokeStyle = "rgba(255,0,0,0.5)";
      minmax.asymptotes.forEach(function(x){
        x = mp.mapx(x,minmax.minx,minmax.maxx);
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
    if(!this.plotCanvas) return;
    this.plotCanvas.width = this.options.width;
    this.plotCanvas.height = this.options.height;
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

  /**
   *
   */
  toString: function() {
    return this.functionString;
  },

  /**
   *
   */
  toLaTeX: function() {
    return this.LaTeX;
  }
};
