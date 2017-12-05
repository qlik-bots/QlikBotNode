module.exports = function (gulp, plugins, project) {
    return function () {
		return gulp.src([
			'./node_modules/bootstrap-v4-dev/dist/css/bootstrap.min.css',
			'./node_modules/bootstrap-v4-dev/dist/css/bootstrap-flex.min.css',
			'./node_modules/font-awesome/css/*',
			'./node_modules/font-awesome/fonts/*',
		])
		.pipe(gulp.dest( 'app/public/css/'))
	}
}