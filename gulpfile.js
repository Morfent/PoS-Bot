'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const mocha = require('mocha');
const chai = require('chai');
const eslint = require('eslint');

gulp.task('build', () =>
	gulp.src(__dirname + '/src/**/*.js')
		.pipe(babel())
		.pipe(gulp.dest(__dirname + '/dist'))
);
