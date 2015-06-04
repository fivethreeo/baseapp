var path           = require('path');
    through2       = require('through2'),
    gutil          = require('gulp-util'),
    assign         = require('object-assign'),
    File           = require('vinyl'),
    phantom        = require('phantom'); 

var PluginError    = gutil.PluginError;

var get_bounding_boxes = function(path, cb) {

  phantom.create(function (ph) {
    ph.createPage(function (page) {
      var uri = 'file:///' + path.replace(/\\/g, '/').replace(/\:\//g, '://');
  
      page.open(uri, function (status) {
        
        page.evaluate(function () {
          
          var svg = document.querySelectorAll('svg')[0];
          
          svg.setAttribute('viewBox', "0 0 1700 1500");
          svg.setAttribute('width', "100%");
          svg.setAttribute('height', "100%");
            
          var font = document.querySelectorAll('font')[0];
            
          var glyphs = document.querySelectorAll('glyph');
          for (var i = 0; i < glyphs.length; i++) {
            var el = document.createElementNS("http://www.w3.org/2000/svg","path");
            el.setAttribute("d", glyphs[i].getAttribute("d"));
            svg.appendChild(el);
            font.removeChild(glyphs[i]);
          }
            
          var paths = document.querySelectorAll('path');
          var boxes = [];
            
          for (var i = paths.length-1; i > 0 ; i--) {
            var bbox = paths[i].getBBox(),
            bboxObj = {x: bbox.x, y: bbox.y,
            width: bbox.width, height: bbox.height};
            boxes.push(bboxObj)
          }
          
          return boxes;
            
          }, function (result) {
            
            ph.exit();
            cb(result)
            
          });
        });
      });
    }, {
    dnodeOpts: {
      weak: false
    }
  });
}



module.exports = function (name_sources, opts) {
  // Mixes in default options.
  opts = assign({}, {
    }, opts);

  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }
   
    if (file.isStream()) {
      return cb(new PluginError('gpng', 'Streaming not supported for source svg'));
    }
    
    var re = /unicode="(.*?)"/mg
      
    var matches = [];
    var match;
    var index = 1; 
    while (match = re.exec(file.contents.toString('utf8'))) {
      matches.push(match[index]);
    }
        
    console.log(JSON.stringify(matches));
    
    get_bounding_boxes(file.path, function(bounding_result) {
        
      console.log(JSON.stringify(bounding_result));
        
      cb();        
      
    });
    
  });
  
};


    /*
		
		var base = path.join(file.path, '..');
    var that = this
		var first = new File({
			base: base,
			path: path.join(base, 'first.txt'),
			contents: new Buffer('First file: ' + mydata.something)
		});

		this.push(first);
    */