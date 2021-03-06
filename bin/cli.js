/* bin/cli.js
 * Originally created 9/29/2018 by Perry Naseck (DaAwesomeP)
 * https://github.com/face-game/face-game
 *
 * Copyright 2018-present Perry Naseck (DaAwesomeP)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

import isRoot from 'is-root'
import sourceMapSupport from 'source-map-support'
import App from '../lib'

if (process.env.NODE_ENV === 'development') sourceMapSupport.install()

// No root!
if (isRoot()) {
  console.error(new Error('Never run the website backend as root!'))
  process.exit(1)
} else {
  process.stdin.resume()
}

let app = new App() // eslint-disable-line no-unused-vars
