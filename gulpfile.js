var path = require('path')
var gulp = require('gulp')
var standard = require('gulp-standard')
var excludeGitignore = require('gulp-exclude-gitignore')
var mocha = require('gulp-mocha')
var istanbul = require('gulp-istanbul')
var nsp = require('gulp-nsp')
var plumber = require('gulp-plumber')
// var coveralls = require('gulp-coveralls')
var codecov = require('gulp-codecov')
var babel = require('gulp-babel')
var del = require('del')
var isparta = require('isparta')

// Initialize the babel transpiler so ES2015 files gets compiled
// when they're loaded
require('babel-register')

gulp.task('static', function () {
  return gulp.src('lib/**/*.js')
    .pipe(excludeGitignore())
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: false,
      quiet: true
    }))
})

gulp.task('nsp', function (cb) {
  nsp({
    package: path.resolve('package.json')
  }, cb)
})

gulp.task('pre-test', function () {
  return gulp.src('lib/**/*.js')
    .pipe(excludeGitignore())
    .pipe(istanbul({
      includeUntested: true,
      instrumenter: isparta.Instrumenter
    }))
    .pipe(istanbul.hookRequire())
})

gulp.task('test', ['pre-test'], function (cb) {
  var mochaErr

  gulp.src('test/**/*.js')
    .pipe(plumber())
    .pipe(mocha({
      reporter: 'spec'
    }))
    .on('error', function (err) {
      mochaErr = err
    })
    .pipe(istanbul.writeReports())
    .on('end', function () {
      cb(mochaErr)
    })
})

gulp.task('watch', function () {
  gulp.watch(['lib/**/*.js', 'test/**'], ['test'])
})

gulp.task('codecov', ['test'], function () {
  return gulp.src('./coverage/lcov.info')
    .pipe(codecov())
})

gulp.task('babel', ['clean'], function () {
  return gulp.src('lib/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'))
})

gulp.task('clean', function () {
  return del('dist')
})

gulp.task('prepublish', ['nsp', 'babel'])
gulp.task('default', ['static', 'test', 'codecov'])
