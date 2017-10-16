The library offers a way to organize the code by creating separate source files (modules) and load them when needed by
declaring dependencies between them.

Scope is private

 
## Asynchronous Module Definition (AMD)

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
