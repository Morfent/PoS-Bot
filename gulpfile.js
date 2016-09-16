'use strict';

require('babel-core/register')();

const gulp = require('gulp');
const babel = require('gulp-babel');
const mocha = require('gulp-mocha');
const eslint = require('gulp-eslint');

gulp.task('build', () => {
	return gulp.src('src/**/*.js')
		.pipe(babel())
		.pipe(gulp.dest('dist'));
});

gulp.task('lint', () => {
	return gulp.src('src/**/*.js')
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('test', ['lint'], () => {
	return gulp.src('test/**/*.js')
		.pipe(mocha({
			reporter: 'spec'
		}))
		.on('error', console.error);
});
