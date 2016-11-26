# GPF Library
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

A multi-purpose JavaScript library created and maintained by
[Arnaud Buchholz](http://gpf-js.blogspot.com/).

[![NPM](https://nodei.co/npm/gpf-js.png?downloads=true&&downloadRank=true&stars=true)](https://nodei.co/npm/gpf-js/)
[![NPM](https://nodei.co/npm-dl/gpf-js.png?months=3&height=3)](https://nodei.co/npm/gpf-js/)

## Features

* Compatible with several hosts
([cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx),
[NodeJS](http://nodejs.org/), [Rhino](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino),
[PhantomJS](http://phantomjs.org/), most *recent* browsers)
* Namespace and class system *-- not implemented yet*
* Java-like annotation tool (attributes) *-- not implemented yet*
* Interface based *-- not implemented yet*
* Asynchronous binary / textual streams *-- not implemented yet*
* XML-aware *-- not implemented yet*
* Self-Tested

This library is developed in conjunction with a
[blog](http://gpf-js.blogspot.com/) where the concepts and algorithms are
documented and explained.

## Metrics

This part is automatically updated upon a successful build:
* Code coverage is based on NodeJS execution, ignored parts are mostly relevant of other hosts
* The [maintainability](https://arnaudbuchholz.github.io/gpf/0.1.5/plato/index.html) is based
on [plato evaluation](http://blogs.msdn.com/b/codeanalysis/archive/2007/11/20/
maintainability-index-range-and-meaning.aspx)

**SME** stands for **s**ource **m**inimal **e**xpectation.

Metric name | average | total | SME | comment
------ | ----- | ----- | ----- | -----
Statements coverage|99.67%||90%|*12.09% ignored*
Branches coverage|98.95%||90%|*21.35% ignored*
Functions coverage|100%||90%|*13.01% ignored*
Maintainability|80.21||65|
Number of tests||284||*pending: 0, duration: 275ms*
Number of sources||29||
Lines of code|82|2386||

## Setup

* Clone repository
* install [grunt](http://gruntjs.com/)
* at the root of the cloned repository: `npm install`, then `grunt`

## Testing

See [TESTME.md](https://github.com/ArnaudBuchholz/gpf-js/blob/master/TESTME.md)

## Versions

Version | Release | Debug | Plato
------ | ----- | ----- | ----- | -----
[0.1.5](https://arnaudbuchholz.github.io/gpf/0.1.5/doc/index.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.5/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.5) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.5/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.5) | [plato](https://arnaudbuchholz.github.io/gpf/0.1.5/plato/index.html)

## Credits

* Code rewriting based on [esprima](http://esprima.org/) and [escodegen](https://github.com/Constellation/escodegen)
* Markdown specification inspired from [wikipedia](http://en.wikipedia.org/wiki/Markdown)
* UTF-8 encode/decode based on [webtoolkit](http://www.webtoolkit.info/)
* Promise/A+ implementation based on [promise-polyfill](https://github.com/taylorhakes/promise-polyfill)
* [mocha](http://mochajs.org/) test suite
* [istanbul](https://github.com/gotwarlost/istanbul) code coverage tool
* JavaScript task runner: [Grunt](http://gruntjs.com/)
* Icons from [Hawcons](https://www.iconfinder.com/iconsets/hawcons)
* Documentation generated from [jsdoc syntax](http://usejsdoc.org/)
with [grunt-jsdoc](https://github.com/krampstudio/grunt-jsdoc)
using template from [ink-docstrap](https://www.npmjs.com/package/ink-docstrap)
