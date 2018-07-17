The library offers a way to organize any project by creating separate resources files and reference them
like dependencies. The {@see gpf.require.define} API is the main entry point.

A resource file is referenced using its path. A resource may reference another resource using a path that is relative
to the current one. For the initial call, a base path may be defined using {@see gpf.require.configure}.
The resource resolved path correspond to the resource absolute path.

The library handles several type of resources files. Type detection is based on the path extension (case insensitive):
- **.json** JSON static resource file
- **.js** JavaScript module
- by default, any other type is handled as a text file

Once a resource file is loaded, its associated output *(see below)* is cached and indexed using the resolved file path.
Consequently (considering the cache is never cleared):
- If the same resource (i.e. the same resolved path) is accessed twice, the file will be loaded only once
- Any modification applied to the output will be reflected globally

## JSON static resource file

A JSON file is loaded, parsed and the result value is the output.

## JavaScript Module

Modules are designed to enforce best practices:
- The module scope is private, public exposure has to be
[explicit](https://carldanley.com/js-revealing-module-pattern/). This reduces the global namespace cluttering.
 *(see the different supported formats below)*
- Dependencies are loaded first and then made available to the module through
[injection](https://en.wikipedia.org/wiki/Dependency_injection)

Whatever the chosen module format, the top level call must be {@see gpf.require.define}.
The factory function is optional and a promised is returned to know when the dependant resources are loaded.

The library supports several module formats. In general, the `gpf` symbol is always available.
If you need an access to the global context, use the `{@see gpf.context}` API.

### GPF Module

This module format is similar to the [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) one but
it limits the number of parameters inside the factory function. Indeed, dependencies are explicitly named in a
dictionary and consolidated with the same name in one parameter.

The module public API (i.e. resource output) is the result of the factory function.

```javascript
gpf.require.define({
    name1: "dependency1.js",
    name2: "dependency2.js",
    // ...
    nameN: "dependencyN.js"

}, function (require) {
    "use strict";
    // Private scope

    require.name1.api1();

    // Implementation

    // Interface
    return {

        api1: function (/*...*/) {
            /*...*/
        },

        // ...

        apiN: function (/*...*/) {
            /*...*/
        }

    };

});
```

### Asynchronous Module Definition (AMD)

The library supports the [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) format.

```javascript
define("amd", [
    "dependency1.js",
    "dependency2.js",
    /*...*/,
    "dependencyN.js"
], function (name1, name2, /*...*/ nameN) {
    "use strict";
    // Private scope

    name1.api1();

    // Implementation

    // Interface
    return {

        api1: function (/*...*/) {
            /*...*/
        },

        // ...

        apiN: function (/*...*/) {
            /*...*/
        }

    };

});
```

Or a shorter version (no name)

```javascript
define([
    "dependency1.js",
    "dependency2.js",
    /*...*/,
    "dependencyN.js"
], function (name1, name2, /*...*/ nameN) {
    "use strict";
    // Private scope

    name1.api1();

    // Implementation

    // Interface
    return {

        api1: function (/*...*/) {
            /*...*/
        },

        // ...

        apiN: function (/*...*/) {
            /*...*/
        }

    };

});
```

Even shorter if you don't need dependencies:

```javascript
define(function () {
    "use strict";
    // Private scope

    // Implementation

    // Interface
    return {

        api1: function (/*...*/) {
            /*...*/
        },

        // ...

        apiN: function (/*...*/) {
            /*...*/
        }

    };

});
```

### CommonJS

The library also supports the [CommonJS](https://en.wikipedia.org/wiki/CommonJS) format with restrictions:
* Only static requires can be used (i.e. the require parameter **must** be a string)
* Required modules are evaluated even if the require instruction is not evaluated (i.e. inside a condition)

The module public API (i.e. resource output) is the result of the `module.export`.

```javascript
"use strict";
// Private scope

var name1 = require("dependency1.js"),
    name2 = require("dependency2.js"),
    // ...
    nameN = require("dependencyN.js");

name1.api1();

// Implementation

// Interface
module.exports = {

    api1: function (/*...*/) {
        /*...*/
    },

    // ...

    apiN: function (/*...*/) {
        /*...*/
    }

};
```

## Preloading

Since version 0.2.7, the library offers a way to inject a dictionary associating resource names to their
textual content. The goal is to speed up the application loading by consolidating all dependent resources
into a single JSON file and preload all resources in one call.

```javascript
// Proposed implementation
gpf.http.get("preload.json")
    .then(function (response) {
        if (response.status === 200) {
            return JSON.parse(response.responseText);
        }
        return Promise.reject();
    })
    .then(function (preload) {
        gpf.require.configure({
            preload: preload
        });
    })
    .catch(function (reason) {
        // Document and/or absorb errors
    })
    .then(function () {
        gpf.require.define({
            app: "app.js" // Might be preloaded
        }, function (require) {
            require.app.start();
        });
    });
```
