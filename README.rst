::
,
  npm install
  npm install -g bower
  bower install
  virtualenv env
  env/bin/pip install -r requirements.txt
  env/bin/python django/manage.py syncdb
  gulp build --dev
  gulp serve --dev

  gulp build
  gulp serve
