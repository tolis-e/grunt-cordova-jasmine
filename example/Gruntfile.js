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
module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
                    plugin: 'org.jboss.aerogear.cordova.push'
                },
                platforms: ["android"],
                device_ids: {
                    android: [/*'emulator-5556', 'emulator-5558'*/]
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
        },
        grunt_android_emulator: {
            emulators: [{
                id: 'emulator-1',
                create: {
                    '--name': 'device-1',
                    //'--sdcard': '10M',
                    //'--snapshot': '',
                    //'--path': 'avd',
                    '--force': '',
                    //'--skin': '',
                    '--target': 'android-18',
                    '--abi': 'armeabi-v7a'
                },
                start: {
                    '-port': '5556',
                    '-no-window': '',
                    '-no-audio': '',
                    //'-no-skin': ''
                }
            },{
                id: 'emulator-2',
                create: {
                    '--name': 'device-2',
                    //'--sdcard': '10M',
                    //'--snapshot': '',
                    //'--path': 'avd',
                    '--force': '',
                    //'--skin': '',
                    '--target': 'android-18',
                    '--abi': 'armeabi-v7a'
                },
                start: {
                    '-port': '5558',
                    '-no-window': '',
                    '-no-audio': '',
                    //'-no-skin': ''
                }
            }],
        },
        jshint: {
            all: {
                src: [ "Gruntfile.js"],
                options: {
                    jshintrc: "../.jshintrc"
                }
            }
        }
    });
   
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-android-emulator');
    grunt.loadNpmTasks('grunt-cordova-jasmine');
    grunt.registerTask('default', ['jshint', 'create-android-emulator:emulator-1', 'create-android-emulator:emulator-2', 'start-android-emulator:emulator-1', 'start-android-emulator:emulator-2', 'unlock-android-emulator:emulator-1', 'unlock-android-emulator:emulator-2', 'execute-jasmine-suite:jasmine-suite-1', 'stop-android-emulator:emulator-1', 'stop-android-emulator:emulator-2']);
};
