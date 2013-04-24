/**
 * Mathematical function object.
 */
(function(){

  /**
   * naive inclusion
   */
  (function(){
    function include(file) {
      var inclusion = document.createElement("script");
      inclusion.src = file;
      document.head.appendChild(inclusion); }

    include('FunctionTree.js')
    include('Tape.js')
    include('ArithmeticFragment.js')
    include('SimpleNodes.js')
    include('OperatorNodes.js')
    include('FunctionNodes.js')
    include('AggregatorNodes.js')
  }());

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

  var MathFunction = function(functionText) { this.init(functionText); }

  MathFunction.prototype = {
    plotCanvas: false,
    functionString:"",
    LaTeX:"",
    arithmeticFragment: false,
    functionTree: false,
    /**
     *
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
     *
     */
    render: function(container) {
      container.innerHTML = "\\[" + this.LaTeX + "\\]";
      if(MathJax) { MathJax.Hub.Queue(["Typeset", MathJax.Hub]); }
    },
    /**
     *
     */
    plot: function(container, options, viewbox) {
      viewbox = viewbox || {minx:0, maxx:container.clientWidth, miny:0, maxy:container.clientHeight};
      if(!this.plotCanvas) {
        var canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.border = "1px solid black";
        this.plotCanvas = canvas;
        container.innerHTML ="";
        container.appendChild(canvas);
      }
      var plotData = this.functionTree.plot( options.variable, options.start, options.end, options.step, options.clamps);
      context = this.plotCanvas.getContext("2d");
      this.clearCanvas(context);
      var minmax = this.findMinMax(plotData, viewbox);
      this.drawPlotData(context, plotData, minmax);
    },
    /**
     *
     */
    findMinMax: function(plotData, viewbox) {
      var minx=999999, maxx=-999999, miny=minx, maxy=maxx, x, y, asymptotes=[];
      plotData.forEach(function(point) {
        x = point[0];
        if(isNaN(x) || x==Infinity || x==-Infinity) { return; }
        if(x < minx) minx = x>viewbox.minx? x : viewbox.minx;
        if(x > maxx) maxx = x<viewbox.maxx? x : viewbox.maxx;
        y = point[1];
        if(isNaN(y) || y==Infinity || y==-Infinity) { asymptotes.push(x); return; }
        if(y < miny) miny = y>viewbox.miny ? y: viewbox.miny;
        if(y > maxy) maxy = y<viewbox.maxy ? y: viewbox.maxy;
      });
      return {minx: minx, maxx: maxx, miny: miny, maxy:maxy, asymptotes:asymptotes};
    },
    /**
     *
     */
    drawPlotData: function(context, plotData, minmax) {
      var context = this.plotCanvas.getContext("2d"),
          asymptotes = minmax.asymptotes;
      plotData.forEach(function(point) {
        x = map(point[0],minmax.minx,minmax.maxx,0,400);
        y = map(point[1],minmax.miny,minmax.maxy,0,400);
        asym = hasAsymptote(x,y);
        if(asym) {
          asymptotes.push(point[0]);
          context.stroke();
          context.beginPath();
          first = true;
        } else { context.lineTo(x,y); }
      });
      context.stroke();
      this.drawAsymptotes(context, minmax);
    },
    /**
     *
     */
    drawAsymptotes: function(context, minmax) {
      context.strokeStyle = "rgba(255,0,0,0.5)";
      minmax.asymptotes.forEach(function(x){
        x = map(x,minmax.minx,minmax.maxx,0,400);
        context.beginPath();
        context.moveTo(x,0);
        context.lineTo(x,400);
        context.stroke();
      });
    },
    /**
     *
     */
    clearCanvas: function(context) {
      context = context || this.plotCanvas.getContext("2d");
      context.fillStyle="white";
      context.clearRect(0,0,400,400);
      context.translate(0.5,0.5);
    }
  };

  window.MathFunction = MathFunction;

}());
