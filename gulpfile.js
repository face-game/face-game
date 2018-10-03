/* gulpfile.js
 * Originally created 9/29/2017 by Perry Naseck (DaAwesomeP)
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
const gulp = require('gulp')
const del = require('del')
const lec = require('gulp-line-ending-corrector')
const babel = require('gulp-babel')
const eslint = require('gulp-eslint')
const sourcemaps = require('gulp-sourcemaps')
const nodemon = require('gulp-nodemon')

gulp.task('check', () => {
  return gulp.src(['lib/**/*.js', 'bin/**/*.js', 'public/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('checkSafe', () => {
  return gulp.src(['lib/**/*.js', 'bin/**/*.js', 'public/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
})

gulp.task('static', gulp.parallel(() => {
  return gulp.src('lib/**/*.js')
    .pipe(lec())
    .pipe(gulp.dest('lib'))
}, () => {
  return gulp.src('public/**/*.js')
    .pipe(lec())
    .pipe(gulp.dest('public'))
}))

gulp.task('clean', (callback) => {
  del(['dist/*']).then(() => {
    callback()
  })
})

gulp.task('compile', gulp.parallel(() => {
  return gulp.src('lib/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: [ ['@babel/env', { targets: { node: '8' } }] ] }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/lib'))
}, () => {
  return gulp.src(['lib/**/*', '!lib/**/*.js'])
    .pipe(gulp.dest('dist/lib'))
}, () => {
  return gulp.src('bin/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: [ ['@babel/env', { targets: { node: '8' } }] ] }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/bin'))
}, () => {
  return gulp.src(['bin/**/*', '!bin/**/*.js'])
    .pipe(gulp.dest('dist/bin'))
}, () => {
  return gulp.src('public/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: [ ['@babel/env', { targets: {
      chrome: '49',
      firefox: '52',
      ie: '11',
      safari: '9.1'
    } }] ] }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/public'))
}, () => {
  return gulp.src(['public/**/*', '!public/**/*.js'])
    .pipe(gulp.dest('dist/public'))
}, () => gulp.src(['node_modules/bootstrap/dist/css/**/*']).pipe(gulp.dest('dist/public/assets/css/bootstrap'))
, () => gulp.src(['node_modules/jquery/dist/**/*']).pipe(gulp.dest('dist/public/assets/js/jquery'))
, () => gulp.src(['node_modules/bootstrap/dist/js/**/*']).pipe(gulp.dest('dist/public/assets/js/bootstrap'))
, () => gulp.src(['node_modules/p5/lib/**/*']).pipe(gulp.dest('dist/public/assets/js/p5'))
, () => gulp.src(['node_modules/ml5/dist/**/*']).pipe(gulp.dest('dist/public/assets/js/ml5'))
))

gulp.task('dist', gulp.series('static', 'check', 'clean', 'compile'))
gulp.task('build', gulp.series('static', 'checkSafe', 'compile'))

gulp.task('watch', gulp.series('checkSafe', 'clean', 'compile', () => {
  return nodemon({
    exec: 'node --inspect=9229 -r dotenv/config dist/bin/cli.js | node ./node_modules/bunyan/bin/bunyan',
    ext: 'js json yml yaml html css scss sass less png jpg gif svg',
    ignore: [
      'dist/',
      'node_modules/'
    ],
    env: { NODE_ENV: 'development' },
    tasks: ['checkSafe', 'compile'],
    watch: ['lib', 'bin', 'config', 'public', 'package.json']
  })
}))
gulp.task('default', gulp.series('build'))
