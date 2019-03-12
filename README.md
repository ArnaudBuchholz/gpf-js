# GPF Library

![GPF Logo](http://arnaudbuchholz.github.io/gpf/gpf_320x200.svg)

[![Travis-CI](https://travis-ci.org/ArnaudBuchholz/gpf-js.svg?branch=master)](https://travis-ci.org/ArnaudBuchholz/gpf-js#)
[![Coverage Status](https://coveralls.io/repos/github/ArnaudBuchholz/gpf-js/badge.svg?branch=master)](https://coveralls.io/github/ArnaudBuchholz/gpf-js?branch=master)
[![DeepScan grade](https://deepscan.io/api/projects/1923/branches/8681/badge/grade.svg)](https://deepscan.io/dashboard#view=project&pid=1923&bid=8681)
[![Maintainability](https://api.codeclimate.com/v1/badges/06d49b2308264f3c5495/maintainability)](https://codeclimate.com/github/ArnaudBuchholz/gpf-js/maintainability)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/6c8806b35ecc4e70ba985534fda0681f)](https://www.codacy.com/app/ArnaudBuchholz/gpf-js?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ArnaudBuchholz/gpf-js&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/github/ArnaudBuchholz/gpf-js/badge.svg?targetFile=package.json)](https://snyk.io/test/github/ArnaudBuchholz/gpf-js?targetFile=package.json)
[![dependencies Status](https://david-dm.org/ArnaudBuchholz/gpf-js/status.svg)](https://david-dm.org/ArnaudBuchholz/gpf-js)
[![devDependencies Status](https://david-dm.org/ArnaudBuchholz/gpf-js/dev-status.svg)](https://david-dm.org/ArnaudBuchholz/gpf-js?type=dev)
[![Built with Grunt](https://gruntjs.com/cdn/builtwith.png)](http://gruntjs.com/)
[![Vanilla JS](http://vanilla-js.com/assets/button.png)](http://vanilla-js.com)
[![gpf-js](https://badge.fury.io/js/gpf-js.svg)](https://www.npmjs.org/package/gpf-js)
[![gpf-js](http://img.shields.io/npm/dm/gpf-js.svg)](https://www.npmjs.org/package/gpf-js)
[![install size](https://packagephobia.now.sh/badge?p=gpf-js)](https://packagephobia.now.sh/result?p=gpf-js)
[![CDN](https://data.jsdelivr.com/v1/package/npm/gpf-js/badge)](https://www.jsdelivr.com/package/npm/gpf-js)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A multi-purpose JavaScript library created and maintained by
[Arnaud Buchholz](http://gpf-js.blogspot.com/).

## Features

* Provides a common scripting layer for several hosts
([cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx),
[NodeJS](http://nodejs.org/),
[Rhino](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino),
[Nashorn](https://en.wikipedia.org/wiki/Nashorn_%28JavaScript_engine%29),
[PhantomJS](http://phantomjs.org/), most *recent* browsers)
* Namespace and class system
* Interface based
* Asynchronous streams
* Modularization helper
* Attributes
* Almost 100% coverage

This library is developed in conjunction with a [blog](http://gpf-js.blogspot.com/) where the concepts and algorithms are documented and explained.

## Metrics

This part is automatically updated upon a successful build:
* Code coverage is computed by executing [all hosts](https://arnaudbuchholz.github.io/gpf/doc/tutorial-LOADING.html),
ignored parts are [documented](https://arnaudbuchholz.github.io/gpf/doc/tutorial-COVERAGE.html)
* The [maintainability](https://arnaudbuchholz.github.io/gpf/plato/index.html) is based on
[plato evaluation](http://blogs.msdn.com/b/codeanalysis/archive/2007/11/20/maintainability-index-range-and-meaning.aspx)

**SME** stands for **s**ource **m**inimal **e**xpectation.

Metric name | average | total | SME | comment
------ | ----- | ----- | ----- | -----
Statements coverage|100%||90%|*0.32% ignored*
Branches coverage|100%||90%|*0.69% ignored*
Functions coverage|100%||90%|*0.6% ignored*
Maintainability|83.68||70|
Number of tests||1090||*pending: 0, duration: 1034ms*
Number of sources||144||
Lines of code|92|13339||

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

Date | Version | Label | Release | Debug | Flavors
------ | ------ | ----- | ----- | ----- | -----
2019-03-12 | [0.2.9](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.9) | [ES6 Support](https://gpf-js.blogspot.com/p/release-notes-are-coming.html?version=0.2.9) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.9/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.9) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.9/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.9) | [node](https://arnaudbuchholz.github.io/gpf/0.2.9/gpf-node.js) / [require](https://arnaudbuchholz.github.io/gpf/0.2.9/gpf-require.js)
2018-12-03 | [0.2.8](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.8) | [Serialization attributes](https://gpf-js.blogspot.com/2018/12/release-028.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.8/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.8) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.8/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.8) | [require](https://arnaudbuchholz.github.io/gpf/0.2.8/gpf-require.js)
2018-08-04 | [0.2.7](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.7) | [Quality and XML](https://gpf-js.blogspot.com/2018/08/release-027-quality-and-xml.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.7/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.7) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.7/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.7) | [require](https://arnaudbuchholz.github.io/gpf/0.2.7/gpf-require.js)
2018-05-03 | [0.2.6](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.6) | [gpf.require.js](https://gpf-js.blogspot.com/2018/05/release-026-gpfrequirejs.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.6/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.6) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.6/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.6) | [require](https://arnaudbuchholz.github.io/gpf/0.2.6/gpf-require.js)
2018-04-03 | [0.2.5](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.5) | [Flavors](https://gpf-js.blogspot.com/2018/04/release-025-flavors.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.5/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.5) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.5/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.5) | 
2018-02-28 | [0.2.4](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.4) | [Attributes](https://gpf-js.blogspot.com/2018/03/release-024-attributes.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.4/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.4) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.4/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.4) | 
2017-12-20 | [0.2.3](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.3) | [Streams and Pipes](https://gpf-js.blogspot.com/2017/12/release-023-streams-and-pipes.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.3/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.3) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.3/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.3) | 
2017-11-01 | [0.2.2](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.2) | [gpf.require](https://gpf-js.blogspot.com/2017/11/release-022-gpfrequire.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.2/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.2) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.2/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.2) | 
2017-06-06 | [0.2.1](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.2.1) | [Side project support](https://gpf-js.blogspot.com/2017/06/release-021-side-project-support.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.1/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.2.1) | [lib](https://arnaudbuchholz.github.io/gpf/0.2.1/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.2.1) | 
2017-04-29 | [0.1.9](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.9) | [Records files](https://gpf-js.blogspot.com/2017/04/release-019-records-files.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.9/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.9) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.9/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.9) | 
2017-03-26 | [0.1.8](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.8) | [Interfaces](https://gpf-js.blogspot.com/2017/03/release-018.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.8/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.8) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.8/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.8) | 
2017-03-02 | [0.1.7](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.7) | [Securing gpf.define](https://gpf-js.blogspot.com/2017/03/release-017.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.7/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.7) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.7/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.7) | 
2017-02-05 | [0.1.6](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.6) | [gpf.define](https://gpf-js.blogspot.com/2017/02/release-016.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.6/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.6) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.6/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.6) | 
2016-12-05 | [0.1.5](https://github.com/ArnaudBuchholz/gpf-js/tree/v0.1.5) | [The new core](https://gpf-js.blogspot.com/2016/12/release-015.html) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.5/gpf.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?release=0.1.5) | [lib](https://arnaudbuchholz.github.io/gpf/0.1.5/gpf-debug.js) / [test](https://arnaudbuchholz.github.io/gpf/test.html?debug=0.1.5) | 

## Credits

* Code rewriting based on [esprima](http://esprima.org/) and [escodegen](https://github.com/Constellation/escodegen)
* Markdown specification inspired from [wikipedia](http://en.wikipedia.org/wiki/Markdown)
* UTF-8 encode/decode based on [webtoolkit](http://www.webtoolkit.info/)
* Promise/A+ implementation based on [promise-polyfill](https://github.com/taylorhakes/promise-polyfill)
* atob/btoa implementation based on [base64-js](https://github.com/MaxArt2501/base64-js)
* [mocha](http://mochajs.org/) test suite
* [istanbul](https://github.com/gotwarlost/istanbul) code coverage tool
* JavaScript task runner: [Grunt](http://gruntjs.com/)
* Icons from [Hawcons](https://www.iconfinder.com/iconsets/hawcons)
* WScript simulated environment inspired from excellent [WScript project from Mischa Rodermond](https://github.com/mrpapercut/wscript)
* Awesome dependency wheel from [Francois Zaninotto](https://github.com/fzaninotto/DependencyWheel)
