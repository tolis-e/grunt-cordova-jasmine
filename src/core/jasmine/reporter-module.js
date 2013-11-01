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
    Logger = require('../../lib/log-module').Logger,
    jasmineResults = jasmineResults || {};

module.exports.JasmineResultsReporterModule =
{
    put: function (id, obj)
    {
        jasmineResults[id] = obj;
    },
    get: function (id)
    {
        return jasmineResults[id];
    },
    getSize: function () {
        return Object.keys(jasmineResults).length;
    },
    report: function (callbacks)
    {
        var total = 0, failed = 0, errors = 0;
        Logger.log('==============================================================');
        for (var deviceId in jasmineResults)
        {
            var results = jasmineResults[deviceId].results;
            total += results.total;
            failed += results.failed;
            errors = errors + !results.passed ? 1 : 0;

            if (results.total <= 1)
            {
                errors++;
                results.errorMsg = 'No tests were executed for this Jasmine Test Suite';
            }

            Logger.log('-------------------------------------')
                  .log(['Jasmine results for device: \'', deviceId, '\' platform: \'', results.platform, '\' '].join(''))
                  .log(['Date: \'', results.date, '\' Passed: \'', results.passed,'\', Duration (sec): \'', results.durationSec, '\' Total Specs: \'', results.total, '\' Failed Specs: \'', results.failed, '\' '].join(''));
            if (results.failures && results.failed > 0)
            {
                Logger.error(JSON.stringify(results.failures));
            }
            if (results.total <= 1)
            {
                Logger.error(results.errorMsg);
            }
            Logger.log('-------------------------------------');
        }
        Logger.log('==============================================================');
        Logger.log(['TOTAL SPECS: ', total, ' PASSED: ', (total-failed), ' FAILED: ', failed, ' ERRORS: ', errors].join(''));

        if (failed > 0 || errors > 0)
        {
            callbacks.error();
        }
        else
        {
            callbacks.success();
        }
    }
};
