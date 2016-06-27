'use strict';

var gulp = require('gulp');
var fs   = require('fs');
var $    = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'run-sequence', 'chokidar', 'path']
});

var config = {
    in: {
        file: 'style.less',
        less: [
            'src/less/*.less',
            'src/less/**/*.less'
        ]
    },
    out: {
        folder: 'src/css',
        file: 'style.css'
    },
    build: {
        folder: 'dist',
        file: 'jCal.css'
    }
};

// Compile LESS
gulp.task('less', function () {
    return gulp.src(config.in.less)
        .pipe($.concat(config.in.file))
        .pipe($.less())
        .on('error', $.notify.onError(function (error) {
            return '\nError! Look in the console for details.\n' + error;
        }))
        .pipe($.rename(config.out.file))
        .pipe(gulp.dest(config.out.folder));     
});

//  Watching less files
gulp.task('watch', function() {
    $.chokidar.watch(config.in.less, {
        ignored: '',
        persistent: true,
        ignoreInitial: true
    }).on('all', function(event, path) {
        gulp.start('less');
    });
});

gulp.task('serve', function(cb) {
    $.runSequence(
        ['less', 'watch'],
        cb
    );
});
 
gulp.task('build:css', function() {
    return gulp.src(config.out.folder + '/' + config.out.file)
        .pipe($.rename(config.build.file))
        .pipe(gulp.dest(config.build.folder));
});

gulp.task('build:js', function() {
    return gulp.src('src/js/main.js')
        .pipe($.rename('jCal.js'))
        .pipe(gulp.dest(config.build.folder));
});

gulp.task('build', function(cb) {
    $.runSequence(
        'less',
        ['build:css', 'build:js']
    );
}); 

gulp.task('default', ['build']);