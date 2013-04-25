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
    this.functionString = {x: "", y: ""};
    this.LaTeX = {x:"", y:""};
    this.arithmeticFragment = {x:false, y:false};
    this.functionTree = {x:false, y:false};
    this.init(functionText);
  }

  MathFunction.prototype = {
    /**
     * initialise this math function
     */
    init: function(functionString) {
      var spl = functionString.split(','),
          functionStringY = spl[1] ? spl[1] : spl[0],
          functionStringX = spl[1] ? spl[0] : false;
      this.functionString.y = functionStringY.replace(/\s/g,'');
      this.arithmeticFragment.y = new ArithmeticFragment(this.functionString.y);
      var balance = this.arithmeticFragment.y.getBalance(); 
      if(balance===0) {
        this.functionTree.y = this.arithmeticFragment.y.formFunctionTree();
        this.LaTeX.y = this.functionTree.y.toLaTeX();
      } else { throw "Function for Y is unbalanced: "+this.arithmeticFragment.y.toString()+" has "+balance+" open groups"; }
      // parametric function?
      if(functionStringX) {
        this.functionString.x = functionStringX.replace(/\s/g,''); 
        this.arithmeticFragment.x = new ArithmeticFragment(this.functionString.x);
        var balance = this.arithmeticFragment.x.getBalance(); 
        if(balance===0) {
          this.functionTree.x = this.arithmeticFragment.x.formFunctionTree();
          this.LaTeX.x = this.functionTree.x.toLaTeX();
        } else { throw "Function for X is unbalanced: "+this.arithmeticFragment.x.toString()+" has "+balance+" open groups"; }
      }
    },
    /**
     * show the function on the page, in LaTeX format. Typeset with MathJax, if available
     */
    render: function(container) {
      var str = "\\[";
      if(this.LaTeX.x) { str += "\\begin{matrix} f_x(...) = " + this.LaTeX.x + " \\\\ \n"; }
      str += "f_y(...) = " + this.LaTeX.y;
      if(this.LaTeX.x) { str += "\n\\end{matrix}"; }
      str += "\\]";
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
      var plotData = {
            x: (this.functionTree.x ? this.functionTree.x.plot( options.variable, options.start, options.end, options.step, options.clamps) : false),
            y: this.functionTree.y.plot( options.variable, options.start, options.end, options.step, options.clamps)
          },
          minmax = {minx:viewbox.minx, maxx:viewbox.maxx, miny:viewbox.miny, maxy:viewbox.maxy, asymptotes:[]};
      this.drawAxes(context, viewbox.axes, minmax);
      this.drawPlotData(context, plotData, minmax);
    },
    /**
     * draw the plot axes
     */
    drawAxes: function(context, axes, minmax) {
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
      var i, last=plotData.y.length, px, x, y, pf = (plotData.x!==false);
      for(i=0; i<last; i++) {
        px = (pf ? plotData.x[i][1] : plotData.y[i][0]);
        x = map(px, minmax.minx ,minmax.maxx, 0, 400);
        y = map(plotData.y[i][1], minmax.miny, minmax.maxy, 400, 0);
        asym = hasAsymptote(x,y);
        if(asym) {
          asymptotes.push(px);
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
    }
  };

  window.MathFunction = MathFunction;
}());
