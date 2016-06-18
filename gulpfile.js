'use strict';

var gulp  = require('gulp');
var $ = require('gulp-load-plugins')({
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
        folder: 'dist/css',
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
 
gulp.task('minify', function() {

});

gulp.task('build', function(cb) {
    $.runSequence(
        'less',
        'minify',
        cb
    );
}); 

gulp.task('default', ['build']);