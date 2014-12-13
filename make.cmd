cd make
node node_make.js debug
node node_make.js release
cd ..
if not exist ..\ArnaudBuchholz.github.io goto end
copy build\gpf.js ..\ArnaudBuchholz.github.io\
copy build\gpf-debug.js ..\ArnaudBuchholz.github.io\
:end