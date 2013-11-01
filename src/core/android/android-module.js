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
    StringModule = require('../../lib/string-module').StringModule,
    Logger = require('../../lib/log-module').Logger,
    path = require('path'),

AndroidModule =
{
    updateProject: function (options, callbacks)
    {
        Logger.info('AndroidModule: updateProject');
        
        var androidCmd = 'android update project ';
        for (var option in options)
        {
            androidCmd = [androidCmd, option, ' ', options[option], ' '].join('');
        }
        Logger.info(['AndroidModule: updateProject: command: ', androidCmd].join(''));
        var updateProjectExec = shell.exec(androidCmd, function(code, output) {
            if (code === 0)
            {
                Logger.info('AndroidModule: updateProject: completed successfully');
                callbacks.success();
            }
            else
            {
                Logger.error('AndroidModule: updateProject: failed');
                callbacks.error();
            }
       });
    },
    buildDebugAPK: function (options, callbacks)
    {
        Logger.info('AndroidModule: buildDebugAPK');
        
        if (!options || !options.project_dir || !grunt.file.isDir(options.project_dir))
        {
            Logger.error('AndroidModule: buildDebugAPK: validation error');
            callbacks.error();
            return;
        }

        
        var project_dir = path.resolve(options.project_dir),
            buildCmd = ['ant -f ',
                        project_dir,
                        '/',
                        'build.xml clean && ',
                        'ant -f ',
                        project_dir,
                        '/',
                        'build.xml debug'].join('');

        Logger.info(['AndroidModule: buildDebugAPK: command: ', buildCmd].join(''));
        var buildProjectExec = shell.exec(buildCmd, function(code, output) {
            if (code === 0)
            {
                Logger.info('AndroidModule: buildDebugAPK: completed successfully');
                callbacks.success();
            }
            else
            {
                Logger.error('AndroidModule: buildDebugAPK: failed');
                callbacks.error();
            }
       });
    }
};

if (typeof module !== undefined) {
    module.exports.AndroidModule = AndroidModule;
}
