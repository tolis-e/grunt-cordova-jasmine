/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
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
 * 
 */
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
var grunt = require('grunt'),
    shelljs = require('shelljs'),
    StringModule = require('../../lib/string-module').StringModule,
    Logger = require('../../lib/log-module').Logger,
    path = require('path'),
    JasmineResultsReporterModule = require('../jasmine/reporter-module').JasmineResultsReporterModule,

AndroidDevicesModule =
{
    getOnlineDevices: function (callbacks)
    {
        Logger.info('AndroidDevicesModule: getOnlineDevices');
        
        var onlineDeviceFilter = function (index) {
                return index &&
                       StringModule.trim(index) !== '' &&
                       index.indexOf('adb') === -1 &&
                       index.indexOf('daemon') === -1 &&
                       index.indexOf('attached') === -1 &&
                       index.indexOf('device') !== -1;
            },
            devicesCmd = ['adb devices'].join(''),
            devicesExec = shelljs.exec(devicesCmd, function (code, output) {
            if (code === 0)
            {
                Logger.info('AndroidDevicesModule: getOnlineDevices');
                var outputLines = output.split('\n'),
                    devices = outputLines.filter(onlineDeviceFilter),
                    deviceSerialNumbers = devices.map( function (device) { return device.split('\t')[0]; } );
                
                callbacks.success(deviceSerialNumbers);
            }
            else
            {
                Logger.error('AndroidDevicesModule: getOnlineDevices: failed to find devices');
                callbacks.error();
            }
       });
    },
    deploy: function (options, callbacks)
    {
        if (!options)
        {
            Logger.error('AndroidDevicesModule: deploy: empty options');
            callbacks.error();
            return;
        }
        else
        {
            var device = options.device,
                activity = options.activityName,
                apkPath = options.apkPath,
                id = options.id,
                cmd = ['adb -s ', device, ' uninstall ', id].join(''),
                uninstall = shelljs.exec (cmd, { silent: true, async: true }, function (code, uninstall_output) {
                    Logger.info(['AndroidDevicesModule: installing on device: ', device].join(''));
                    cmd = ['adb -s ', device, ' install -r ', apkPath].join('');
                    var install = shelljs.exec(cmd, { silent: true, async: true }, function (code, install_output) {
                        if (code > 0)
                        {
                            Logger.error(['AndroidDevicesModule: installing on device: ', device, ' FAILED'].join(''));
                            callbacks.error();
                            return;
                        }
                        else
                        {
                            shelljs.exec(['adb -s ', device, ' logcat -c'].join(''), { async: true }, function (code, clean_output) {
                                var logcat = grunt.util.spawn({
                                        cmd: 'adb',
                                        args: ['-s', device, 'logcat']
                                    }),
                                    timer = setTimeout( function () {
                                        Logger.error(['AndroidDeviceModule: jasmine suite did not finish in 2 min for device: ', device].join(''));
                                        logcat.kill();
                                        callbacks.error();
                                    }, 1000 * 60 * 2),
                                    activityStarted = false,
                                    suiteStarted = false,
                                    logcatOutput = '',
                                    listener = function (data) {
                                        if (activityStarted && (suiteStarted || />>Jasmine Suite Started<</.test(data)))
                                        {
                                            logcatOutput = [logcatOutput, data].join('');
                                            suiteStarted = true;
                                        }
                                        if (activityStarted && />>Jasmine Suite Finished<</.test(data))
                                        {
                                            clearTimeout(timer);
                                            var matches = logcatOutput.match(/({"results":{(.*)date([^\s]*)}})/),
                                                json = JSON.parse(matches[0]);
                                            json.results.platform = 'Android';
                                            JasmineResultsReporterModule.put(device, json);
                                            logcat.stdout.removeListener('data', listener);
                                            activityStarted = false;
                                            callbacks.success();
                                        }
                                    };

                                logcat.stdout.on('data', listener);

                                Logger.info(['AndroidDevicesModule: starting jasmine activity on device: ', device].join(''));
                                cmd = ['adb -s ', device, ' shell am start -n ', id, '/', id, '.', activity].join('');
                                Logger.info(['AndroidDevicesModule: starting jasmine activity cmd: ', cmd].join(''));
                                var start = shelljs.exec(cmd, { async: true }, function (code, run_output) {
                                    if (code > 0)
                                    {
                                        Logger.error(['AndroidDevicesModule: Error launching jasmine suite on device: ', device].join(''));
                                        callbacks.error();
                                        return;
                                    }
                                    else
                                    {
                                        Logger.info(['AndroidDevicesModule: jasmine suite launched on device :', device].join(''));
                                        activityStarted = true;
                                    }
                                });
                           });
                        }
                    });
                });
        }
    }
};

if (typeof module !== undefined) {
    module.exports.AndroidDevicesModule = AndroidDevicesModule;
}
