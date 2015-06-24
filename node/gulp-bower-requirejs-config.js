var path           = require('path'),
    through2       = require('through2'),
    gutil          = require('gulp-util'),
    assign         = require('object-assign'),
    _              = require('lodash'),
    bower          = require('bower'),
    bowerRequireJS = require('bower-requirejs'),

    PluginError    = gutil.PluginError;


module.exports = function (opts) {
  // Mixes in default options.
  opts = assign({
    exports:{},
    ignore:[],
    ignoreShim:[],
    pathReplacements: [],
  }, opts);
 
  return function(cb) {
    function addShim(dependencies, shim) {
      _.forOwn(dependencies, function (pkg, name) {
        if (!_.includes(opts.ignore, name)) {
          var shim_temp = {};
          var exports = _.get(opts.exports, name);
   
          if (_.has(pkg, 'pkgMeta.dependencies')) {
            shim_temp.deps = _.keys(pkg.pkgMeta.dependencies);
            addShim(pkg.pkgMeta.dependencies, shim)
          }
          
          if (exports) {
            shim_temp.exports = exports;
          }
          
          if (!_.isEmpty(shim_temp) && !_.includes(opts.ignoreShim, name)) shim[name] = shim_temp;
        }
      })
    }
  
  
    bowerRequireJS({}, function (requireJsConfig) {
      
      delete requireJsConfig.packages;
      requireJsConfig = assign({baseUrl:opts.baseUrl}, requireJsConfig);
      _.forEach(opts.ignore, function(ignore_module) {
        delete requireJsConfig.paths[ignore_module]
      })
      _.forOwn(requireJsConfig.paths, function(path, name) {
        _.forEach(opts.pathReplacements, function(replacement) {
          requireJsConfig.paths[name] = requireJsConfig.paths[name].replace(replacement[0], replacement[1])
        });
      })
      
      var dependencyGraph = bower.commands.list({}).on('end', function (dependencyGraph) {
        var shim = {} 

        addShim(dependencyGraph.dependencies, shim)
        
        requireJsConfig.shim = shim;
        cb(requireJsConfig);
  
      })
    });
  }
};
