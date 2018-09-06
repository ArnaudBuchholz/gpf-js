/**
 * @file Assertion helpers
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfAssert*/ // Assertion method
/*exported _gpfAsserts*/ // Multiple assertion method
/*#endif*/

var _gpfAssert,
    _gpfAsserts,
    _gpfAssertWarn = true;

function _gpfAssertConsoleWarn (message) {
    if (_gpfAssertWarn) {
        console.warn("ASSERTION FAILED: " + message);
    }
}

function _gpfAssertFailIfConditionFalsy (condition, message) {
    if (!condition) {
        _gpfAssertConsoleWarn(message);
        gpf.Error.assertionFailed({
            message: message
        });
    }
}

/**
 * Assertion helper
 *
 * @param {Boolean} condition Truthy / [Falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value
 * @param {String} message Assertion message explaining the violation when the condition is false
 * @throws {gpf.Error.AssertionFailed}
 * @since 0.1.5
 */
function _gpfAssertImpl (condition, message) {
    if (undefined === message) {
        message = "Assertion with no message";
        condition = false;
    }
    _gpfAssertFailIfConditionFalsy(condition, message);
}

/**
 * Batch assertion helper
 *
 * @param {Object} assertions Dictionary of messages associated to condition values
 * @throws {gpf.Error.AssertionFailed}
 * @since 0.1.5
 */
function _gpfAssertsImpl (assertions) {
    _gpfObjectForEach(assertions, _gpfAssertFailIfConditionFalsy);
}

/**
 * @gpf:sameas _gpfAssertImpl
 * @since 0.1.5
 */
gpf.assert = _gpfAssertImpl;

/**
 * @gpf:sameas _gpfAssertsImpl
 * @since 0.1.5
 */
gpf.asserts = _gpfAssertsImpl;

/**
 * By default, a failing assert will generate a console warning.
 * Use this method to prevent console warnings to be generated.
 *
 * @param {Boolean} silent True to prevent console warnings on failing assertions
 * @since 0.1.8
 */
gpf.preventAssertWarnings = function (silent) {
    _gpfAssertWarn = !silent;
};

/*#ifdef(DEBUG)*/

// DEBUG specifics

_gpfAssert = _gpfAssertImpl;
_gpfAsserts = _gpfAssertsImpl;

/* istanbul ignore if */ // assert.1
if (!_gpfAssert) {

    /*#else*/

    /*gpf:nop*/ _gpfAssert = _gpfEmptyFunc;
    /*gpf:nop*/ _gpfAsserts = _gpfEmptyFunc;

    /*#endif*/

    /*#ifdef(DEBUG)*/

}

/*#endif*/
