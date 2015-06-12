
(function($){
  'use strict';

  app.UserModel = app.BaseModel.extend({

    initialize: function(){
    },

    defaults: {
        id: 0,
        username: '',
        name: '',
        email: ''
    },

    url: function(){
        return app.API + '/user';
    }

  });

})(jQuery);
