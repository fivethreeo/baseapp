var path           = require('path');
var through2       = require('through2');
var gutil          = require('gulp-util');
var assign         = require('object-assign');

var PluginError    = gutil.PluginError;

module.exports = function (opts) {
  // Mixes in default options.
  opts = assign({
      shim: {}
  }, opts);
  
  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

  
    file.contents = new Buffer(inject_templates(file));
    file.path = gutil.replaceExtension(file.path, '.js');
  
    return cb(null, file);

  });

};
