
(function($){
  'use strict';
  
  app.make_attrs = function(dict) {
      return _.map(_.pairs(dict), function(pair) {
        return pair[1] ? pair[0] + '="' + pair[1] + '"' : '';
    }).join(' ');
  }
    
  app.BaseModel = Backbone.Model.extend({

    set_recursive: function(dict) {
      var that = this;
      _.mapObject(dict, function(value, key) {
          if (that.attributes[key] && that.attributes[key].set_recursive) { that.attributes[key].set_recursive(value); }
          else { that.set(key, value); }
      })
      return that;
      
    },
    
    deepclone: function() {
      var that = this;
      var attributes = _.clone(this.attributes);
    
      _.map(_.keys(this.attributes), function(key) {
          if (attributes[key] && attributes[key].deepclone) attributes[key] = that.get(key).deepclone();
      })
      
      return new this.constructor(attributes);
    }
    
  });
    
  app.BaseModel.prototype.sync = function() { return null; };
  app.BaseModel.prototype.fetch = function() { return null; };
  app.BaseModel.prototype.save = function() { return null; }  

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

  
  app.appcollection = new app.AppCollection();
  
  app.AppView = Backbone.View.extend({
    
    el : '.backbone',
    
    template : _.template(templates.app_main_template),
    
    events : {
    },
    
    initialize : function(){
      this.render();
      this.childel = $('#child');
      this.listenTo(app.appcollection, 'add', this.addOne);
    },
    
    addOne: function (model) {
      var view = new app.ChildView({ model: model });
      this.childel.append(view.render().el);
    },

    render : function(){
      this.$el.html(this.template({}));
      return this;
    },
    
    activateTab : function(event){
      this.childel.removeClass('form-horizontal form-vertical form-inline');
      this.childel.addClass($(event.currentTarget).tab('show').data('class'));
    }
    
  });
  
  var AppInstance = new app.FormAppView();
  
  var instance = new app.AppModel();
  
  var instance2 = instance.deepclone().set_recursive({});
  
  app.appcollection.add(instance);  
  app.appcollection.add(instance2); 
  
})(jQuery);
