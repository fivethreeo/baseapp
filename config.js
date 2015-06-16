require.config({
  "paths": {
    "backbone": "bower_components/backbone/backbone",
    "bootstrap": "bower_components/bootstrap/dist/js/bootstrap",
    "jquery": "bower_components/jquery/dist/jquery",
    "jquery-timing": "bower_components/jquery-timing/jquery-timing",
    "underscore": "bower_components/underscore/underscore"
  },
  "shim": {
    "underscore": {
      "exports": "_"
    },
    "backbone": {
      "deps": [
        "underscore"
      ],
      "exports": "Backbone"
    },
    "bootstrap": {
      "deps": [
        "jquery"
      ],
      "exports": "Bootstrap"
    }
  }
});

require(["main"]);