module.exports = function (gulp, plugins, project) {
    return function () {
		return gulp.src([
			'./node_modules/domReady/src/ready.js',
			'./node_modules/tether/dist/js/tether.min.js',
			'./node_modules/jquery/dist/jquery.min.js',
			'./node_modules/angular/angular.min.js',
			'./node_modules/angular-animate/angular-animate.min.js',
			'./node_modules/angular-cookies/angular-cookies.min.js',
			'./node_modules/angular-ui-router/release/angular-ui-router.min.js',
			'./node_modules/bootstrap-v4-dev/dist/js/bootstrap.min.js'
		])
		.pipe(gulp.dest( 'app/public/js/vendor/')) // Save to	
	}
}