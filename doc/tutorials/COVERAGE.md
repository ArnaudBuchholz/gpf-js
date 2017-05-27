## Coverage exceptions

Source | Identifier | Description
------ | ---------- | -----------
 - | hasOwnProperty.1 | [Else case for hasOwnProperty](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignore-an-else-path)
boot | boot.1 | When host detection fails, the {@link gpf.hosts.unknown} value is used. This case can't be tested. 
assert | assert.1 | Coverage is estimated with the source version of GPF-JS, i.e. in DEBUG mode.
