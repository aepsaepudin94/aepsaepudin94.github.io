module.exports = function (grunt) {
  require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks

  grunt.initConfig({
    "babel": {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          "js/replayReact.js":"src/replayReact.jsx" 
        }
      }
    }
  });

  grunt.registerTask("default", ["babel"]);
};