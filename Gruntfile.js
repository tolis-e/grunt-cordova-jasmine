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
        /*
        grunt_cordova_jasmine: {
            jasmine: [{
                id: "jasmine-tests-1",
                project: {
                    android: {
                        targetDir: "./temp/projects/cordova-android",
                        name: "CordovaAndroid",
                        package_name: "org.example.cordova.android",
                        sdk: 'android-18',
                        cordova_version: "3.1.0"
                    },
                    iOS: {
                        targetDir: "./temp/projects/cordova-ios",
                        name: "CordovaIOS",
                        package_name: "org.example.cordova.ios",
                        cordova_version: "3.0.0"
                    }
                },
                plugin_test: {
                    targetDir: "./temp/plugins",
                    testsDir: "../aerogear-pushplugin-cordova/tests",
                    testsuite: "index.html",
                    plugin: '../aerogear-pushplugin-cordova'
                },
                platforms: ["android"],
                device_ids: {
                    android: ["emulator-5554", "emulator-5558"]
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
        },*/
        jshint: {
            all: {
                src: [ "Gruntfile.js", "src/**/*.js", "tasks/*.js" ],
                options: {
                    jshintrc: ".jshintrc"
                }
            }
        }
    });
   
    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.registerTask('default', ['jshint']);
};
