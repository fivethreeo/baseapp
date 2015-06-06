@echo off
setlocal EnableDelayedExpansion

echo Commands:
echo.
echo 1: gulp build --dev
echo 2: gulp serve --dev
echo 3: gulp build
echo 4: gulp serve
echo 5: npm install
echo 6: bower install
echo 7: git checkout-index -a --prefix=..\dir\ (export)
echo.

set /p command="Choose command number:"

if /I "%command%" EQU "1" (
  gulp build --dev
)
if /I "%command%" EQU "2" (
  gulp serve --dev
)
if /I "%command%" EQU "3" (
  gulp build
)
if /I "%command%" EQU "4" (
  gulp serve
)
if /I "%command%" EQU "5" (
  set /p args="Arguments:"
  npm install !args!
)
if /I "%command%" EQU "6" (
  set /p args="Arguments:"
  bower install !args!
)
if /I "%command%" EQU "7" (
set /p directory="Export to directory (end with slash):"
if not exist "!directory!\." (
  mkdir !directory!
)
git checkout-index -a --prefix=!directory!
)