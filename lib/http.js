/* lib/http.js
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
'use strict'

import logger from './log'

import express from 'express'
import cors from 'cors'
import uuidv4 from 'uuid/v4'
// import fetch from 'node-fetch'
// import git from 'simple-git/promise'
// import mkdirp from 'async-mkdirp'
// import fs from 'fs'
// import rimraf from 'rimraf'
// import { promisify } from 'util'
// const appendFile = promisify(fs.appendFile)
// const writeFile = promisify(fs.writeFile)
// const readFile = promisify(fs.readFile)

const log = logger.child({ component: 'http' })

export default class HTTP {
  constructor (port, github) {
    let vm = this
    vm.github = github
    vm.app = express()
    vm.app.use(cors())
    vm.app.use(express.json({
      limit: '10mb'
    }))
    vm.apiRouter = express.Router()
    vm.apiRouter.get('/0/wakeup', (req, res) => {
      res.json({ status: 200 })
    })
    vm.apiRouter.post('/0/submit', async function (req, res) {
      let data = req.body
      data.id = uuidv4()
      // data.shasum = crypto.createHash('sha1')
      // data.shasum.update(data.id)
      // data.shasum = data.shasum.digest('hex')

      try {
        let getRefReq = {
          owner: 'face-game',
          repo: 'face-game-content',
          ref: 'heads/master'
        }
        const getRefRes = await vm.github.octokit.gitdata.getReference(getRefReq)
        log.trace('getRefRes', getRefReq, getRefRes)

        data.baseSha = getRefRes.data.object.sha
        data.branch = `incoming-${data.id}`
        let newRefReq = {
          owner: 'face-game',
          repo: 'face-game-content',
          ref: `refs/heads/${data.branch}`,
          sha: data.baseSha
        }
        const newRefRes = await vm.github.octokit.gitdata.createReference(newRefReq)
        log.trace('newRefRes', newRefReq, newRefRes)

        // data.gitDir = `./git-tmp/${data.branch}`
        // data.gitFile = `${data.gitDir}/content.txt`
        // await mkdirp(data.gitDir)
        // data.list = await fetch('https://raw.githubusercontent.com/face-game/face-game-content/master/content.txt')
        let contentReq = {
          owner: 'face-game',
          repo: 'face-game-content',
          ref: `refs/heads/${data.branch}`,
          path: 'content.txt'
        }
        const contentRes = await vm.github.octokit.repos.getContent(contentReq)
        log.trace('contentRes', contentReq, contentRes)

        data.content = ''
        if (contentRes.data.hasOwnProperty('content')) {
          data.content = Buffer.from(contentRes.data.content, 'base64')
        }
        // if (data.list.status >= 200 && data.list.status < 400) {
        //   await writeFile(data.gitFile, data.list.body)
        //   data.content = data.list.body
        // }
        data.content += data.id

        // for (let img of data.images) {
        //   await mkdirp(`${data.gitDir}/level-${img.level}/`)
        //   await writeFile(
        //     `${data.gitDir}/level-${img.level}/${data.id}.png`,
        //     img.img.substring(22),
        //     'base64'
        //   )
        // }
        // data.git = await git(data.gitDir)
        // await data.git.init()
        // await data.git.addConfig('user.name', 'face-game-bot')
        // await data.git.addConfig('user.email', 'face-game-bot@users.noreply.github.com')
        // await data.git.checkoutLocalBranch(data.branch)
        // await data.git.add('content.txt')
        // for (let img of data.images) await data.git.add(`level-${img.level}/${data.id}.png`)
        // await data.git.commit(`created: ${new Date(data.created).toString()}`)
        // await data.git.addRemote('origin', `https://face-game-bot:${process.env.GITHUB_TOKEN}@github.com/face-game/face-game-content.git`)
        // await data.git.push(['origin', `incoming-${data.id}`, '-f'])

        let gitFileReq = {
          owner: 'face-game',
          repo: 'face-game-content',
          path: 'content.txt',
          message: `created: ${new Date(data.created).toString()}`,
          content: Buffer.from(data.content).toString('base64'),
          branch: data.branch
        }
        // if (data.list.status >= 200 && data.list.status < 400) {
        if (contentRes.data.hasOwnProperty('content')) {
          gitFileReq.sha = contentRes.data.sha
          const gitFileRes = await vm.github.octokit.repos.updateFile(gitFileReq)
          log.trace('fileRes', gitFileReq, gitFileRes)
        } else {
          const gitFileRes = await vm.github.octokit.repos.createFile(gitFileReq)
          log.trace('fileRes', gitFileReq, gitFileRes)
        }

        // rimraf(data.gitDir)

        for (let img of data.images) {
          let fileReq = {
            owner: 'face-game',
            repo: 'face-game-content',
            path: `level-${img.level}/${data.id}.png`,
            message: `created: ${new Date(data.created).toString()}`,
            content: img.img.substring(22),
            branch: data.branch
          }
          const fileRes = await vm.github.octokit.repos.createFile(fileReq)
          log.trace('fileRes', fileRes)
        }

        let pullReq = {
          owner: 'face-game',
          repo: 'face-game-content',
          title: `[new content] ${new Date(data.created).toString()} ${data.id}`,
          head: data.branch,
          base: 'master',
          body: `created: ${new Date(data.created).toString()}`,
          maintainer_can_modify: true
        }
        const pullRes = await vm.github.octokit.pullRequests.create(pullReq)
        log.trace('pullRes', pullReq, pullRes)
      } catch (err) {
        log.error(err)
      }

      res.json({ status: 200 })
    })
    vm.app.use('/api', vm.apiRouter)
    vm.app.use((req, res) => {
      res.redirect('https://face-game.github.io/')
    })
    vm.app.use((err, req, res, next) => {
      log.error('express error', err)
      res.status(500).send('Server error')
    })
    vm.server = vm.app.listen(port)
    log.debug('http: server running')
  }
}
