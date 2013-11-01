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

GitModule =
{
    clone: function (sourceURL, toDir, callbacks)
    {
        if (sourceURL && toDir)
        {
            toDir = path.resolve(toDir);
            var filename = url.parse(sourceURL).pathname.split('/').pop(),
                destinationFilePath = [toDir, '/', filename].join('').replace('.git', '');
            Logger.info(['GitModule: clone: \'', sourceURL, '\' inside: \'', toDir, '\' '].join(''));
            if (grunt.file.isDir(destinationFilePath))
            {
                Logger.info(['GitModule: clone: Folder: ', destinationFilePath, ' already exists. Clone procedure aborted.'].join(''));
                callbacks.success();
                return;
            }
            else
            {
                if (!grunt.file.isDir(toDir))
                {
                    Logger.info(['GitModule: clone: Directory: \'', toDir, '\' does not exist and will be created.'].join(''));
                    grunt.file.mkdir(toDir);
                    if (!grunt.file.isDir(toDir))
                    {
                        Logger.error(['GitModule: clone: Directory: \'', toDir, '\' was not created.'].join(''));
                        callbacks.error();
                        return;
                    }
                }
                var gitCloneCmd = ['git clone ', sourceURL, ' ', destinationFilePath].join(''),
                    gitCloneExec = shell.exec(gitCloneCmd, function (code, output) {
                        if (code === 0)
                        {
                            Logger.info('GitModule: clone: was completed successfully');
                            callbacks.success();
                        }
                        else
                        {
                            Logger.error('GitModule: clone: error occured');
                            callbacks.error();
                        }
                    });
            }
        }
    },
    forceUpdateReset: function (repoLocation, callbacks)
    {
        repoLocation = path.resolve(StringModule.endsWith(repoLocation, '/') ? repoLocation.slice(0, -1) : repoLocation);
        if (!grunt.file.isDir(repoLocation))
        {
            Logger.error(['GitModule: forceUpdateReset: repository location: ', repoLocation, ' is invalid'].join(''));
            callbacks.error();
            return;
        }
        var gitForceUpdateCmd = ['git --git-dir=',
                                 repoLocation,
                                 '/.git',
                                 ' --work-tree=',
                                 repoLocation,
                                 ' fetch --all && git --git-dir=',
                                 repoLocation,
                                 '/.git',
                                 ' --work-tree=',
                                 repoLocation,
                                 ' reset --hard origin/master'].join(''),
            gitForceUpdateExec = shell.exec(gitForceUpdateCmd, function (code, output) {
                if (code === 0)
                {
                    Logger.info('GitModule: updateRepository: was completed successfully');
                    callbacks.success();
                }
                else
                {
                    Logger.error('GitModule: updateRepository: error occured');
                    callbacks.error();
                }
            });
    },
    getLatestTagInBranches: function (repoLocation, callbacks)
    {
        repoLocation = path.resolve(StringModule.endsWith(repoLocation, '/') ? repoLocation.slice(0, -1) : repoLocation);
        if (!grunt.file.isDir(repoLocation))
        {
            Logger.error(['GitModule: getLatestTagInBranches: repository location: ', repoLocation, ' is invalid'].join(''));
            callbacks.error();
            return;
        }
        var tagFilter = function (index) {
                return index &&
                       StringModule.trim(index) !== '' &&
                       index.indexOf('git describe --tags') === -1;
            },
            gitFindLatestTagCmd = ['git --git-dir=',
                                    repoLocation,
                                    '/.git',
                                    ' --work-tree=',
                                    repoLocation,
                                    ' describe --tags `git --git-dir=',
                                    repoLocation,
                                    '/.git',
                                    ' --work-tree=',
                                    repoLocation,
                                    ' rev-list --tags --max-count=1`'].join(''),
            gitFindLatestTagExec = shell.exec(gitFindLatestTagCmd, function (code, output) {
                if (code === 0)
                {
                    var tag = output.split('\n').filter(tagFilter)[0];
                    Logger.info(['GitModule: getLatestTagInBranches: was completed successfully: latest tag: ', tag].join(''));
                    callbacks.success(tag);
                }
                else
                {
                    Logger.error('GitModule: getLatestTagInBranches: error occured');
                    callbacks.error();
                }
            });
    },
    checkoutTag: function (repoLocation, tag, callbacks)
    {
        repoLocation = path.resolve(StringModule.endsWith(repoLocation, '/') ? repoLocation.slice(0, -1) : repoLocation);
        if (!grunt.file.isDir(repoLocation) || !tag || StringModule.trim(tag) === '')
        {
            Logger.error(['GitModule: checkoutTag: repository location: ', repoLocation, ' or tag: ', tag,' is invalid'].join(''));
            callbacks.error();
            return;
        }
        var gitCheckoutTagCmd = ['git --git-dir=',
                                 repoLocation,
                                 '/.git',
                                 ' --work-tree=',
                                 repoLocation,
                                 ' checkout ',
                                 tag
                                ].join(''),
            gitCheckoutTagExec = shell.exec(gitCheckoutTagCmd, function (code, output) {
                if (code === 0 && /HEAD is now at/.test(output))
                {
                    Logger.info('GitModule: checkoutTag: was completed successfully');
                    callbacks.success(tag);
                }
                else
                {
                    Logger.error('GitModule: checkoutTag: error occured');
                    callbacks.error();
                }
            });
    }
};

if (typeof module !== undefined) {
    module.exports.GitModule = GitModule;
}
