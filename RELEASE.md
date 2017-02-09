# How to release

* Check the version number in package.json ("version": )
* Add a version line in README.md *(to automate)*
* `grunt make`
* copy tmp/plato/report.history.* to build/ *(to automate)*
* commit and push the content of build/ *(to automate)*
* commit and push the content of the github.io folder
* go to https://github.com/ArnaudBuchholz/gpf-js/releases ad draft a new release
    * name it v<version number>
