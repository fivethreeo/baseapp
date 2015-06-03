
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
      
  app.GridModel = app.BaseModel.extend({
    
    defaults: {
      col_xs: null,
      col_sm: null,
      col_md: null,
      col_lg: null,
      col_xs_offset: null,
      col_sm_offset: null,
      col_md_offset: null,
      col_lg_offset: null,
      col_xs_pull: null,
      col_sm_pull: null,
      col_md_pull: null,
      col_lg_pull: null,
      col_xs_push: null,
      col_sm_push: null,
      col_md_push: null,
      col_lg_push: null,
      visible_xs: null,
      hidden_xs: null,
      visible_sm: null,
      hidden_sm: null,
      visible_md: null,
      hidden_md: null,
      visible_lg: null,
      hidden_lg: null
    },
    
    get_grid_classes: function(extra) {
      var extra = extra || [];
      var that = this;
      var classes = [];
      _.mapObject(that.attributes, function(value, key) {
          if (value && /^col_/.test(key)) {
             classes.push(key.replace(/_/g, '-') + '-' + value);
          }
          else if (value) {
            classes.push(key.replace(/_/g, '-'));
          }
      })
      return _.union(extra, classes).join(' ');
      
    }

  });
  
  app.BaseElementModel = app.BaseModel.extend({
    
    defaults: {
      tag: 'div',
      grid: new app.GridModel(),
      classes: null
    },

    get_classes: function(extra) {
      var extra = extra || [];
      extra = _.compact(_.union(extra, [this.get('classes')]))
      return this.get('grid').get_grid_classes(extra);
    },
    
    get_attrs: function(formgroup) {
      return '';
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
  
  app.LabelModel= app.BaseElementModel.extend({
    
    defaults: _.extend({}, app.BaseElementModel.prototype.defaults, {
      tag: 'label',
      text: 'Label'
    }),
    
    get_attrs: function(formgroup) {
      return app.make_attrs({
        for: 'id_' +  formgroup.get('name'),
        class: this.get_classes(['control-label'])
      });
    }
 
  });    
  
  app.InputWrapModel = app.BaseElementModel.extend({
    
    defaults: _.extend({}, app.BaseElementModel.prototype.defaults, {
      enabled: false
    }),
    
    get_attrs: function(formgroup) {
      return app.make_attrs({
        class: this.get_classes()
      });
    }
    
  });   
  
  app.InputGroupModel = app.BaseElementModel.extend({
    
    defaults: _.extend({}, app.BaseElementModel.prototype.defaults, {
      add_on_before: null,
      add_on_after: null,
      enabled: false
    }),
    
    get_attrs: function(formgroup) {
      return app.make_attrs({
        class: this.get_classes(['input-group'])
      });
    }
    
  });  

  app.InputModelCollection = app.BaseCollection.extend({
    model: app.InputModel
  });
  
  app.InputModel = app.BaseElementModel.extend({
    
    defaults: _.extend({}, app.BaseElementModel.prototype.defaults, {
      order: null,
      tag: 'input',
      placeholder: null,
      checked: false,
      choices: null,
      size: null,
      group: new app.InputGroupModel(),
      label: new app.LabelModel(),
      wrap: new app.InputWrapModel(),
      inputs: new app.InputModelCollection()
    }),

    initialize: function(){
    },
    
    get_attrs: function(formgroup) {
      return app.make_attrs({
        id: 'id_' + formgroup.get('name'),
        class: this.get_classes(['form-control'])
      });
    }
   
  });  

  app.FormGroupModel = app.BaseElementModel.extend({
    
    defaults: _.extend({}, app.BaseElementModel.prototype.defaults, {
      order: null,
      name: 'name',
      type: 'input',
      input: new app.InputModel()
    }),
    
    get_attrs: function(formgroup) {
      return app.make_attrs({
        id: 'div_' + this.get('name'),
        class: this.get_classes(['form-group'])
      });
    },

    initialize: function(){
    }
    
  });
  
  app.FormGroupCollection = app.BaseCollection.extend({
    model: app.FormGroupModel
  });
  
  app.formgroups = new app.FormGroupCollection();
  
  app.FormType = app.BaseElementModel.extend({
    defaults: {
    },
    
    initialize: function(){

    }
  });

  app.InputEditView = Backbone.View.extend({
    
    template : _.template(templates.formbuilder_input_edit_template||''),
    
    events : {
    },

    initialize : function(){
    },
    
    render : function(){
      this.el = this.template();
      return this;
    }
    
  });
  
  app.FormGroupView = Backbone.View.extend({
    
    template : _.template(templates.formbuilder_formgroup_template||''),
    
    events : {
    },
    
    initialize : function(){
    },
    
    render : function(){

      this.el = this.template({model: this.model});
      return this;
    }
    
  });      

  app.FormGroupEditView = Backbone.View.extend({
    
    el : '#edit-area',
    
    template : _.template(templates.formbuilder_formgroup_edit_template||''),
    
    events : {
    },
    
    initialize : function(){
      this.render();
    },
    
    render : function(){
      this.$el.html(this.template());
      return this;
    }
    
  });
  
  app.FormView = Backbone.View.extend({
    
    el : '.backbone',
    
    template : _.template(templates.formbuilder_form_template||''),
    
    events : {
    },
    
    render : function(){
      this.$el.html(this.template());
      return this;
    }
    
  });      

  app.FormEditView = Backbone.View.extend({
    
    template : _.template(templates.formbuilder_form_edit_template||''),
    
    events : {
    },
    
    render : function(){
      this.el = this.template();
      return this;
    }
  });
  
  app.FormBuilderView = Backbone.View.extend({
    
    el : '.backbone',
    
    template : _.template(templates.formbuilder_main_template),
    
    events : {
      'click .nav li a': 'activateTab'
    },
    
    initialize : function(){
      this.render();
      this.$form = $('form#form');
      this.listenTo(app.formgroups, 'add', this.addOne);
    },
    
		addOne: function (model) {
			var view = new app.FormGroupView({ model: model });
			this.$form.append(view.render().el);
		},

    render : function(){
      this.$el.html(this.template({}));
      new app.FormGroupEditView();
      return this;
    },
    
    activateTab : function(event){
      this.$form.removeClass('form-horizontal form-vertical form-inline');
      this.$form.addClass($(event.currentTarget).tab('show').data('class'));
    }
    
  });
  
  var FormBuilder = new app.FormBuilderView();
  
  var group = new app.FormGroupModel();
  
  var group2 = group.deepclone().set_recursive({
    input: { 
      wrap: { enabled: true, grid: { col_md: 3 } },
      label: { grid: { col_md: 3 } }
    }
  });
  var group3 = group2.deepclone().set_recursive({
    input:{
      wrap:{
        enabled:true
      }
    }
  });
  app.formgroups.add(group);  
  app.formgroups.add(group2); 
  
})(jQuery);