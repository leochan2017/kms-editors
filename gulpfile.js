var gulp = require('gulp');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var notify = require('gulp-notify');
var tinylr = require('tiny-lr');
var server = tinylr();
var port = 35729;

var __SRC__ = {
  file: './src/',
  js: './src/js/*.js',
  css: './src/style/*.css',
  images: './src/style/**/*.png'
}

var __DST__ = './dist/kms-editors/';

gulp.task('css', function() {
  gulp.src(__SRC__.css)
    .pipe(minifycss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(__DST__))
    .pipe(notify('css task is finish'));
});


gulp.task('js', function() {
  gulp.src(__SRC__.js)
    .pipe(uglify())
    .on('error', function (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
    })
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(__DST__))
    .pipe(notify('js task is finish'));
});


gulp.task('images', function() {
  gulp.src(__SRC__.images)
    .pipe(gulp.dest(__DST__))
    .pipe(notify('images task is finish'));
});


gulp.task('clean', function() {
  gulp.src([__DST__], {
      read: false
    })
    .pipe(clean())
    .pipe(notify('clean task is finish'));
});


gulp.task('default', ['clean'], function() {
    gulp.start('css', 'js', 'images');
});


gulp.task('watch', function() {
    server.listen(port, function(err) {
        if (err) return console.log(err);

        gulp.watch(__SRC__.css, function() {
            gulp.run('css');
        });

        gulp.watch(__SRC__.js, function() {
            gulp.run('js');
        });
    });
});
