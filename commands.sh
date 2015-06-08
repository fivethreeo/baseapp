#!/bin/bash

echo "Commands:"
echo
echo "1: gulp build --dev"
echo "2: gulp serve --dev"
echo "3: gulp build"
echo "4: gulp serve"
echo "5: npm install"
echo "6: bower install"
echo "7: git checkout-index -a --prefix=../dir/ (export)"
echo

echo "Choose command number:"

read command

case "$command" in
  "1")
    gulp build --dev
    ;;
  "2")
    gulp serve --dev
    ;;
  "3")
    gulp build
    ;;
  "4")
    gulp serve
    ;;
  "5")
    echo "Arguments:"
    read commandarguments
    npm install $commandarguments
    ;;
  "6")
    echo "Arguments:"
    read commandarguments
    bower install $commandarguments
    ;;
  "7")
    echo "Export to directory (end with backslash):"
    read directory
    if [ ! -d "$directory" ]; then
      md $directory
    fi
    git checkout-index -a --prefix=$directory
    ;;
  *)
    echo "Not available"
    ;;
    
esac