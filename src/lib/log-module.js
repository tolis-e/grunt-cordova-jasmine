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
    Logger = {
        info: function (msg) {
            if (msg)
            {
                grunt.log.writeln(['[INFO]', ' ', msg].join(''));
            }
            return this;
        },
        error: function (msg) {
            if (msg)
            {
                grunt.log.error(['[ERROR]', ' ', msg].join(''));
            }
            return this;
        },
        warn: function (msg) {
            if (msg)
            {
                grunt.log.error(['[WARN]', ' ', msg].join(''));
            }
            return this;
        },
        log: function (msg) {
            if  (msg)
            {
                grunt.log.writeln(msg);
            }
            return this;
        }
    };

if (typeof module !== undefined) {
    module.exports.Logger = Logger;
}
