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
var StringModule =
{
    trim: function (val)
    {
        return val ?  String(val).replace(/^\s+|\s+$/g,'') : val;
    },
    endsWith: function (str, suffix)
    {
        return String(str).indexOf(suffix, str.length - suffix.length) !== -1;
    }
};

if (typeof module !== undefined) {
    module.exports.StringModule = StringModule;
}
