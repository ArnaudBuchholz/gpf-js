The library offers a common compatibility layer whatever the environment it runs on.

## Standard object methods and statics

### Array

* [every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every)
* [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
* [forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
* [includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)
* [indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
* [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
* [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
* [some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
* [Array.from](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
* [Array.isArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)

### Date

The Date constructor supports [ISO 8601 format](http://gpf-js.blogspot.ca/2016/02/date-override.html)
and instances offers:
* [toIsoString](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)
* [Date.now](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)

### Function

* [bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
* compatibleName(): introduced to provide a convenient way to read function names. Indeed,
[name](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name) property is not
supported on all hosts.

**NOTE:** Function.prototype.toString() does not include comments on Rhino.

### Object

* [Object.assign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
* [Object.create](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
* [Object.getPrototypeOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf)
* [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
* [Object.values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values)

**NOTE:** Object.keys doesn't behave the same way on primitive types depending on the host.

### String

* [endsWith](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith)
* [includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes)
* [padEnd](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd)
* [padStart](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart)
* [startsWith](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith)
* [trim](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim)

## Console

The library defines (when not existing) [console.log](https://developer.mozilla.org/en-US/docs/Web/API/Console/log),
[console.warn](https://developer.mozilla.org/en-US/docs/Web/API/Console/warn) and
[console.error](https://developer.mozilla.org/en-US/docs/Web/API/Console/error).

**NOTE:** Only one string parameter is expected.

## Promise

The library offers (when necessary) a [Promise/A+](https://promisesaplus.com/) implementation based on
[promise-polyfill](https://github.com/taylorhakes/promise-polyfill)

## Timeout

* [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setTimeout)
* [clearTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/clearTimeout)

setInterval / clearInterval are not managed but can be easily simulated by chaining timeouts.

On some hosts, {@link gpf.handleTimeout}() must be used to activate timeouts.

## JSON

* [parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse)
* [stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)

**NOTE:** Some hosts have their own specificities in the way the [reviver](https://github.com/ArnaudBuchholz/gpf-js/blob/2b4ced1d6dd3de99344d64eb14c97c89793305ba/test/compatibility/
json.js#L225) /
[replacer](https://github.com/ArnaudBuchholz/gpf-js/blob/2b4ced1d6dd3de99344d64eb14c97c89793305ba/test/compatibility/
json.js#L139) keys are transmitted. It is recommended to
convert the keys to string to ensure maximum compatibility.

## Strict mode

When functions are generated,
[strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)
is always assumed even if the host (such as Rhino or WScript) does not support it.
