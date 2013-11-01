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
    path = require('path'),
    FileModule = require('../../lib/file-module').FileModule,
    Logger = require('../../lib/log-module').Logger,
    StringModule = require('../../lib/string-module').StringModule,
    plugman = require('plugman'),

CordovaModule =
{
    createProject: function (options, callbacks)
    {
        // options should contain name, path, package, cordova-lib-location
        var projectPath = options['path'],
            projectName = options['name'],
            projectPackage = options['package'],
            cordovaLibLocation = options['cordova-lib-location'],
            projectPathWithoutLastElement = projectPath.replace(projectPath.substr(projectPath.lastIndexOf('/')), '');
        
        if (!grunt.file.isDir(projectPathWithoutLastElement))
        {
            Logger.info(['CordovaModule: createProject: Directory: \'', projectPathWithoutLastElement, '\' does not exist and will be created.'].join(''));
            grunt.file.mkdir(projectPathWithoutLastElement);
            if (!grunt.file.isDir(projectPathWithoutLastElement))
            {
                Logger.error(['CordovaModule: createProject: Directory: \'', projectPathWithoutLastElement, '\' could not be created.'].join(''));
                callbacks.error();
                return;
            }
        }

        projectPath = path.resolve(StringModule.endsWith(projectPath, '/') ? projectPath.slice(0, -1) : projectPath);
        cordovaLibLocation = path.resolve(StringModule.endsWith(cordovaLibLocation, '/') ? cordovaLibLocation.slice(0, -1) : cordovaLibLocation);
        if (!projectPath || !grunt.file.isDir(cordovaLibLocation) || !projectName || !projectPackage)
        {
            Logger.error(['CordovaModule: createProject: invalid option in',
                            ' project path:',
                            projectPath,
                            ' name: ',
                            projectName,
                            ' package: ',
                            projectPackage,
                            ' cordova lib: ',
                            cordovaLibLocation
                        ].join(''));
            callbacks.error();
            return;
        }
        var createProjectCmd = [ 'chmod +x ',
                                 cordovaLibLocation,
                                 '/bin/create && ',
                                 cordovaLibLocation,
                                 '/bin/create ',
                                 projectPath,
                                 ' ',
                                 projectPackage,
                                 ' ',
                                 projectName
                               ].join('');
        Logger.info(['CordovaModule: createProject: command: ', createProjectCmd].join(''));
        var createProjectExec = shell.exec(createProjectCmd, function (code, output) {
                if (code === 0)
                {
                    Logger.info('CordovaModule: createProject: was completed successfully');
                    callbacks.success();
                }
                else
                {
                    Logger.error('CordovaModule: createProject: error occured');
                    callbacks.error();
                }
            });
    },
    installPlugin: function (options, callbacks) {
        var platform = options['platform'],
            project_dir = options['project_dir'],
            id = options['id'],
            plugins_dir = options['plugins_dir'];

        delete options['platform'];
        delete options['project_dir'];
        delete options['id'];
        delete options['plugins_dir'];

        Logger.info(['CordovaModule: installPlugin: plugins_dir: ', plugins_dir, ' plugin: ', id, ' project_dir: ', project_dir].join(''));

        // options might include:
        // subdir, cli_variables, www_dir

        if (!project_dir || !grunt.file.isDir(project_dir))
        {
            Logger.error(['CordovaModule: installPlugin: plugin path: ', project_dir, ' is invalid path' ].join(''));
            callbacks.error();
            return;
        }

        project_dir = path.resolve(StringModule.endsWith(project_dir, '/') ? project_dir.slice(0, -1) : project_dir);

        // delete android json & ios.json
        if (plugins_dir && StringModule.trim(plugins_dir) !== '' && grunt.file.isDir(plugins_dir))
        {
            var androidJSON = [path.resolve(StringModule.endsWith(plugins_dir, '/') ? plugins_dir.slice(0, -1) : plugins_dir), '/', 'android.json'].join(''),
                iosJSON = [path.resolve(StringModule.endsWith(plugins_dir, '/') ? plugins_dir.slice(0, -1) : plugins_dir), '/', 'ios.json'].join(''),
                deleteFileCallbacks = {
                    success: function () {
                        Logger.info('CordovaModule: installPlugin: plugman [android.json|ios.json] file deletion completed');
                    },
                    error: function () {
                        Logger.error('CordovaModule: installPlugin: plugman android.json, ios.json file deletion failed');
                        callbacks.error();
                        return;
                    }
                };

            if (grunt.file.isFile(androidJSON))
            {
                FileModule.deleteFile(androidJSON, deleteFileCallbacks);
            }
            if (grunt.file.isFile(iosJSON))
            {
                FileModule.deleteFile(iosJSON, deleteFileCallbacks);
            }
        }

        if (!platform || !grunt.file.isDir(project_dir))
        {
            Logger.error(['CordovaModule: installPlugin: invalid option in',
                            ' platform:',
                            platform,
                            ' project_dir: ',
                            project_dir
                        ].join(''));
            callbacks.error();
            return;
        }
        var plugmanCallback = function (err) {
            if (err)
            {
                Logger.error(['CordovaModule: installPlugin: error: ', err].join(''));
                callbacks.error();
                return;
            }
            else
            {
                Logger.info('CordovaModule: installPlugin: plugin was successfully installed');
                callbacks.success();
                return;
            }
        };
        plugman.install(platform, project_dir, id, plugins_dir, options, plugmanCallback);
    }
};

if (typeof module !== undefined) {
    module.exports.CordovaModule = CordovaModule;
}
