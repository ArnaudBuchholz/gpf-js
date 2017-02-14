(function () {
    "use strict";

    /*jshint node: true*/
    /*eslint-env node*/

    // http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn

    var childProcess = require("child_process"),
        psTree = require("ps-tree");

    if (/^win/.test(process.platform)) {
        module.exports = function (pid) {
            childProcess.exec("taskkill /PID " + pid + " /T /F");
        };

    } else {
        module.exports = function (pid) {
            psTree(pid, function (err, children) { // eslint-disable-line handle-callback-err
                [pid].concat(
                    children.map(function (p) {
                        return p.PID;
                    })
                ).forEach(function (tpid) {
                    try {
                        process.kill(tpid, "SIGKILL");
                    } catch (ex) {
                        // ignore
                    }
                });
            });
        };

    }

}());
