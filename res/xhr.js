/**
 * Promise implementation of XmlHttpRequest
 */
(function () {
    "use strict";

    function _xhrGet (url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.onreadystatechange = function () {
                if (4 === xhr.readyState) {
                    if (2 === Math.floor(xhr.status / 100)) {
                        resolve(xhr.responseText);
                    } else {
                        reject(xhr.statusText);
                    }
                }
            };
            xhr.send();
        });
    }

    window.xhrGet = _xhrGet;

}());
