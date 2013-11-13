# grunt-cordova-jasmine [![NPM version](https://badge.fury.io/js/grunt-cordova-jasmine.png)](http://badge.fury.io/js/grunt-cordova-jasmine)
> This project contains a Grunt plugin which automates [Jasmine](http://pivotal.github.io/jasmine/) Test Suite execution for [Apache Cordova](http://cordova.apache.org/) plugins. _Currently only the **Android** part is implemented._

You can find a relevant video which depicts the execution procedure [here](http://vimeo.com/77935606).

## Getting Started
This plugin assumes that **Android SDK**, **Ant** and **Git** are already configured in the execution environment.

The plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-cordova-jasmine --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-cordova-jasmine');
```

## execute-jasmine-suite task
> This task configures the Cordova libraries, sets the given Cordova version, creates a Cordova project, installs the given plugin and executes the configured Jasmine test suite inside emulators and devices. You can execute the task by using:

_`execute-jasmine-suite:jasmine-suite-1`_ where jasmine-suite-1 is the jasmine id as shown below

```js
grunt.initConfig({
    grunt_cordova_jasmine: {
        jasmine: [{
            id: "jasmine-suite-1",
            project: {
                android: {
                    targetDir: "./temp/projects/cordova-android",
                    name: "CordovaAndroid",
                    package_name: "org.example.cordova.android",
                    sdk: 'android-18',
                    cordova_version: "3.0.0"
                }
            },
            plugin_test: {
                targetDir: "./temp/plugins",
                testsDir: "./tests",
                testsuite: "index.html",
                plugin: '../aerogear-pushplugin-cordova'
            },
            platforms: ["android"],
            device_ids: {
                android: [/*"emulator-5554", "emulator-5558"*/]
            }
        }],
        cordova_libs: {
            android: {
                path: '',
                git: {
                    url: "https://github.com/tolis-e/cordova-android.git",
                    targetDir: "./temp/cordova-libraries"
                }
            }
        }
    }
});
```
### Gruntfile Configuration

#### jasmine.id
Type: `String`  
Description: `A custom identifier which helps the plugin to read the correct configuration from the Gruntfile`  
Usage: [required]

#### jasmine.project.android.targetDir
Type: `String`  
Description: `Specifies the directory of the new Cordova Android project which is created by the plugin`  
Usage: [required]

#### jasmine.project.android.name
Type: `String`  
Description: `Specifies the main activity name`  
Usage: [required]

#### jasmine.project.android.package_name
Type: `String`
Description: `Specifies the project's package`  
Usage: [required]

#### jasmine.project.android.sdk
Type: `String`  
Description: `Specifies the target SDK`  
Usage: [optional]

#### jasmine.project.android.cordova_version
Type: `String`  
Description: `Specifies the Cordova version`  
Usage: [optional]  
_This plugin has been tested for Cordova versions >=3.0.0_

#### jasmine.plugin_test.targetDir
Type: `String`  
Description: `Specifies the directory to hold the fetched plugin`  
Usage: [required]

#### jasmine.plugin_test.testsDir
Type: `String`  
Description: `Specifies the directory which contains all the test resources (Jasmine Test Suite, JS libraries etc)`  
Usage: [required]

#### jasmine.plugin_test.testsuite
Type: `String`  
Description: `Specifies the Jasmine Test Suite which will be executed inside the emulators/devices`  
Usage: [required]

#### jasmine.plugin_test.plugin
Type: `String`  
Description: `Local path of the plugin which is under testing or the Cordova plugin's registry id`  
Usage: [required]

#### jasmine.cordova_libs.android.path
Type: `String`  
Description: `Local path of the cordova-android library`  
Usage: [optional]  
_If this setting is not provided, the cordova-android library will be cloned from GitHub_

#### jasmine.cordova_libs.android.git.url
Type: `String`  
Description: `GitHub URL of the repository which holds the cordova-android library`  
Usage: [optional]

#### jasmine.cordova_libs.android.git.targetDir
Type: `String`
Description: `The directory to hold the cloned cordova-android repository`  
Usage: [optional]  

If cordova_libs_android_path is defined, then cordova_libs.git.url && cordova_libs.git.targetDir settings are ignored. If all settings are empty then the proccess stops with a failure status.

#### jasmine.platforms
Type: `Array`  
Description: `Specifies the target platforms`  
_Currently only **android** is supported_

#### jasmine.device_ids.android
Type: `Array`  
Description: `Specifies the emulator/device serial numbers in which the Jasmine Suite should be executed.`  
_If it is empty, the tests will be executed inside all the available emulators/devices recognized during the process execution._

## Important Notes
The plugin expects that the Jasmine Test Suite contains the Jasmine HTML reporter.

```js
<script type="text/javascript" src="whatever/HtmlReporter.js"></script>
```

or

```js
<script type="text/javascript" src="whatever/jasmine-html.js"></script>
```

The Html reporter name should match one of the following regular expressions:

`jasmine([^>]*)html([^>]*)js` or `HtmlReporter([^>]*)js`

In addition the plugin searches for a Jasmine [addReporter](https://github.com/tolis-e/grunt-cordova-jasmine/blob/master/example/tests/index.html#L55) and adds a custom reporter after this line.

## Example
> The [example](https://github.com/tolis-e/grunt-cordova-jasmine/tree/master/example) folder contains a sample example which depicts how to use this plugin.

## Release History

### 0.1.0
*Released 01 November 2013*

* Initial release
