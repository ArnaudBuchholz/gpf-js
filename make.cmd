@echo off

cd test\host

echo Testing source with cscript...
cscript.exe /E:JScript cscript.js >nul
if %ERRORLEVEL% neq 0 goto test_failed

echo Testing source with node...
node.exe nodejs.js >nul
if %ERRORLEVEL% neq 0 goto test_failed

REM echo Testing source in a browser
REM start mocha\web.html
REM echo Press enter to continue or break
REM pause

cd ..\..
goto build

:test_failed
echo Test failed
cd ..\..
goto end

:build

echo Building...
cd make
node node_make.js debug
node node_make.js release
cd ..

cd test\host

echo Validating debug with cscript...
cscript.exe /E:JScript cscript.js debug >nul
if %ERRORLEVEL% neq 0 goto test_failed

echo Validating release with cscript...
cscript.exe /E:JScript cscript.js release >nul
if %ERRORLEVEL% neq 0 goto test_failed

echo Validating debug with node...
node.exe nodejs.js -debug >nul
if %ERRORLEVEL% neq 0 goto test_failed

echo Validating release with cscript...
node.exe nodejs.js -release >nul
if %ERRORLEVEL% neq 0 goto test_failed

cd ..\..

if not exist ..\ArnaudBuchholz.github.io goto end

echo Publishing...
copy build\gpf.js ..\ArnaudBuchholz.github.io\
copy build\gpf-debug.js ..\ArnaudBuchholz.github.io\
plato -x coding_convention.js -d ..\ArnaudBuchholz.github.io\plato\gpf-js -t GPF-JS -l .jshintrc src/*.js
:end