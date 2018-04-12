Source | Identifier | Description
------ | ---------- | -----------
 - | hasOwnProperty.1 | [Else case for hasOwnProperty](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignore-an-else-path).
 - | exit.1 | Exit function terminates the current processus, hence it can't be tested.
 - | unknown.1 | When host detection fails, the {@link gpf.hosts.unknown} value is used. This case can't be tested.
assert | assert.1 | Coverage is estimated with the source version of GPF-JS, i.e. in DEBUG mode.
define/build | define.build.1 | This method is defined as a property getter but is used only once for now as it is not exposed.
host/wscript | wscript.echo.1 | WScript.Echo can't be bound to WScript and is not testable.
compability/promise | compability.promise.1 | Exception handling inside promise handlers are securing the code. No time was spent to understand how exceptions could occur in some particular case.  
compatibility/object | wscript.node.1 | When WScript is simulated with NodeJS, the member __proto__ exists
read | flavor.1 | When flavors are used, the gpf.fs namespace might be missing
