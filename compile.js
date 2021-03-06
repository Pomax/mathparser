console.log("Compile started...");

var fs = require("fs"),
    compressor = require("node-minify"),
    scriptPath = "scripts/",
    targetPath = scriptPath + "MathFunction/",
    dependenciesPath = targetPath + "dependencies/",
    wrapperPath = scriptPath + "wrapper/",
    target = targetPath + "MathFunction.js",
    targetCompound = targetPath + "MathFunction.Compound.js",
    dependencies = (function(path){
      return [
        "FunctionTree.js",
        "SimpleNodes.js",
        "OperatorNodes.js",
        "FunctionNodes.js",
        "AggregatorNodes.js",
        "Tape.js",
        "ArithmeticFragment.js",
        "utils.js"
      ].map(function(fileName){return path + fileName;});
    }(dependenciesPath)),
    header = wrapperPath + "MathFunction_header.js",
    footer = wrapperPath + "MathFunction_footer.js",
    aggregateData = "",
    files = [header].concat(dependencies).concat([target, targetCompound, footer]);

console.log("Reading files...");

(function readNext() {
  // all files processed
  if(files.length===0) {
    console.log("Total aggregate size: "+(new Buffer(aggregateData,"utf8")).length+" bytes");

    console.log("Writing: MathFunction.js");
    fs.writeFile("MathFunction.js", aggregateData, "utf8");

    console.log("Minifying to: MathFunction.min.js");

    new compressor.minify({
      type: 'gcc',
      fileIn: 'toolkit/tiny-toolkit.js',
      fileOut: 'toolkit/ttk.js'
    });

    new compressor.minify({
      type: 'gcc',
      fileIn: 'toolkit/tiny-toolkit-input-type-range.js',
      fileOut: 'toolkit/ttk-range.js'
    });

    new compressor.minify({
      type: 'gcc',
      fileIn: 'MathFunction.js',
      fileOut: 'MathFunction.min.js',
      callback: function(err) {
        if(err) {
          return console.log(err);
        }
        console.log("Compilation completed.");
      }
    });
    return;
  }

  // more files to process
  var file = files.splice(0,1)[0];
  fs.readFile(file, "utf8", function (err,data) {
    console.log("> "+file);
    if (err) { return console.log(err); }
    aggregateData += "\n/**\n * "+file+"\n */\n\n";
    aggregateData += data;
    readNext();
  });
}());
