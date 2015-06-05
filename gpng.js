var path = require('path');
  through2 = require('through2'),
  gutil = require('gulp-util'),
  assign = require('object-assign'),
  File = require('vinyl'),
  vinylFile = require('vinyl-file'),
  phantom = require('phantom'),
  phantomjs = require('phantomjs'),
  async = require('async'),
  css = require('css'),
  
  PluginError = gutil.PluginError;

var svg = function (vars) { return '<?xml version="1.0" standalone="no"?>\
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" >\n\
<svg xmlns="http://www.w3.org/2000/svg" height="' + vars.height + '" width="' + vars.width + '">\n\
<metadata></metadata>\n\
<defs></defs>\n\
<g transform="' + vars.transform + '">\n\
' + vars.path + '\n\
</g>\n\
</svg>\
'
}

module.exports = function(name_source, opts) {
  // Mixes in default options.
  opts = assign({}, opts);

  return through2.obj(function(file, enc, through_callback) {
    var that = this;

    if (file.isNull()) {
      return through_callback(null, file);
    }

    if (file.isStream()) {
      return through_callback(new PluginError('gpng', 'Streaming not supported for source svg'));
    }
    

    phantom.create(function(phantom_instance) {
      phantom_instance.createPage(function(page) {

        var uri = 'file:///' + file.path.replace(/\\/g, '/').replace(/\:\//g, '://');
        page.open(uri, function(status) {

          page.evaluate(function() {

              var svg = document.querySelectorAll('svg')[0];

              svg.setAttribute('viewBox', "0 0 1700 1500");
              svg.setAttribute('width', "100%");
              svg.setAttribute('height', "100%");

              var font = document.querySelectorAll('font')[0];

              var glyphs = document.querySelectorAll('glyph');
              for (var i = 0; i < glyphs.length; i++) {
                var el = document.createElementNS("http://www.w3.org/2000/svg", "path");
                el.setAttribute("d", glyphs[i].getAttribute("d"));
                svg.appendChild(el);
                font.removeChild(glyphs[i]);
              }

              var paths = document.querySelectorAll('path');
              var boxes = [];

              for (var i = 0; i < paths.length; i++) {
                var bbox = paths[i].getBBox(),
                  bboxObj = {
                    x: bbox.x,
                    y: bbox.y,
                    width: bbox.width,
                    height: bbox.height
                  };
                boxes.push(bboxObj)
              }

              return boxes;

            },

            function(bounding_boxes) {

              phantom_instance.exit();
              
              var base = path.join(file.path, '..');
              var cssFile = vinylFile.readSync(path.join(file.path, '../../css/bootstrap.css'));
              var parsedCss = css.parse(cssFile.contents.toString('utf8'));
              var rules = parsedCss.stylesheet.rules;
              
              var unicodemap = {};
              
              for (var i = 0; i < rules.length; i++) {  
                var rule = rules[i];
                if (/^\.glyphicon/.test(rule.selectors)) {
                  for (var j = 0; j < rule.declarations.length; j++) {
                    if (rule.declarations[j].property=="content") {
                      var name = rule.selectors.toString().split(/[\.\:]/g)[1];
                      var unicode = rule.declarations[j].value.toString().replace(/[\\\"]/g, '')
                      unicodemap[unicode] = name;
                    }
                  }
                }
              }

              var re = /<glyph unicode="(.*?)".[^>]*>/mg
              var re2 = /<glyph unicode=".*?"/
    
              var match;
              var match_group = 1;
              var index = 2;
              while (match = re.exec(file.contents.toString('utf8'))) {
                
                var unicodeid = match[match_group].replace(/&\#x|;|\*|\+/g, '')
                var name= unicodemap[unicodeid] + '.svg';
                var bbox = bounding_boxes[index];
                var ctxt = assign(bbox, {
                  path: match[0].replace(re2, '<path'),
                  transform: 'translate(' + (-parseInt(bbox.x)) + ',' + (-parseInt(bbox.y)) + ')'
                });
                
                var newfile = new File({
                  base: base,
                  path: path.join(base, name),
                  contents: new Buffer(svg(ctxt))
                });
            
                that.push(newfile);
              
                index++;
              }
    

              through_callback();
            });

        });
      });
    }, {
      binary: phantomjs.path,
      dnodeOpts: {
        weak: false,
      }
    });

  });
}