/*
  This file is part of the Jasmine JSReporter project from Ivan De Marino.

  Copyright (C) 2011 Ivan De Marino (aka detro, aka detronizator), http://blog.ivandemarino.me, ivan.de.marino@gmail.com

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL IVAN DE MARINO BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*
Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
(function () {
    // Ensure that Jasmine library is loaded first
    if (!jasmine) {
        console.log('>>Jasmine Suite ERROR [Jasmine library is not loaded]<<');
    }

    /**
     * Calculate elapsed time, in Seconds.
     * @param startMs Start time in Milliseconds
     * @param finishMs Finish time in Milliseconds
     * @return Elapsed time in Seconds */
    function elapsedSec (startMs, finishMs) {
        return (finishMs - startMs) / 1000;
    }

    var JSReporter =  function () {};

    JSReporter.prototype = {
        reportRunnerStarting: function (runner) {
            // Attach results to the "jasmine" object to make those results easy to scrap/find
            jasmine.runnerResults = {
                failures: [],
                durationSec : 0,
                passed : true,
                total: 0,
                failed: 0,
                date: ''
            };
        },

        reportSpecStarting: function (spec) {
            // Start timing this spec
            spec.startedAt = new Date();
        },

        reportSpecResults: function (spec) {
            // Finish timing this spec and calculate duration/delta (in sec)
            spec.finishedAt = new Date();
            spec.durationSec = elapsedSec(spec.startedAt.getTime(), spec.finishedAt.getTime());
            jasmine.runnerResults.date = spec.finishedAt;
            jasmine.runnerResults.durationSec += spec.durationSec;
            jasmine.runnerResults.total++;
            var results = spec.results();
            var failed = !(results.passed());
            if (failed) {
                var failure = {spec:spec.getFullName(),assertions:[]};
                jasmine.runnerResults.failed++;
                var items = results.getItems();
                for (var i = 0, l = items.length; i < l; i++) {
                    var item = items[i];
                    if (!item.passed_) {
                        failure.assertions.push({exception:item.message,trace:(item.trace && item.trace.stack ? item.trace.stack : "")});
                    }
                }
                jasmine.runnerResults.failures.push(failure);
            }
        },

        reportSuiteResults: function (suite) {
            // Nothing to do
        },

        reportRunnerResults: function (runner) {

            this.markSuiteAsStarted();

            this.log({
                results:jasmine.runnerResults
            });

            this.markSuiteAsFinished();
        },
        log: function(json) {
            console.log(JSON.stringify(json));
        },
        markSuiteAsStarted: function () {
            console.log('>>Jasmine Suite Started<<');
        },
        markSuiteAsFinished: function () {
            console.log('>>Jasmine Suite Finished<<');
        }
    };

    // export public
    jasmine.JSReporter = JSReporter;
})();
