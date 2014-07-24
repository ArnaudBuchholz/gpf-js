(function () { /* Begin of privacy scope */
    "use strict";
    /*global gpfSourcesPath*/

    var
        _eventsHandler,
        _tests = {},
        _names = [],
        _sources,
        _sourcesIdx,

        _testDetailsCompare = function () {
            var
                details = ["1:\t("],
                type = typeof arguments[0];
            details.push(type, ")\t");
            if ("undefined" === type) {
                details.push("undefined");
            } else {
                details.push(gpf.json.stringify(arguments[0]));
            }
            details.push("\r\n2:\t(");
            type = typeof arguments[1];
            details.push(type, ")\t");
            if ("undefined" === type) {
                details.push("undefined");
            } else {
                details.push(gpf.json.stringify(arguments[1]));
            }
            details.push("\r\nare");
            if ("equal" === this._type || "like" === this._type) {
                details.push(" not");
            }
            if ("equal" === this._type || "notEqual" === this._type) {
                details.push(" equal");
            } else {
                details.push(" alike");
            }
            return details.join("");
        },

        _testDetails = {
            exception: function () {
                return ["message: ", arguments[0].message].join("");
            },
            equal: _testDetailsCompare,
            notEqual: _testDetailsCompare,
            like: _testDetailsCompare,
            notLike: _testDetailsCompare,
            assert: function () {
                var
                    details = [],
                    idx = 1,
                    obj,
                    objIsTest,
                    testProto = TestReport.prototype,
                    property,
                    value;
                while (idx + 1 < arguments.length) {
                    obj = arguments[idx++];
                    if (null === obj) {
                        continue;
                    }
                    objIsTest = obj.constructor === TestReport;
                    for (property in obj) {
                        if (obj.hasOwnProperty(property)) {
                            if (objIsTest && testProto.hasOwnProperty(property)
                                || property.charAt(0) === "_") {
                                continue;
                            }
                            value = obj[property];
                            if (undefined === value) {
                                value = "<undefined>";
                            } else if (null === value) {
                                value = "<null>";
                            } else if ("function" === typeof value) {
                                value = "<function>";
                            }
                            details.push("\t", property, "= ", value.toString(),
                                "\n");
                        }
                    }
                }
                return details.join("");
            }
        };

    function output(type, text, eventsHandler) {
        if (!eventsHandler) {
            eventsHandler = _eventsHandler;
        }
        gpf.events.fire(type, {message: text}, eventsHandler);
    }

    function error(text, eventsHandler) {
        output("error", text, eventsHandler);
    }

    function warning(text, eventsHandler) {
        output("warning", text, eventsHandler);
    }

    function info(text, eventsHandler) {
        output("info", text, eventsHandler);
    }

    function log(text, eventsHandler) {
        output("log", text, eventsHandler);
    }

    function TestItem(type, parameters) {
        this._type = type;
        this._parameters = parameters;
    }

    gpf.extend(TestItem.prototype, {

        output: function (eventsHandler) {
            var
                message = this._parameters[this._parameters.length - 1],
                details,
                succeeded;
            if ("title" === this._type) {
                info(message, eventsHandler);
            } else {
                succeeded = this.isSuccess();
                if (!succeeded) {
                    message = [ message, ": ", this._type, " error" ];
                    details = this.getDetails();
                    if (details) {
                        message.push("\n", details);
                    }
                    message = message.join("");
                }
                if (this.isSuccess()) {
                    log(message, eventsHandler);
                } else {
                    error(message, eventsHandler);
                }
            }
        },

        getDetails: function() {
            return _testDetails[this._type].apply(this, this._parameters);
        },

        isSuccess: function() {
            if ("title" === this._type || "log" === this._type) {
                return true;
            } else if ("equal" === this._type) {
                return this._parameters[0] === this._parameters[1];
            } else if ("notEqual" === this._type) {
                return this._parameters[0] !== this._parameters[1];
            } else if ("like" === this._type) {
                return gpf.like(this._parameters[0], this._parameters[1]);
            } else if ("notLike" === this._type) {
                return !gpf.like(this._parameters[0], this._parameters[1]);
            } else if ("assert" === this._type) {
                return this._parameters[0];
            }
            return false; // Unknown test
        }

    });

    function TestReport() {
        this._items = [];
        this._errors = 0;
    }

    gpf.each("title,log,assert,equal,notEqual,like,notLike,exception"
        .split(","),
        function(/*idx, name*/){
            var name = arguments[1];
            TestReport.prototype[name] = function() {
                var item = new TestItem(name, arguments);
                this._items.push(item);
                if (!item.isSuccess()) {
                    ++this._errors;
                }
            };
        });

    gpf.extend(TestReport.prototype, {

        _items: [],
        _errors: 0,
        _sync: true,
        _done: false,
        _callback: null,
        _lastParams: null,

        output: function (eventsHandler) {
            var idx;
            for (idx = 0; idx < this._items.length; ++idx) {
                this._items[idx].output(eventsHandler);
            }
        },

        getTestCount: function () {
            var
                idx,
                item,
                result = 0;
            for (idx = 0; idx < this._items.length; ++idx) {
                item = this._items[idx];
                // Inelegant but works
                if (undefined !== _testDetails[item._type]) {
                    ++result;
                }
            }
            return result;
        },

        wait: function () {
            this._sync = false;
            gpf.defer(this._waitedTooLong, TestReport.WAIT_TIMEOUT, this);
        },

        _waitedTooLong: function () {
            if (!this._done) {
                this.assert(false, "Waited too long");
                this.done();
            }
        },

        synchronous: function (callback, lastParams) {
            if (!this._sync) {
                this._callback = callback;
                this._lastParams = lastParams;
            }
            return this._sync;
        },

        done: function () {
            if (!this._done) {
                this._done = true;
                if (this._callback) {
                    this._callback.apply(null, [this].concat(this._lastParams));
                }
            }
        }

    });
    TestReport.WAIT_TIMEOUT = 100;

    function includeFailed(e) {
        var source = _sources[_sourcesIdx - 1];
        if (e) {
            warning(e.message);
        } else {
            warning("Missing " + source);
        }
    }

    function includeFailedAsync() {
        includeFailed();
        loadTestSources();
    }

    function wscriptInclude(src) {
        var srcFile;
        if (!wscriptInclude.fso) {
            wscriptInclude.fso =
                new ActiveXObject("Scripting.FileSystemObject");
        }
        if (wscriptInclude.fso.FileExists(src)) {
            srcFile = wscriptInclude.fso.OpenTextFile(src);
            try {
                /*jslint evil:true*/
                eval(srcFile.ReadAll());
                /*jslint evil:false*/
            } catch (e) {
                includeFailed(e);
            }
            srcFile.Close();
        } else {
            includeFailed();
        }
        return false;
    }

    function nodejsInclude(src) {
        try {
            // require is relative to the current file (i.e. manager)
            require("../" + src);
        } catch (e) {
            includeFailed(e);
        }
        return false;
    }

    function include(src) {
        log("Reading '" + src + "'");
        if ("wscript" === gpf.host()) {
            return wscriptInclude(src);
        } else if ("nodejs" === gpf.host()) {
            return nodejsInclude(src);
        } else { // browser
            gpf.http.include(src, {
                load: loadTestSources,
                error: includeFailedAsync
            });
            return true; // Asynchronous
        }
    }

    function asyncTestDone(report, callback, context) {
        var args;
        if (0 === report._items.length) {
            report.assert(false, "Empty report");
        }
        if (callback) {
            args = [report];
            if (context) {
                args.push(context);
            }
            callback.apply(null, args);
        }
    }

    function executeTest(name, callback, context) {
        var
            testFunction,
            report = new TestReport();
        if (name instanceof Function) {
            testFunction = name;
        } else {
            testFunction = _tests[name];
        }
        try {
            testFunction(report);
        } catch (e) {
            report.exception(e, "Unexpected exception");
        }
        if (report.synchronous(asyncTestDone, [callback, context])) {
            asyncTestDone(report, callback, context);
        }
    }

    function executeNextTest(context) {
        var name;
        if (context.namesIdx < _names.length) {
            name = _names[context.namesIdx];
            ++context.total;
            executeTest(name, executeAfterTest, context);
        } else {
            info("Number of tested conditions: " + context.testCount,
                _eventsHandler);
            if (0 === context.errors) {
                info("All tests succeeded (" + context.total + ")",
                    _eventsHandler);
            } else {
                error("Some tests failed (" + context.errors + "/"
                    + context.total + ")", _eventsHandler);
            }
        }
    }

    function executeAfterTest(report, context) {
        var name = _names[context.namesIdx];
        context.testCount += report.getTestCount();
        ++context.namesIdx;
        if (0 === report._errors) {
            gpf.events.fire("success", {
                name: name
            }, _eventsHandler);
        } else {
            gpf.events.fire("failure", {
                name: name
            }, _eventsHandler);
            ++context.errors;
        }
        // Success or failure may lead to the inner call of gpf.testReport
        if (gpf.testReport._inProgress) {
            gpf.testReport._context = context;
        } else {
            executeNextTest(context);
        }
    }

    function executeTests() {
        var
            context = {
                namesIdx: 0,
                errors: 0,
                total: 0,
                testCount: 0
            };
        info("Test count: " + _names.length);
        executeNextTest(context);
    }

    function loadTestSources() {
        var src;
        while (_sourcesIdx < _sources.length) {
            src = "test/" + _sources[_sourcesIdx++] + ".js";
            if ("undefined" !== typeof gpfSourcesPath) {
                src = gpfSourcesPath + src;
            }
            if (include(src)) {
                return; // Asynchronous, must wait
            }
        }
        executeTests();
    }

    /**
     * 
     * @param {Object} sourceTests
     * @return {undefined}
     * 
     * @internal
     */
    gpf.declareTests = function (sourceTests) {
        var
            source = _sources[_sourcesIdx - 1],
            component,
            functions,
            idx,
            name;
        for (component in sourceTests) {
            if (sourceTests.hasOwnProperty(component)) {
                functions = sourceTests[component];
                for (idx = 0; idx < functions.length; ++idx) {
                    name = source + "/" + component + "/" + idx;
                    _tests[name] = functions[idx];
                    _names.push(name);
                }
            }
        }
    };

    /**
     * Handles the tests
     * 
     * @param {Object/function} eventsHandler
     * @return {Number} Number of errors
     *
     * @eventParam {string} message The message
     *
     * @event error The manager outputs an error message
     * @event warning The manager outputs a warning message
     * @event info The manager outputs an information message
     * @event log The manager outputs a log message
     * 
     * @eventParam {string} name The test name
     * @event success The test succeeded
     * @event failure The test failed
     */
    gpf.runTests = function (eventsHandler) {
        // Check that sources are pre-loaded first
        _eventsHandler = eventsHandler;
        if (!gpf.sources) {
            error("Missing gpf.sources");
            return 1;
        }
        _sources = gpf.sources().split(",");
        _sourcesIdx = 0;
        loadTestSources();
        return 0;
    };

    /**
     * Explain a failing test by generating a report
     *
     * @param {String} name
     * @param {Object/function} eventsHandler
     * @return {undefined}
     *
     * @eventParam {string} message The message
     *
     * @event error The manager outputs an error message
     * @event warning The manager outputs a warning message
     * @event info The manager outputs an information message
     * @event log The manager outputs a log message
     */
    gpf.testReport = function (name, eventsHandler) {
        var context;
        gpf.testReport._inProgress = true;
        executeTest(name, function (report){
            report.output(eventsHandler);
            gpf.testReport._inProgress = false;
            if (gpf.testReport._context) {
                context = gpf.testReport._context;
                gpf.testReport._context = null;
                executeNextTest(context);
            }
        });
    };

    /**
     * Used to know if a call is in progress
     *
     * @type {boolean}
     * @private
     */
    gpf.testReport._inProgress = false;

    /**
     * Call executeNext(_context) if set on completion
     *
     * @type {Object}
     * @private
     */
    gpf.testReport._context = null;

}()); /* End of privacy scope */
