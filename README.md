# GPF Library

![GPF Logo](http://arnaudbuchholz.github.io/gpf/gpf_320x200.svg)

<a href="https://travis-ci.org/ArnaudBuchholz/gpf-js#">
    <img src="https://travis-ci.org/ArnaudBuchholz/gpf-js.svg?branch=master" title="Travis-CI" />
</a>
<a href="https://coveralls.io/github/ArnaudBuchholz/gpf-js?branch=master">
    <img src="https://coveralls.io/repos/github/ArnaudBuchholz/gpf-js/badge.svg?branch=master" title="Coverage Status" />
</a>
<a href="http://gruntjs.com/">
    <img src="https://cdn.gruntjs.com/builtwith.png" title="Built with Grunt" />
</a>
<a href="http://vanilla-js.com">
    <img src="http://vanilla-js.com/assets/button.png" title="Vanilla JS" />
</a>

A multi-purpose JavaScript library created and maintained by
[Arnaud Buchholz](http://gpf-js.blogspot.com/).

[![NPM](https://nodei.co/npm/gpf-js.png?downloads=true&&downloadRank=true&stars=true)](https://nodei.co/npm/gpf-js/)
[![NPM](https://nodei.co/npm-dl/gpf-js.png?months=3&height=3)](https://nodei.co/npm/gpf-js/)

## Features

* Provides a common scripting layer for several hosts
([cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx),
[NodeJS](http://nodejs.org/), [Rhino](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino),
[PhantomJS](http://phantomjs.org/), most *recent* browsers)
* Namespace and class system
* Interface based
* Asynchronous streams
* Modularization helper
* Self-Tested

This library is developed in conjunction with a
[blog](http://gpf-js.blogspot.com/) where the concepts and algorithms are
documented and explained.

## Metrics

This part is automatically updated upon a successful build:
* Code coverage is computed by executing [all hosts](https://arnaudbuchholz.github.io/gpf/doc/tutorial-LOADING.html),
ignored parts are [documented](https://arnaudbuchholz.github.io/gpf/doc/tutorial-COVERAGE.html)
* The [maintainability](https://arnaudbuchholz.github.io/gpf/plato/index.html) is based on
[plato evaluation](http://blogs.msdn.com/b/codeanalysis/archive/2007/11/20/maintainability-index-range-and-meaning.aspx)

**SME** stands for **s**ource **m**inimal **e**xpectation.

Metric name | average | total | SME | comment
------ | ----- | ----- | ----- | -----
Statements coverage|100%||90%|*0.59% ignored*
Branches coverage|100%||90%|*1.45% ignored*
Functions coverage|100%||90%|*1.06% ignored*
Maintainability|81.98||70|
Number of tests||725||*pending: 0, duration: 535ms*
Number of sources||93||
Lines of code|101|9430||

## Setup

* Clone repository
* install [grunt](https://gruntjs.com/getting-started): `npm install -g grunt-cli`
* at the root of the cloned repository: `npm install`, then `grunt`

## Testing

See [Library testing](https://github.com/ArnaudBuchholz/gpf-js/blob/master/doc/tutorials/TESTME.md)

## Documentation

The [documentation](https://arnaudbuchholz.github.io/gpf/doc/index.html) is extracted from the sources using
[jsdoc syntax](http://usejsdoc.org/) with [grunt-jsdoc](https://github.com/krampstudio/grunt-jsdoc)
and the template from [ink-docstrap](https://www.npmjs.com/package/ink-docstrap)

## Versions

Date | Version | Label | Release | Debug
------ | ------ | ----- | ----- | -----
2017-12-20 | [0.2.3](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.3) | Streams and Pipes | [lib](https://arnaudbuchholz.github.io/gpf/0.2.3/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.3) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.3/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.3)
2017-11-01 | [0.2.2](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.2) | gpf.require | [lib](https://arnaudbuchholz.github.io/gpf/0.2.2/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.2) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.2/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.2)
2017-06-06 | [0.2.1](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.1) | Side project support | [lib](https://arnaudbuchholz.github.io/gpf/0.2.1/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.1) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.1/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.1)
2017-04-29 | [0.1.9](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.9) | Records files | [lib](https://arnaudbuchholz.github.io/gpf/0.1.9/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.9) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.9/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.9)
2017-03-26 | [0.1.8](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.8) | Interfaces | [lib](https://arnaudbuchholz.github.io/gpf/0.1.8/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.8) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.8/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.8)
2017-03-02 | [0.1.7](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.7) | Securing gpf.define | [lib](https://arnaudbuchholz.github.io/gpf/0.1.7/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.7) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.7/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.7)
2017-02-05 | [0.1.6](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.6) | gpf.define | [lib](https://arnaudbuchholz.github.io/gpf/0.1.6/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.6) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.6/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.6)
2016-12-05 | [0.1.5](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.5) | The new core | [lib](https://arnaudbuchholz.github.io/gpf/0.1.5/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.5) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.5/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.5)

## Credits

* Code rewriting based on [esprima](http://esprima.org/) and [escodegen](https://github.com/Constellation/escodegen)
* Markdown specification inspired from [wikipedia](http://en.wikipedia.org/wiki/Markdown)
* UTF-8 encode/decode based on [webtoolkit](http://www.webtoolkit.info/)
* Promise/A+ implementation based on [promise-polyfill](https://github.com/taylorhakes/promise-polyfill)
* [mocha](http://mochajs.org/) test suite
* [istanbul](https://github.com/gotwarlost/istanbul) code coverage tool
* JavaScript task runner: [Grunt](http://gruntjs.com/)
* Icons from [Hawcons](https://www.iconfinder.com/iconsets/hawcons)
