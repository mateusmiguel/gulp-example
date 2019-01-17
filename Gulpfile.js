// chama os plugins e cria as variaveis
var gulp = require('gulp');
var clean = require('gulp-clean');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var cssnano = require('gulp-cssnano');
var autoprefixer = require('autoprefixer');
var mq4HoverShim = require('mq4-hover-shim');
var rimraf = require('rimraf').sync;
var browser = require('browser-sync');
var panini = require('panini');
var concat = require('gulp-concat');
var tinify = require('gulp-tinify');
var uglify = require('gulp-uglify');
var pump = require('pump');
var merge = require('merge-stream');

// Configura a porta do servidor
var port = process.env.SERVER_PORT || 8080;

// atribui o caminho da pasta para a variavel
var nodepath = 'node_modules/';

// Levanta o server para desenv
gulp.task('server', ['build'], function () {
  browser.init({
    server: './dist',
    port: port
  });
});

// fica 'olhando' os arquivos e quando tem alteraçao roda alguma task e dá reload no browser
gulp.task('watch', function () {
  gulp.watch('src/scss/**/*', ['compile-sass', browser.reload]);
  gulp.watch('src/html/pages/**/*', ['compile-html']);
  gulp.watch(['src/html/{layouts,includes,helpers,data}/**/*'], ['compile-html:reset', 'compile-html']);
  gulp.watch('src/images/**/*.+(png|jpg|jpeg|gif|svg|ico)', ['tinify-images']);
  gulp.watch('src/scripts/**/*.js', ['compile-scripts', browser.reload]);
});

// apaga a pasta 'dist'
gulp.task('clean', function () {
  rimraf('dist');
});

// Gera a pasta de imagens na dist, dentro de assets.
gulp.task('copy', function () {
  gulp.src(['./src/images/**/*']).pipe(gulp.dest('/dist/assets/img'));
});

// Configuracoes do sass
var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded',
  // Inclui o boostrap
  includePaths: [nodepath + 'bootstrap/scss/']
};

// Compila o sass
gulp.task('compile-sass', function () {
  var processors = [
    mq4HoverShim.postprocessorFor({
      hoverSelectorPrefix: '.bs-true-hover '
    }),
    autoprefixer({
      browsers: [
        "Chrome >= 45",
        "Firefox ESR",
        "Edge >= 12",
        "Explorer >= 10",
        "iOS >= 9",
        "Safari >= 9",
        "Android >= 4.4",
        "Opera >= 30"
      ]
    }),
  ];
  return gulp.src('./src/scss/app.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    // .pipe(cssnano())
    .pipe(gulp.dest('./dist/assets/css/'));
});

// 'compila' o html para a pasta dist
gulp.task('compile-html', function () {
  gulp.src('src/html/pages/**/*.html')
    .pipe(panini({
      root: 'src/html/pages/',
      layouts: 'src/html/layouts/',
      partials: 'src/html/includes/',
      helpers: 'src/html/helpers/',
      data: 'src/html/data/'
    }))
    .pipe(gulp.dest('dist'))
    .on('finish', browser.reload);
});

gulp.task('compile-html:reset', function (done) {
  panini.refresh();
  done();
});

// Copia os arquivos de vendors pra dist. os obrigatórios sao jquery, bootstrap e o popper. o resto é exemplo.
var vendors = ['jquery/dist', 'bootstrap/dist', 'popper.js/dist', 'slick-carousel', 'wowjs', 'jquery-mask-plugin'];
gulp.task('vendors', function () {
  return merge(vendors.map(function (vendor) {
    return gulp.src('node_modules/' + vendor + '/**/*')
      .pipe(gulp.dest('dist/vendors/' + vendor.replace(/\/.*/, '')));
  }));
});

// Compila os arquivos Js (scripts)
gulp.task('compile-scripts', function () {
  return gulp.src('src/scripts/**/*.js')
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('./dist/assets/js/'));

});

// Copia as imagens pra dist e minifica (se o tinify ou outro plugin de minificação estiver ativo)
gulp.task('tinify-images', function () {
  gulp.src('src/images/**/*.+(png|jpg|jpeg|gif|svg|ico)')
    // .pipe(tinify('chave do tinnypng aqui'))
    .pipe(gulp.dest('./dist/assets/img'));
});

// configura as tasks padrão e chama as tasks dentro do array.

gulp.task('build', ['clean', 'vendors', 'compile-sass', 'compile-html', 'compile-scripts', 'tinify-images']);
gulp.task('default', ['server', 'watch']);


// olha esse post sobre gulp que ajuda bem: https://medium.com/emanuelg-blog/s%C3%A9rie-escolha-automatizar-gulp-3469909c2ecc
