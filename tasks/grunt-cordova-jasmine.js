/**
 * JBoss, Home of Professional Open Source
 * Copyright Red Hat, Inc., and individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = function (grunt) {
    'use strict';

    var GruntModule = require('../src/lib/grunt-module').GruntModule,
        StringModule = require('../src/lib/string-module').StringModule,
        Logger = require('../src/lib/log-module').Logger,
        AndroidDevicesModule = require('../src/core/android/devices-module').AndroidDevicesModule,
        GitModule = require('../src/lib/git-module').GitModule,
        path = require('path'),
        url = require('url'),
        shelljs = require('shelljs'),
        CordovaModule = require('../src/core/cordova/cordova-module').CordovaModule,
        AndroidModule = require('../src/core/android/android-module').AndroidModule,
        AntModule = require('../src/lib/ant-module').AntModule,
        FileModule = require('../src/lib/file-module').FileModule,
        Constants = require('../src/core/constants'),
        JasmineResultsReporter = require('../src/core/jasmine/reporter-module').JasmineResultsReporterModule;

    grunt.registerTask('identify-android-devices', 'Identify Android devices', function (id) {
        var done = this.async(),
            callbacks = {
                success: function (devices) {
                    Logger.info(['task: identify-android-devices: devices found: ', devices].join(''));
                    GruntModule.setOption('android_devices.serialnumbers', devices);
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };
        AndroidDevicesModule.getOnlineDevices(callbacks);
    });

    grunt.registerTask('execute-jasmine-suite', 'Execute a Jasmine Test suite on devices/emulators', function (id) {
        var jasmine_tests = GruntModule.getOption('grunt_cordova_jasmine.jasmine');

        if (!jasmine_tests || jasmine_tests.length < 1)
        {
            Logger.error('task: execute-jasmine-tests: jasmine configuration is missing in Gruntfile');
            return false;
        }

        for (var i = 0,jasmine_test; i<jasmine_tests.length; i++)
        {
            if (jasmine_tests[i] && jasmine_tests[i].id === id)
            {
                jasmine_test = jasmine_tests[i];
                break;
            }
        }
        
        if (!jasmine_test)
        {
            Logger.error(['task: execute-jasmine-test-suites: could not find id: \'', id, '\' '].join(''));
            return false;
        }
        else
        {
            var platforms = jasmine_test.platforms,
                isAndroidPlatform = platforms && platforms.indexOf(Constants.PLATFORM_ANDROID) >= 0,
                isiOSPlatform = platforms && platforms.indexOf(Constants.PLATFORM_IOS) >= 0,
                tasksArray = [];
            
            tasksArray.push(['setup-cordova-environment:', i].join(''));
            tasksArray.push(['force-update-cordova-libs:', i].join(''));
            tasksArray.push(['create-cordova-templates:', i].join(''));
            tasksArray.push(['install-cordova-plugin-to-projects:', i].join(''));
            tasksArray.push(['setup-jasmine-suite-in-cordova:', i].join(''));
            tasksArray.push(['build-cordova-projects:', i].join(''));
            
            if (isAndroidPlatform)
            {
                tasksArray.push('identify-android-devices');
                tasksArray.push(['deploy-and-report-jasmine-results:', i].join(''));
            }

            // TODO: iOS part
            
            if (tasksArray && tasksArray.length > 0)
            {
                grunt.task.run(tasksArray);
            }
        }
    });

    grunt.registerTask('deploy-and-report-jasmine-results', 'Deploy application and report Jasmine results', function (index) {

        var jasmine_test = GruntModule.getOption('grunt_cordova_jasmine.jasmine')[index],
            platforms = jasmine_test.platforms,
            isAndroidPlatform = platforms && platforms.indexOf(Constants.PLATFORM_ANDROID) >= 0,
            isiOSPlatform = platforms && platforms.indexOf(Constants.PLATFORM_IOS) >= 0,
            tasksArray = [],
            options = {},
            toReplaceRexExp = new RegExp(':', 'g');
        
        // TODO: iOS part
        if (isAndroidPlatform)
        {
            var onlineAndroidDevices = GruntModule.getOption('android_devices.serialnumbers');
            if (!onlineAndroidDevices || onlineAndroidDevices.length < 1)
            {
                Logger.error('task: deploy-and-report-jasmine-results: there are not online android devices/emulators');
                return false;
            }
            else
            {
                var device_ids = jasmine_test.device_ids,
                    android_device_ids = device_ids ? device_ids.android : undefined,
                    validAndroidDevices = [],
                    validAndroidDevicesIndex = 0;

                var androidTargetDir = jasmine_test.project.android.targetDir;
                    options = {};
                    options.apkPath = [path.resolve(StringModule.endsWith(androidTargetDir, '/') ? androidTargetDir.slice(0, -1) : androidTargetDir),
                                            '/',
                                            'bin',
                                            '/',
                                            jasmine_test.project.android.name,
                                            '-debug.apk'].join('');
                    options.activityName = jasmine_test.project.android.name;
                    options.id = jasmine_test.project.android.package_name;

                if (android_device_ids !== undefined && android_device_ids.length > 0)
                {
                    for (var i in android_device_ids)
                    {
                        var deviceId = android_device_ids[i];
                        if (onlineAndroidDevices.indexOf(deviceId) !== -1)
                        {
                            Logger.info(['task: deploy-and-report-jasmine-results: jasmine test execution scheduled for device: ', deviceId].join(''));
                            validAndroidDevices[validAndroidDevicesIndex++] = deviceId;
                        }
                        else
                        {
                            Logger.error(['task: deploy-and-report-jasmine-results: device is not online: ', deviceId].join(''));
                            return false;
                        }
                    }

                    if (validAndroidDevices && validAndroidDevices.length > 0)
                    {
                        for (var k in validAndroidDevices)
                        {
                            options.device = validAndroidDevices[k];
                            tasksArray.push(['deploy-apk-and-store-results:', JSON.stringify(options).replace(toReplaceRexExp, '!___!')].join(''));
                        }
                    }
                }
                else
                {
                    for (var d in onlineAndroidDevices)
                    {
                        options.device = onlineAndroidDevices[d];
                        tasksArray.push(['deploy-apk-and-store-results:', JSON.stringify(options).replace(toReplaceRexExp, '!___!')].join(''));
                    }
                }
            
                if (tasksArray && tasksArray.length > 0)
                {
                    tasksArray.push('report-jasmine-results');
                    grunt.task.run(tasksArray);
                }
                else
                {
                    Logger.error('task: deploy-and-store-jasmine-results: could not schedule jasmine test executions on devices');
                    return false;
                }
            }
        }
    });

    grunt.registerTask('report-jasmine-results', 'Reports jasmine results', function () {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };
        
        JasmineResultsReporter.report(callbacks);
    });

    grunt.registerTask('deploy-apk-and-store-results', 'Deploys an APK and waits for the jasmine results', function (options) {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };
        // grunt.option('force', true);
        options = JSON.parse(options.replace(new RegExp('!___!', 'g'), ':'));
        AndroidDevicesModule.deploy(options, callbacks);
    });
   
    grunt.registerTask('build-cordova-projects', 'Builds the Cordova projects', function (index) {
        var jasmine_test = GruntModule.getOption('grunt_cordova_jasmine.jasmine')[index],
            platforms = jasmine_test.platforms,
            isAndroidPlatform = platforms && platforms.indexOf(Constants.PLATFORM_ANDROID) >= 0,
            isiOSPlatform = platforms && platforms.indexOf(Constants.PLATFORM_IOS) >= 0,
            executionArray = [],
            toReplaceRexExp = new RegExp(':', 'g');

        if (isAndroidPlatform)
        {
            var options = {};
            options['project_dir'] = jasmine_test.project.android.targetDir;
            executionArray.push(['build-cordova-android-debug-apk:', JSON.stringify(options).replace(toReplaceRexExp, '!___!')].join(''));
        }
        // TODO: iOS part
        if (executionArray && executionArray.length > 0)
        {
            grunt.task.run(executionArray);
        }
    });

    grunt.registerTask('build-cordova-android-debug-apk', 'Builds a debug APK', function (options) {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };

        options = JSON.parse(options.replace(new RegExp('!___!', 'g'), ':'));
        AndroidModule.buildDebugAPK(options, callbacks);
    });
    
    grunt.registerTask('install-cordova-plugin-to-projects', 'Install a Cordova Plugin', function (index) {
        var jasmine_test = GruntModule.getOption('grunt_cordova_jasmine.jasmine')[index],
            plugin_test = jasmine_test ? jasmine_test.plugin_test : undefined,
            platforms = jasmine_test.platforms,
            isAndroidPlatform = platforms && platforms.indexOf(Constants.PLATFORM_ANDROID) >= 0,
            isiOSPlatform = platforms && platforms.indexOf(Constants.PLATFORM_IOS) >= 0,
            options = {};

        if (!jasmine_test || !plugin_test)
        {
            Logger.error('task: install-cordova-plugin: plugin configuration is missing in Gruntfile');
            return false;
        }
        else
        {
            var plugin = plugin_test.plugin,
                plugins_dir = plugin_test.targetDir;

            if (!plugin || StringModule.trim(plugin) === '' || !plugins_dir || StringModule.trim(plugins_dir) === '')
            {
                Logger.error(['task: install-cordova-plugin: plugin: ', plugin, ' and/or targetDir: ', plugins_dir, ' configuration in Gruntfile is wrong'].join(''));
                return false;
            }
        
            Logger.info('task: install-cordova-plugin: plugin configuration is present');
            
            var executionArray = [],
                toReplaceRexExp = new RegExp(':', 'g');

            options['plugins_dir'] = plugins_dir;
            options['id'] = plugin;

            if (isAndroidPlatform)
            {
                options['platform'] = 'android';
                options['project_dir'] = jasmine_test.project.android.targetDir;
                executionArray.push(['install-cordova-plugin:', JSON.stringify(options).replace(toReplaceRexExp, '!___!')].join(''));
            }

            if (isiOSPlatform)
            {
                options['platform'] = 'ios';
                options['project_dir'] = jasmine_test.project.iOS.targetDir;
                executionArray.push(['install-cordova-plugin:', JSON.stringify(options).replace(toReplaceRexExp, '!___!')].join(''));
            }
            
            if (executionArray && executionArray.length > 0)
            {
                grunt.task.run(executionArray);
            }
        }
    });

    grunt.registerTask('install-cordova-plugin', 'Install a cordova plugin', function (options) {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };
        CordovaModule.installPlugin(JSON.parse(options.replace(new RegExp('!___!', 'g'), ':')), callbacks);
    });

    grunt.registerTask('setup-jasmine-suite-in-cordova', 'Setup jasmine suite in cordova project', function (index) {
        var jasmine_test = GruntModule.getOption('grunt_cordova_jasmine.jasmine')[index],
            project = jasmine_test.project,
            platforms = jasmine_test.platforms,
            isAndroidPlatform = platforms && platforms.indexOf(Constants.PLATFORM_ANDROID) >= 0,
            isiOSPlatform = platforms && platforms.indexOf(Constants.PLATFORM_IOS) >= 0,
            executionArray = [],
            toReplaceRexExp = new RegExp(':', 'g'),
            options = {};

        if (isAndroidPlatform)
        {
            var android = project.android,
                androidTargetDir = android.targetDir,
                androidTargetDirAbsolutePath = path.resolve(StringModule.endsWith(androidTargetDir, '/') ? androidTargetDir.slice(0, -1) : androidTargetDir),
                activity = [androidTargetDirAbsolutePath, '/src/', android.package_name.replace(/\./g, '/'), '/',  android.name, '.java'].join(''),
                configXML = [androidTargetDirAbsolutePath, '/', 'res', '/', 'xml', '/', 'config.xml'].join(''),
                regExpValuePairs = {},
                testsDir = jasmine_test.plugin_test.testsDir,
                testsDirAbsolutePath = path.resolve(StringModule.endsWith(testsDir, '/') ? testsDir.slice(0, -1) : testsDir);

                if (!testsDir || !testsDirAbsolutePath || !grunt.file.isDir(testsDirAbsolutePath))
                {
                    Logger.error(['task:setup-jasmine-suite-in-cordova: tests directory: ', testsDir, ' does not exist'].join(''));
                    return false;
                }
                
                // copy testsDir in www
                var wwwTestsDir = [androidTargetDirAbsolutePath, '/assets/www/', testsDir.split('/').pop()].join('');
                shelljs.mkdir('-p', wwwTestsDir);
                shelljs.cp('-R', [testsDirAbsolutePath, '/*'].join(''), wwwTestsDir);

                // setup activity
                var wwwTestSuiteFile = [(StringModule.endsWith(testsDir, '/') ? testsDir.slice(0, -1) : testsDir).split('/').pop(), '/', jasmine_test.plugin_test.testsuite].join('');
                regExpValuePairs['index.html'] = wwwTestSuiteFile;
                options.sourceFile = activity;
                options.destFile = activity;
                options.regExpValuePairs = regExpValuePairs;
                executionArray.push(['modify-string-in-file:', JSON.stringify(options).replace(toReplaceRexExp, '!___!')].join(''));
                
                // setup config xml
                options.sourceFile = configXML;
                options.destFile = configXML;
                executionArray.push(['modify-string-in-file:', JSON.stringify(options).replace(toReplaceRexExp, '!___!')].join(''));

                // modify jasmine suite
                regExpValuePairs = {};
                options = {};
                var jasmineSuite = [androidTargetDirAbsolutePath, '/', 'assets', '/', 'www', '/', wwwTestSuiteFile].join('');
                if (!grunt.file.isFile(jasmineSuite))
                {
                    Logger.error(['task: setup-jasmine-suite-in-cordova: suite: ', jasmineSuite, ' does not exist'].join(''));
                    return false;
                }
                
                // add custom reporter
                var suitefsLevel = jasmine_test.plugin_test.testsuite.split('/'),
                    levels = './../';
                for (var k=0; k < suitefsLevel.length-1; k++)
                {
                    levels = [levels, '../'].join('');
                }
                
                regExpValuePairs['jasmine([^>]*)html([^>]*)js">([^<]*)</script>'] = ['jasmine$1html$2js">$3</script>\n\t<script type=\"text/javascript\" src=\"', levels, 'jasmine-js-reporter.js' ,'\"></script>'].join('');
                
                regExpValuePairs['([^>]*)HtmlReporter([^>]*)js">([^<]*)</script>'] = ['$1HtmlReporter$2js">$3</script>\n\t<script type=\"text/javascript\" src=\"', levels, 'jasmine-js-reporter.js', '\"></script>'].join('');
                regExpValuePairs['([^;]*)addReporter([^;]*);'] = ['$1addReporter$2;', '\n\n\t\tvar jsReporter = new jasmine.JSReporter();\n\t\t$1addReporter(jsReporter);\n' ].join('');
                // fix cordova.js & cordova-android.js paths
                regExpValuePairs['\"([^"]*)cordova([^"]*)js\"'] = ['"', levels, 'cordova$2js', '"'].join('');

                options.sourceFile = jasmineSuite;
                options.destFile = jasmineSuite;
                options.regExpValuePairs = regExpValuePairs;
                executionArray.push(['modify-string-in-file:', JSON.stringify(options).replace(toReplaceRexExp, '!___!')].join(''));

                //options = {};
                options.sourceFile = [__dirname, '/../', 'src', '/', 'core', '/', 'jasmine', '/', 'jasmine-js-reporter.js'].join('');
                options.destFile = [androidTargetDirAbsolutePath, '/', 'assets', '/', 'www', '/', 'jasmine-js-reporter.js'].join('');
                shelljs.cp(options.sourceFile, options.destFile);
        }
        
        if (executionArray && executionArray.length > 0)
        {
            grunt.task.run(executionArray);
        }
    });

    grunt.registerTask('copy-file', 'Copy file', function (options) {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };

        options = JSON.parse(options.replace(new RegExp('!___!', 'g'), ':'));
        FileModule.copyFile(options.sourceFile, options.destFile, callbacks);
    });

    grunt.registerTask('modify-string-in-file', 'Modify String in file', function (options) {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };

        options = JSON.parse(options.replace(new RegExp('!___!', 'g'), ':'));
        FileModule.replaceStrings(options.sourceFile, options.destFile, options.regExpValuePairs , callbacks);
    });
 
    grunt.registerTask('create-cordova-templates', 'Create cordova template projects', function (index) {
        var jasmine_test = GruntModule.getOption('grunt_cordova_jasmine.jasmine')[index],
            project = jasmine_test.project,
            platforms = jasmine_test.platforms,
            isAndroidPlatform = platforms && platforms.indexOf(Constants.PLATFORM_ANDROID) >= 0,
            isiOSPlatform = platforms && platforms.indexOf(Constants.PLATFORM_IOS) >= 0;
        
        if (!project)
        {
            Logger.error('task: create-cordova-templates: project configuration is missing in Gruntfile');
            return false;
        }
        else
        {
            var cordova_android_path = GruntModule.getOption('grunt_cordova_jasmine.cordova_libs.android.path'),
                cordova_ios_path = GruntModule.getOption('grunt_cordova_jasmine.cordova_libs.iOS.path'),
                executionArray = [],
                toReplaceRexExp = new RegExp(':', 'g'),
                options = {};
                
                if (isAndroidPlatform)
                {
                    options = {};
                    var androidProjectCordovaVersion = project.android.cordova_version,
                        androidSDK = project.android.sdk,
                        androidTargetDir = path.resolve(project.android.targetDir);
                    options['name'] = project.android.name;
                    options['path'] = androidTargetDir;
                    options['package'] = project.android.package_name;
                    options['cordova-lib-location'] = cordova_android_path;

                    // checkout tag
                    if (androidProjectCordovaVersion && StringModule.trim(androidProjectCordovaVersion) !== '')
                    {
                        executionArray.push(['setup-cordova-version:', androidProjectCordovaVersion, ':', options['cordova-lib-location']].join(''));
                    }
                    // update cordova-lib android project
                    if (androidSDK && StringModule.trim(androidSDK) !== '')
                    {
                        var updateOptions = {};
                        updateOptions['-p'] = [cordova_android_path, '/', 'framework'].join('');
                        //updateOptions['-t'] = androidSDK;
                        executionArray.push(['update-android-project:', JSON.stringify(updateOptions).replace(toReplaceRexExp, '!___!')].join(''));
                       
                        var buildProjectOptions = {};
                        buildProjectOptions['-f'] = [cordova_android_path, '/', 'framework', '/', 'build.xml'].join('');
                        buildProjectOptions['jar'] = '';
                        executionArray.push(['build-ant-project:', JSON.stringify(buildProjectOptions).replace(toReplaceRexExp, '!___!')].join(''));
                    }
                    // create project
                    executionArray.push(['create-cordova-project:', JSON.stringify(options).replace(toReplaceRexExp, '!___!')].join(''));

                    // update new project
                    if (androidSDK && StringModule.trim(androidSDK) !== '')
                    {
                        var updateProjectOptions = {};
                        updateProjectOptions['-p'] = androidTargetDir;
                        updateProjectOptions['-t'] = androidSDK;
                        executionArray.push(['update-android-project:', JSON.stringify(updateProjectOptions).replace(toReplaceRexExp, '!___!')].join(''));
                    }
                }
                if (isiOSPlatform)
                {
                    options = {};
                    var iOSProjectCordovaVersion = project.iOS.cordova_version;
                    options['name'] = project.iOS.name;
                    options['path'] = project.iOS.targetDir;
                    options['package'] = project.iOS.package_name;
                    options['cordova-lib-location'] = cordova_ios_path;
                    // checkout tag
                    if (iOSProjectCordovaVersion && StringModule.trim(iOSProjectCordovaVersion) !== '')
                    {
                        executionArray.push(['setup-cordova-version:', iOSProjectCordovaVersion, ':', options['cordova-lib-location']].join(''));
                    }
                    // create project
                    executionArray.push(['create-cordova-project:', JSON.stringify(options).replace(toReplaceRexExp, '!___!')].join(''));
                }
                if (executionArray && executionArray.length > 0)
                {
                    grunt.task.run(executionArray);
                }
        }
    });
    
    grunt.registerTask('build-ant-project', 'Builds an Ant project', function (options) {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };
        AntModule.build(JSON.parse(options.replace(new RegExp('!___!', 'g'), ':')), callbacks);
    });

    grunt.registerTask('update-android-project', 'Update the Android project', function (options) {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };
        AndroidModule.updateProject(JSON.parse(options.replace(new RegExp('!___!', 'g'), ':')), callbacks);
    });

    grunt.registerTask('setup-cordova-version', 'Sets the cordova version', function (version, repoLocation) {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };
        GitModule.checkoutTag(repoLocation, version, callbacks);
    });

    grunt.registerTask('create-cordova-project', 'Create a Cordova project', function (options) {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };
        CordovaModule.createProject(JSON.parse(options.replace(new RegExp('!___!', 'g'), ':')), callbacks);
    });

    grunt.registerTask('force-update-cordova-libs', 'Force Update Cordova Lib Repositories', function (index) {
        var jasmine_test = GruntModule.getOption('grunt_cordova_jasmine.jasmine')[index],
            project = jasmine_test.project,
            platforms = jasmine_test.platforms,
            isAndroidPlatform = platforms && platforms.indexOf(Constants.PLATFORM_ANDROID) >= 0,
            isiOSPlatform = platforms && platforms.indexOf(Constants.PLATFORM_IOS) >= 0;
        
        if (!project)
        {
            Logger.error('task: force-update-cordova-libs: project configuration is missing in Gruntfile');
            return false;
        }
        else
        {
            var cordova_android_path = GruntModule.getOption('grunt_cordova_jasmine.cordova_libs.android.path'),
                cordova_ios_path = GruntModule.getOption('grunt_cordova_jasmine.cordova_libs.iOS.path'),
                executionArray = [];

            if (isAndroidPlatform && cordova_android_path)
            {
                executionArray.push(['fetch-reset-repo:', cordova_android_path].join(''));
            }
            if (isiOSPlatform && cordova_ios_path)
            {
                executionArray.push(['fetch-reset-repo:', cordova_ios_path].join(''));
            }
            if (executionArray && executionArray.length > 0)
            {
                grunt.task.run(executionArray);
            }
        }
    });

    grunt.registerTask('fetch-reset-repo', 'Fetch all and reset repository', function (project_path) {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };
        GitModule.forceUpdateReset(project_path, callbacks);
    });

    grunt.registerTask('setup-cordova-environment', function(index) {
        var cordova_libs = GruntModule.getOption('grunt_cordova_jasmine.cordova_libs'),
            android_lib = cordova_libs ? cordova_libs.android : undefined,
            ios_lib = cordova_libs ? cordova_libs.iOS : undefined,
            jasmine_test = GruntModule.getOption('grunt_cordova_jasmine.jasmine')[index],
            platforms = jasmine_test.platforms,
            isAndroidPlatform = platforms && platforms.indexOf(Constants.PLATFORM_ANDROID) >= 0,
            isiOSPlatform = platforms && platforms.indexOf(Constants.PLATFORM_IOS) >= 0;

        if (!platforms || (!isAndroidPlatform && !isiOSPlatform))
        {
            Logger.error('task: setup-cordova-environment: No platforms [Android|iOS] are defined in jasmine configuration in Gruntfile');
            return false;
        }
        else if (!cordova_libs || (!android_lib && isAndroidPlatform) || (!ios_lib && isiOSPlatform))
        {
            Logger.error('task: setup-cordova-environment: cordova_libs configuration android/iOS is missing in Gruntfile');
            return false;
        }
        else
        {
            var android_path = android_lib && android_lib.path && StringModule.trim(android_lib.path) !== '' ? path.resolve(android_lib.path) : undefined,
                ios_path = ios_lib && ios_lib.path && StringModule.trim(ios_lib.path) !== '' ? path.resolve(ios_lib.path) : undefined;
            if ((isAndroidPlatform && android_path && grunt.file.isDir(android_path)) && (isiOSPlatform && ios_path && grunt.file.isDir(ios_path)))
            {
                Logger.info(['task: setup-cordova-environment: cordova-android: \'', android_path, '\' cordova-ios: \'', ios_path, '\' '].join(''));
                return true;
            }
            else if ((isAndroidPlatform && android_path && grunt.file.isDir(android_path)) && !isiOSPlatform)
            {
                Logger.info(['task: setup-cordova-environment: cordova-android: \'', android_path, '\' '].join(''));
                return true;
            }
            else if ((isiOSPlatform && ios_path && grunt.file.isDir(ios_path)) && !isAndroidPlatform)
            {
                Logger.info(['task: setup-cordova-environment: cordova-ios: \'', ios_path, '\' '].join(''));
                return true;
            }
            else
            {
                Logger.info('task: setup-cordova-environment: cordova_libs paths configuration could not be found in Gruntfile. Trying to setup the cordova libraries automatically by using the url & target configuration.');
                var android_git = android_lib ? android_lib.git : undefined,
                    ios_git = ios_lib ? ios_lib.git : undefined,
                    iosPathExists = ios_path && grunt.file.isDir(ios_path),
                    androidPathExists = android_path && grunt.file.isDir(android_path);
                    
                if ((!androidPathExists && !android_git && isAndroidPlatform) || (!iosPathExists && !ios_git && isiOSPlatform))
                {
    
                    Logger.error('task: setup-cordova-enviroment: grunt_cordova_jasmine.cordova_libs.android.git or grunt_cordova_jasmine.cordova_libs.iOS.git configuration is missing in Gruntfile');
                    return false;
                }
                else
                {
                    var ios_git_url = ios_git ? ios_git.url: undefined,
                        android_git_url = android_git ? android_git.url : undefined,
                        ios_git_target = ios_git ? ios_git.targetDir : undefined,
                        android_git_target = android_git ? android_git.targetDir : undefined;

                    if (((!ios_git_url || !ios_git_target) && !iosPathExists && isiOSPlatform) || ((!android_git_url || !android_git_target) && !androidPathExists && isAndroidPlatform))
                    {
                        Logger.error('task: setup-cordova-environment: grunt_cordova_jasmine.cordova_libs.android.git or grunt_cordova_jasmine.cordova_libs.iOS.git configuration is missing in Gruntfile');
                        return false;
                    }
                    else
                    {
                        var executionArray = [],
                            toReplaceRegExp = new RegExp(':', 'g');

                        if (!androidPathExists && isAndroidPlatform)
                        {
                            var cordova_android_full_path  = [path.resolve(StringModule.endsWith(android_git_target, '/') ? android_git_target.slice(0, -1) : android_git_target), '/', url.parse(android_git_url).pathname.split('/').pop()].join('').replace('.git', '');
                            GruntModule.setOption('grunt_cordova_jasmine.cordova_libs.android.path', cordova_android_full_path);
                            executionArray.push(['git-clone-repo:', android_git_url.replace(toReplaceRegExp, '!___!'), ':', android_git_target].join(''));
                        }
                        if (!iosPathExists && isiOSPlatform)
                        {
                            var cordova_ios_full_path = [path.resolve(StringModule.endsWith(ios_git_target, '/') ? ios_git_target.slice(0, -1) : ios_git_target), '/', url.parse(ios_git_url).pathname.split('/').pop()].join('').replace('.git', '');
                            GruntModule.setOption('grunt_cordova_jasmine.cordova_libs.iOS.path', cordova_ios_full_path);
                            //GitModule.clone(ios_git_url, ios_git_target, gitCloneCallbacks);
                            executionArray.push(['git-clone-repo:', ios_git_url.replace(toReplaceRegExp, '!___!'), ':', ios_git_target].join(''));
                        }
                        if (executionArray && executionArray.length > 0)
                        {
                            grunt.task.run(executionArray);
                        }
                    }
                }
            }
        }
    });

    grunt.registerTask('git-clone-repo', 'Clones a git repository', function (sourceURL, targetDir) {
        var done = this.async(),
            callbacks = {
                success: function () {
                    done(true);
                },
                error: function () {
                    done(false);
                }
            };
        GitModule.clone(sourceURL.replace(new RegExp('!___!', 'g'), ':'), targetDir, callbacks);
    });
};
