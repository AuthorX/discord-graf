const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const exec = require('gulp-exec');
const eslint = require('gulp-eslint');
const esdoc = require('gulp-esdoc');
const del = require('del');

gulp.task('build', () =>
	gulp.src('src/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('lib'))
);

gulp.task('clean', () => del('lib/**'));

gulp.task('lint', () =>
	gulp.src('src/**/*.js')
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
);

gulp.task('rebuild', gulp.series('clean', 'build'));
gulp.task('default', gulp.parallel('lint', 'rebuild'));

gulp.task('docs', () =>
	gulp.src(['./src/**/*.js'])
		.pipe(esdoc())
);

gulp.task('publish', gulp.series('default', 'docs', () => {
	const version = require('./package.json').version;
	return gulp.src('.')
		.pipe(exec(`git commit -am "Prepare ${version} release"`))
		.pipe(exec(`git tag v${version}`))
		.pipe(exec(`git push origin : v${version}`))
		.pipe(exec('npm publish'));
}));
