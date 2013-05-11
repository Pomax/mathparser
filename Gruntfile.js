module.exports = function( grunt ) {

  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),
    jshint: {
      files: [
        "Gruntfile.js",
        "compile.js",
        "scripts/MathFunction/**/*.js"
      ]
    }
  });
  grunt.loadNpmTasks( "grunt-contrib-jshint" );
  grunt.registerTask( "default", [ "jshint" ]);
};
