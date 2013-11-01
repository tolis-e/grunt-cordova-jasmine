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
    shell = require('shelljs'),
    url = require('url'),
    path = require('path'),
    Logger = require('./log-module').Logger,
    StringModule = require('./string-module').StringModule,

AntModule =
{
    build: function (options, callbacks)
    {
        var buildXML = options['-f'];
        if (!options || !grunt.file.isFile(buildXML))
        {
            Logger.error('AntModule: build: invalid options passed');
            callbacks.error();
            return;
        }

        var antCmd = 'ant ';
        for (var option in options)
        {
            antCmd = [antCmd, option, ' ', options[option], ' '].join('');
        }
        Logger.info(['AntModule: command: ', antCmd].join(''));

        var antCmdExec = shell.exec(antCmd, function (code, output) {
                if (code === 0)
                {
                    Logger.info('AntModule: build: was completed successfully');
                    callbacks.success();
                }
                else
                {
                    Logger.error('AntModule: build: error occured');
                    callbacks.error();
                }
            });
    }
};

if (typeof module !== undefined) {
    module.exports.AntModule = AntModule;
}
