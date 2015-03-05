# GPF Library

A multi-purpose JavaScript library created and maintained by
[Arnaud Buchholz](http://gpf-js.blogspot.com/).

[Plato analysis](http://arnaudbuchholz.github.io/plato/gpf-js/index.html)

## Huge refactoring in progress

![Work in progress](http://arnaudbuchholz.github.io/blog/wip.png)

## Features

* Compatible with several hosts
([cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx),
[NodeJS](http://nodejs.org/), [PhantomJS](http://phantomjs.org/),
most browsers)
* Namespace and class system
* Java-like annotation tool (attributes)
* Interface based
* Asynchronous binary / textual streams
* XML-aware
* Self-Tested

This library is developed in conjunction with a
[blog](http://gpf-js.blogspot.com/) where the concepts and algorithms are
documented and explained.

## Testing

* With mocha:
    * file:///GitHub/gpf-js/test/host/mocha/web.html
    * node /GitHub/gpf-js/test/host/mocha/nodejs.js
* Without mocha:
    * file:///GitHub/gpf-js/test/host/web.html
    * node /GitHub/gpf-js/test/host/nodejs.js
    * phantomjs /GitHub/gpf-js/test/host/phantomjs.js
    * cscript /E:jscript cscript.js

## Credits
* Code rewriting based on [esprima](http://esprima.org/) and
[escodegen](https://github.com/Constellation/escodegen)
* Markdown specification inspired from
[wikipedia](http://en.wikipedia.org/wiki/Markdown)
* UTF-8 encode/decode based on [webtoolkit](http://www.webtoolkit.info/)
* Test suite based on [mocha](http://mochajs.org/)

