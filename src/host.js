/**
 * @file Triggers host specific boot
 * @since 0.2.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_HOST*/ // Host types
/*global _gpfBootImplByHost*/ // Boot host specific implementation per host
/*global _gpfHost*/ // Host type
/*#endif*/

_gpfBootImplByHost[_gpfHost]();

/**
 * Host type enumeration
 *
 * @enum {String}
 * @readonly
 * @since 0.1.5
 */
gpf.hosts = {
    /**
     * Any browser (phantomjs is recognized separately)
     * @since 0.1.5
     */
    browser: _GPF_HOST.BROWSER,
    /**
     * [Nashorn](https://en.wikipedia.org/wiki/Nashorn_%28JavaScript_engine%29)
     * @since 0.2.4
     */
    nashorn: _GPF_HOST.NASHORN,
    /**
     * [NodeJs](http://nodejs.org/)
     * @since 0.1.5
     */
    nodejs: _GPF_HOST.NODEJS,
    /**
     * [PhantomJS](http://phantomjs.org/)
     * @since 0.1.5
     */
    phantomjs: _GPF_HOST.PHANTOMJS,
    /**
     * [Rhino](http://developer.mozilla.org/en/docs/Rhino)
     * @since 0.1.5
     */
    rhino: _GPF_HOST.RHINO,
    /**
     * Unknown (detection failed or the host is unknown)
     * @since 0.1.5
     */
    unknown: _GPF_HOST.UNKNOWN,
    /**
     * [cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx)
     * @since 0.1.5
     */
    wscript: _GPF_HOST.WSCRIPT
};

/**
 * Returns the detected host type
 *
 * @return {gpf.hosts} Host type
 * @since 0.1.5
 */
gpf.host = function () {
    return _gpfHost;
};
