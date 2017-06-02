## [cscript/wscript](http://technet.microsoft.com/en-us/library/bb490887.aspx)

### Using [Windows Script File](https://en.wikipedia.org/wiki/Windows_Script_File) format

```xml
<?xml version="1.0"?>
<job id="gpfExample">
  <script language="JScript" src="gpf.js" />
  <script language="JScript">
    // use gpf namespace
  </script>
</job>
```

### Using [Scripting.FileSystemObject](https://msdn.microsoft.com/en-us/library/aa711216%28v=vs.71%29.aspx) object

```javascript
var fso = new ActiveXObject("Scripting.FileSystemObject");
eval(fso.OpenTextFile("gpf.js", 1, false, 0).ReadAll());
// use gpf namespace
```

## [NodeJS](http://nodejs.org/)

### Using gpf.js directly

Assuming the file is in the same folder than your source.

```javascript
var gpf = require("./gpf.js");
```

### Using NPM package

To install the [gpf-js package](https://www.npmjs.com/package/gpf-js) use:

`
npm install gpf-js --save
`

Then, in your code, you can access the release version with:

```javascript
var gpf = require("gpf-js");
```

Or the debug version with:

```javascript
var gpf = require("gpf-js/debug");
```

## [Rhino](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino)

Use [load](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino/Shell#load.28.5Bfilename.2C_....5D.29)

```javascript
load("./gpf.js");
// use gpf namespace
```

## [PhantomJS](http://phantomjs.org/)

```javascript
require("./gpf.js");
// use gpf namespace
```

or

```html
<script src="gpf.js"></script>
<script>
    // use gpf namespace
</script>
```

If you plan to use {@link gpf.http.request}, you may need to turn off security with
[--web-security=false](http://phantomjs.org/api/command-line.html)   

## Browsers

```html
<script src="gpf.js"></script>
<script>
    // use gpf namespace
</script>
```
