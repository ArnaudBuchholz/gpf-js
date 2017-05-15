## Testing the library

You must first run `grunt serve`.

Command lines must be run from the root of the gpf-js folder.

* With [mocha](https://mochajs.org/):
    * `http://localhost:8000/test/host/mocha/web.html`
    * `node test/host/mocha/nodejs.js`
* Without mocha:
    * `http://localhost:8000/test/host/web.html`
    * `node test/host/nodejs.js`
    * `phantomjs test/host/phantomjs.js`
    * `cscript /E:jscript test\host\cscript.js`
    * `java -jar node_modules\rhino-1_7r5-bin\rhino1_7R5\js.jar test\host\rhino.js`
* With [grunt](http://gruntjs.com/):
    * testing with PhantomJS (as a browser):
        * `grunt connectIf mocha`
        * `grunt connectIf mocha:source`
        * `grunt connectIf mocha:debug`
        * `grunt connectIf mocha:release`
    * testing with NodeJS:
        * `grunt mochaTest`
        * `grunt mochaTest:source`
        * `grunt mochaTest:debug`
        * `grunt mochaTest:release`
    * testing with cscript:
        * `grunt exec:testWscript`
        * `grunt exec:testWscriptVerbose` *(alias: `grunt wscript`)*
        * `grunt exec:testWscriptDebug`
        * `grunt exec:testWscriptRelease`
    * testing with rhino:
        * `grunt exec:testRhino`
        * `grunt exec:testRhinoVerbose` *(alias: `grunt rhino`)*
        * `grunt exec:testRhinoDebug`
        * `grunt exec:testRhinoRelease`
    * testing with browsers using [Selenium](http://www.seleniumhq.org/):
        * you must first run `node detectSelenium` to check drivers installation *(see below)*
        * `grunt firefox`
        * `grunt chrome`
        * `grunt ie`
        * `grunt safari`

## Selenium drivers

To enable browser automation with [Selenium](http://www.seleniumhq.org/), a driver must be installed for most browsers.
It is recommended to put them in the current [PATH](https://en.wikipedia.org/wiki/PATH_%28variable%29).

Please check
[selenium-webdriver documentation page](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html).

### Safari

[Safari 5.1.7 for Windows](http://appldnld.apple.com/Safari5/041-5487.20120509.INU8B/SafariSetup.exe)

## Command line browser testing

Coming with [version 0.1.7](http://gpf-js.blogspot.ca/2017/03/release-017.html), it is now possible to test a specific
browser using a command line.

There are several assumptions:
- The command line is
[spawned](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) with only
one parameter: the URL to open,
- The command line must remain active until the test is completed,
- When the test completes, the spawned process is closed with a
[SIGKILL](https://nodejs.org/api/process.html#process_signal_events) signal.

To configure the command line:
- Make sure to run `grunt` at least once: this will initialize the `tmp/config.json` file. 
- Open the `tmp/config.json` file, look for the `"browsers"` part
- For each browser you want to test, add a key with type=spawn and the binary path to the command line set in bin

For instance, Safari testing on Windows:

```javascript
    "browsers": {
        "chrome": {
            "type": "selenium"
        },
        "safari": {
            "type": "spawn",
            "bin": "C:\\Program Files (x86)\\Safari\\Safari.exe"
        }
    },
```
