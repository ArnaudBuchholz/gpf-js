/*#ifndef(UMD)*/
"use strict";
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*#endif*/

/*                                                                             |
 * First of all, apply JSHint with:                                            |
 * - Tolerate continue                                                         |
 * - Tolerate dangling _ in identifiers                                        |
 * - Tolerate ++ and --                                                        |
 *                                                                             |
 * Tabs must be replaced with 4 spaces                                         |
 *                                                   *NEVER* go over column 80 |
 *                                                                             |
 * try to limit the use of closures                                            |
 */

/* Global variables are shared within GPF sources so they might conflict */
var
    _gpfVariableName,

    /**
     * Private class constructor
     *
     * @constructor
     * @private
     */
    _GpfClassName = function () {
        this._member = 0;
    };

_GpfClassName.prototype = {

    /**
     * Private member
     *
     * @private
     */
    _member: 0
};

/**
 * Functions are always documented
 *
 * @param {*} firstParameter
 * @param {*} secondParameter
 */
gpf.actionWithAdditionalKeywords = function (firstParameter, secondParameter) {
    var
        firstVariable,
        secondVariable,
        // Initialized variables must be the last ones
        // Try to avoid function calls in there
        thirdVariable = 0; // Initialized
    _gpfIgnore(firstParameter);
    _gpfIgnore(secondParameter);
    _gpfIgnore(firstVariable);
    _gpfIgnore(secondVariable);
    _gpfIgnore(thirdVariable);
    _gpfVariableName = 0;
};

/**
 * Any function triggering events
 *
 * @param {*} param1
 * @param {gpf.events.Handler} eventsHandler
 * @returns {undefined}
 *
 * @event sample
 * This is the sample event
 *
 * @eventParam {any} ctx1 the first event parameter
 */
gpf.AnyClass.triggerEvent = function (param1, eventsHandler) {
    gpf.events.fire.apply(this, ["sample", {ctx1: param1}, eventsHandler]);
};

gpf.define("newClass", {

    /*
     * Modifier can be: abstract, const
     */
    method: function /*modifier*/ () {

    }

});