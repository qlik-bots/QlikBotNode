const fs = require('fs')

module.exports = function (gulp, plugins) {
    return function () {
        gulp.src([
            'app/server/*.js',
            'app/server/**/*.js',
            'app/server/**/**/*.js',
            'app/server/**/**/**/*.js',
        ])
        .pipe(plugins.concat('files.md'))
        .pipe(plugins.jsdocToMarkdown())
        .on('error', function (err) {
          gutil.log('jsdoc2md failed:', err.message)
        })
        .pipe(gulp.dest('docs'))
    }
}