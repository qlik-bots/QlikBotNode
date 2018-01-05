module.exports = function (gulp, plugins) {
    return function () {
        gulp.src([
            'app/server/*.js',
            'app/server/**/*.js',
            'app/server/**/**/*.js',
            'app/server/**/**/**/*.js',
        ])
        .pipe(plugins.eslint({configFile: 'eslint.json'}))
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.format('junit', process.stdout))
        // .pipe(plugins.eslint.failAfterError());
        
    }
}