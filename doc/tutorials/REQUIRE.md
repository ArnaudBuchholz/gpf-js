The library proposes a way to organize the code by creating separate source files (modules) with dependencies.
The ({@see gpf.require.define}) API is the main entry point. 

A module has several properties:
- Its scope is private: you can define variables inside it...
- Dependencies are resolved then injected

Whatever the module format you want to apply, it must always start with a call to gpf.require.define.
No factory function is required and you know when dependant modules are loaded because of the returned promise that is
resolved upon successful loading of dependencies. 

## GPF Module

```JavaScript
gpf.require.define({
    
}, function (require) {
    
});
```

 
## Asynchronous Module Definition (AMD)

The [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) format

```JavaScript
define("amd", ["data.json"], function (data) {
    "use strict";

    return {
        type: "amd",
        data: data
    };
});
```

```JavaScript
define(["data.json"], function (data) {
    "use strict";

    return {
        type: "amd",
        data: data
    };
});
```

```JavaScript
define(function () {
    "use strict";

    return {
        type: "amd",
    };
});
```

## CommonJS

```JavaScript
var data = require("data.json");

module.exports = {
    type: "commonjs",
    data: data
};
```
