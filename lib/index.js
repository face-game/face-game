/* lib/index.js
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

import { EventEmitter } from 'events'

import log from './log'
import HTTP from './http'
import GitHub from './github'

export default class App extends EventEmitter {
  constructor () {
    super()
    log.info('starting app')
    let vm = this; // necessary semicolon for next self-run async

    (async () => {
      vm.github = new GitHub()
      vm.http = new HTTP(process.env.PORT, vm.github)
    })()

    process.once('SIGINT', (signal) => vm.end(signal, vm)) // Normal Ctrl+C exit
    process.once('SIGUSR2', (signal) => vm.end(signal, vm)) // Nodemon restart
    process.on('exit', (signal) => vm.end(signal, vm)) // App killing itself
  }

  async end (signal, vm = this) {
    log.info('received exit signal')

    try {
      log.info('all cleaned up! closing...')
      vm.emit('closed')
      process.kill(process.pid, signal)
    } catch (err) {
      console.error(err)
    }
  }
}
