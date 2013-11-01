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
    fileSystem = require('fs'),
    Logger = require('./log-module').Logger,

FileModule =
{
    copyFile: function (source, target, callbacks)
    {
        if (!source || !target || !grunt.file.isFile(source))
        {
            Logger.error(['FileModule: copyFile: read: ', source, ' target: ', target, ' are invalid args'].join(''));
            callbacks.error();
            return;
        }

        var read = fileSystem.createReadStream(source);
        read.on("error", function (err) {
            Logger.error(['FileModule: copyFile: read: ', source, ' failed err:', err].join(''));
            callbacks.error();
            return;
        });
        var write = fileSystem.createWriteStream(target);
        write.on("error", function (err) {
            Logger.error(['FileModule: copyFile: write: ', target, ' failed err: ', err].join(''));
            callbacks.error();
            return;
        });
        write.on("close", function (c) {
            callbacks.success();
        });
        read.pipe(write);
    },
    replaceStrings: function (sourceFile, destinationFile, regExpValuePairs, callbacks)
    {
        fileSystem.readFile(sourceFile, 'utf-8', function (err, data) {
            if (err) {
                Logger.error(['FileModule: replace: readFile: err: \'', err, '\' sourceFile: \'', sourceFile, '\' destFile: \'', destinationFile, '\'.'].join(''));
                callbacks.error();
                return;
            }
            else
            {
                var result = data;
                for (var toBeReplaced in regExpValuePairs)
                {
                    result = result.replace((new RegExp(toBeReplaced,"g")), regExpValuePairs[toBeReplaced], 'utf-8');
                }

                fileSystem.writeFile(destinationFile, result, 'utf8', function (err) {
                    if (err)
                    {
                        Logger.error(['FileModule: replace: writeFile: err: \'', err, '\' sourceFile: \'', sourceFile, '\' destFile: \'', destinationFile, '\'.'].join(''));
                        callbacks.error();
                        return;
                    }
                    else
                    {
                        callbacks.success();
                    }
                });
            }
        });
    },
    deleteFile: function (filePath, callbacks)
    {
        if (!filePath || !grunt.file.isFile)
        {
            Logger.error(['FileModule: deleteFile: file: \'', filePath, '\' is not a file'].join(''));
            callbacks.error();
            return;
        }

        fileSystem.unlink(filePath, function (err) {
            if (err)
            {
                Logger.error(['FileModule: deleteFile: err: \'', err, '\' '].join(''));
                callbacks.error();
            }
            else
            {
                callbacks.success();
            }
        });
    }
};

if (typeof module !== undefined) {
    module.exports.FileModule = FileModule;
}
