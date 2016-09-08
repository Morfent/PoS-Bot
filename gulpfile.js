'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const mocha = require('mocha');
const chai = require('chai');
const eslint = require('eslint');

gulp.task('build', () =>
	gulp.src('src/**/*.js')
		.pipe(babel())
		.pipe(gulp.dest('dist'))
);
