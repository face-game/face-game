/* lib/log.js
 * Originally created 9/29/2017 by Perry Naseck (DaAwesomeP)
 * https://github.com/DaAwesomeP/face-game
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
import config from 'config'
import bunyan from 'bunyan'

const logConfig = config.get('Log')

let log = bunyan.createLogger({
  name: 'face-game',
  stream: process.stdout,
  level: logConfig.level
})
log.req = log.child({
  component: 'req',
  level: logConfig.requestsLevel,
  serializers: bunyan.stdSerializers
})

export default log
