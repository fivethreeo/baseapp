
(function($){
  'use strict';
  
  app.getCookie = function(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  };
  
  app.addCsrfHeader = function(xhr) {
    // Set the CSRF Token in the header for security
    var token = app.getCookie('csrftoken');
    if (token) xhr.setRequestHeader('X-CSRF-Token', token);
  };
  
  var oldSync = Backbone.sync;
  Backbone.sync = function(method, model, options) {
      options.beforeSend = function(xhr){
        app.addCsrfHeader(xhr);
      };
      return oldSync(method, model, options);
  };
      
  app.make_attrs = function(dict) {
      return _.map(_.pairs(dict), function(pair) {
        return pair[1] ? pair[0] + '="' + pair[1] + '"' : '';
    }).join(' ');
  };
  
  app.nosyncdecorator = function(model) {
    model.prototype.sync = function() { return null; };
    model.prototype.fetch = function() { return null; };
    model.prototype.save = function() { return null; }
    return model
  };
        
  app.BaseModel = Backbone.Model.extend({
    
    deepclone: function() {
      var that = this;
      var attributes = _.clone(this.attributes);
    
      _.map(_.keys(this.attributes), function(key) {
          if (attributes[key] && attributes[key].deepclone) attributes[key] = that.get(key).deepclone();
      })
      
      return new this.constructor(attributes);
    }
    
  });
    
  app.BaseRecursiveModel = app.BaseModel.extend({

    set_recursive: function(dict) {
      var that = this;
      _.mapObject(dict, function(value, key) {
          if (that.attributes[key] && that.attributes[key].set_recursive) { that.attributes[key].set_recursive(value); }
          else { that.set(key, value); }
      })
      return that;
      
    }
  });
  app.BaseCollection = Backbone.Collection.extend({

		// We keep the Todos in sequential order, despite being saved by unordered
		// GUID in the database. This generates the next order number for new items.
		nextOrder: function () {
			return this.length ? this.last().get('order') + 1 : 1;
		},

		// Todos are sorted by their original insertion order.
		comparator: 'order',
        
    deepclone: function() {
      return new this.constructor(_.map(this.models, function(m) { return m.deepclone ? m.deepclone() : m.clone(); }));  
    }
  });
  
  app.BaseRecursiveCollection = app.BaseCollection.extend({
    
    set_recursive: function(list) {
      var that = this;
      _.map(_.range(list.length), function(index) {
          if (that.models.length > index) {
            if (that.models[index].set_recursive) that.models[index].set_recursive(list[index]);
          }
          else {
            var obj = that.create({});
            if (obj.set_recursive) obj.set_recursive(list[index]);
          }
      })
      return that;
      
    }
  });
})(jQuery);
