# Testing the library

For HTTP access, you must first run `grunt serve`.
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
        * `grunt mocha`
        * `grunt mocha:source`
        * `grunt mocha:debug`
        * `grunt mocha:release`
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

# Selenium drivers

To enable browser automation with [Selenium](http://www.seleniumhq.org/), a driver must be installed for most browsers.
It is recommended to put them in the current [PATH](https://en.wikipedia.org/wiki/PATH_%28variable%29).

## Google Chrome

[Chrome driver](https://sites.google.com/a/chromium.org/chromedriver/downloads)

## FireFox

No driver is required

## Opera

Use chrome driver and set the following option in `tmp/selenium-opera.json`:

```JavaScript
{
    "setOperaBinaryPath": "path\\to\\opera.exe"
}
```

## Microsoft Edge

[Microsoft WebDriver](https://www.microsoft.com/en-us/download/details.aspx?id=48212)

## Microsoft Internet Explorer

[IE Driver Server](https://selenium-release.storage.googleapis.com/2.52/IEDriverServer_x64_2.52.2.zip)
