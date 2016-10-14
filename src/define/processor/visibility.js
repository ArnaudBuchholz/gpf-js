/*#ifndef(UMD)*/
"use strict";
/*global _gpfVisibilityKeywords*/ // List of visibility keywords
/*global _gpfVisibilityFromKeyword*/ // Convert visibility keyword into enum
/*#endif*/

var visibilityProcessor = {

    pre: function (definition, chain) {
        if (_gpfVisibilityKeywords.every(function (keyword) {
            if (definition[keyword]) {
                return false;
            }
            return true;
        })) {
            return false; // No keyword TODO assign visibility depending on the naming convention
        }
        _gpfVisibilityKeywords.every(function (keyword) {
            var visibility = _gpfVisibilityFromKeyword(keyword);
            if (definition[visibility]) {
                var members = chain(definition[visibility]);
                members.forEach(function (member) {
                    member.setVisibility(visibility);
                });
            }
        });
        return true; // handled
    }

};
