

Installation
============

Install `nodejs`_ or `io.js`_.

Install `Python`_.

Install virtualenv: ::
  
  pip install virtualenv

Install node modules: ::

  npm install
  npm install -g bower

Install bower assets: ::

  bower install

Create virtualenv: ::

  virtualenv env

Install python modules: ::

  env/bin/pip install -r requirements.txt

Sync django database: ::

  env/bin/python django/manage.py syncdb

Build project in dev: ::

  gulp build --dev

Run project in dev: ::

  gulp serve --dev

Build project in production: ::

  gulp build

Run project in production: ::

  gulp serve

Notes
=====

Signup not implemented.

.. _nodejs: https://nodejs.org/
.. _io.js: https://iojs.org/
.. _Python: https://www.python.org/downloads/release/python-2710/