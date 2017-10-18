The library offers a way to organize the project by creating separate resources files and link them
using dependencies. The {@see gpf.require.define} API is the main entry point. 

A resource is referenced using its path. A resource may reference other resources using a relative path.
For the initial call, a base path might be defined using {@see gpf.require.configure}.
The resolved resource name correspond to the concatenation of the base path and the resource path.

Several type of resources files can be linked, type detection is based on the extension (case insensitive):
- **.json** JSON static resource file
- **.js** JavaScript module

Once a resource file is loaded, its associated output is cached using the resolved file name.
Consequently (considering the cache is never cleared):
- If the same resource is accessed twice (using relative path but with the same resolved file name),
the file will be loaded only once
- Any modification applied to the output will be reflected globally
  
## JSON static resource file

A JSON file is loaded, parsed and the result object is associated to the resource name.
 

## JavaScript Module

resources => module or static resources

A module has several properties:
- Its scope is private, it decides what is exposed
- Dependencies are loaded first and then made available to the module

Whatever the chosen module format, the very first call must be {@see gpf.require.define}.
The factory function is optional and a promised is returned to know whe nthe dependant modules are loaded.
Once the initial call is made, the API supports several formats.


In general, the `gpf` symbol is always available. It allows you to access the global context through the
`{@see gpf.context}` API.
In particular, you may define a gpf module using {@see gpf.require.define}.

```JavaScript
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
 
## Asynchronous Module Definition (AMD)

The [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) format

```JavaScript
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

```JavaScript
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

```JavaScript
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

## CommonJS

The [CommonJS](https://en.wikipedia.org/wiki/CommonJS) format:

```JavaScript
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
