var path           = require('path'),
    through2       = require('through2'),
    gutil          = require('gulp-util'),
    assign         = require('object-assign'),
    File = require('vinyl');

var PluginError    = gutil.PluginError;

module.exports = function (opts) {
  // Mixes in default options.
  opts = assign({}, {
    }, opts);
    
  var inject_function = function(file, name, indent, content, that) {
    var nl_re = new RegExp('(\\r\\n|\\n|\\r)', 'gm');
    var ap_re = new RegExp("'", 'g');
    
    var basename = path.basename(file.path, '.ejsc');  
    var dirname = path.dirname(file.path); 
    var templates_variable = dirname.substring(file.base.length, dirname.length).replace(/\\/,'/')
     + '/' + basename + '_' + name;
     
    var templates_init = "define('" + templates_variable + "', function() {";
    
    var contents = templates_init
      + "return '" 
      +  (indent + content)
        .replace(nl_re, "\\" + '\n')
        .replace(ap_re, "\\\'")
      + "';\n});" 
                    
    var newfile = new File({
      base: file.base,
      path: path.join(dirname, basename + '_' + name + '.js'),
      contents: new Buffer(contents)
    });

    // add files to queue
    that.push(newfile);
  }
      
    
  var startTag = ['<!-- template:',  ')([^\\s]*?) (', '-->'], endTag = '<!-- endtemplate -->'
    
  function getInjectorTagsRegExp (starttag, endtag) {
    var re = '(' + makeWhiteSpaceOptional(escapeForRegExp(starttag[0])) + 
      starttag[1] +
      makeWhiteSpaceOptional(escapeForRegExp(starttag[2]))+ ')(\\s*)((\\n|\\r|.)*?)(' + 
      makeWhiteSpaceOptional(escapeForRegExp(endtag)) + ')';
        
    return new RegExp(re, 'gi');
  }
    
  function makeWhiteSpaceOptional (str) {
    return str.replace(/\s+/g, '\\s*');
  }
    
  function escapeForRegExp (str) {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
  
  function inject_templates(file, that) {
    return file.contents.toString('utf8').replace(
      getInjectorTagsRegExp(startTag, endTag),
      function injector (match, starttag1, name, starttag2, indent, content, endtag) {
        return inject_function(file, name, indent, content, that)
      }
    );
  }
     
  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, null);
    }

    if (file.isStream()) {
      return cb(new PluginError('gulp-ejs-inject', 'Streaming not supported'));
    }

    inject_templates(file, this);
  
    return cb(null, null);

  });

};
