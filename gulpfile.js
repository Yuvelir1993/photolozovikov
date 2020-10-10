const gulp = require('gulp'),
    // removeHtmlComments = require('gulp-remove-html-comments'),
    stripComments = require('gulp-strip-comments'),
    watch = require('gulp-watch'),
    plumber = require('gulp-plumber'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    imageminWebp = require('imagemin-webp'),
    imageminPngquant = require('imagemin-pngquant'),
    imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    responsive = require('gulp-responsive'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    webp = require('gulp-webp'),
    php = require('gulp-connect-php'),
    reload = browserSync.reload;

const path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        php: 'build/php/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        php: 'src/php/**/*.php',
        js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/style/main.scss',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        php: 'src/php/**/*.php',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

const config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};

function fnBuildHTML ()
{
    return gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(stripComments()) //Удалим комментарии
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({ stream: true })); //И перезагрузим наш сервер для обновлений
}

function fnBuildPHP ()
{
    return gulp.src(path.src.php) //Выберем файлы по нужному пути
        // .pipe(stripComments()) //Удалим комментарии
        // .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.php)) //Выплюнем их в папку build
        .pipe(reload({ stream: true })); //И перезагрузим наш сервер для обновлений
}

function fnBuildJS ()
{
    return gulp.src(path.src.js) //Найдем наш main файл
        .pipe(plumber()) // Не пркращать выполнять 'watch' в случае синтаксической ошибки
        .pipe(rigger()) //Прогоним через rigger
        // .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        // .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({ stream: true })); //И перезагрузим сервер
}

function fnBuildStyle ()
{
    return gulp.src(path.src.style) //Выберем наш main.scss
        // .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass({ processImport: false })) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin({ processImport: false })) //Сожмем
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({ stream: true }));
}

function fnBuildFonts ()
{
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
}
// const extReplace = require("gulp-ext-replace");
// Simple task to convert png to webp
function fnBuildIMG ()
{
    // Now is ability to convert to webp
    const stream = gulp
        .src([path.src.img, '!src/img/index/phone/*.jpg'])
        .pipe(webp())
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(imagemin([
            imageminWebp({
                lossless: true,
                quality: 80,
                preset: 'photo',
                method: 6,
                autoFilter: true
            }),
            imagemin.gifsicle({ interlaced: true }),
            // imagemin.jpegtran({ progressive: true }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            }),
            imageminPngquant({ quality: '80' }),
            // imageminJpegRecompress({
            //     quality: 'medium',
            //     progressive: true,
            //     strip: true,
            //     min: 40,
            //     max: 70,
            // })
        ]))
        .pipe(gulp.dest(path.build.img)); //И бросим в build
    return stream;
}

var aImgResponsiveCommonConfig =
{
    // withoutEnlargement better set to true
    withoutEnlargement: false,
    strictMatchImages: false,
    quality: 77,
    progressive: true,
    compressionLevel: 6,
    withMetadata: false,
};

function fnBuildIMG_Responsive ()
{
    return gulp.src(['src/img/**/*.jpg', '!src/img/index/phone/*.jpg'])
        .pipe(responsive(
            {
                '**/*.jpg':
                    [{
                        rename:
                        {
                            // width: 1400,
                            // suffix: '-orig'
                            suffix: ''
                        }
                    },
                    {
                        width: 900,
                        rename:
                        {
                            suffix: '-900px'
                        }
                    },
                    {
                        width: 700,
                        rename:
                        {
                            suffix: '-700px'
                        }
                    },
                    {
                        // for mobile phones better use height for adequate quality
                        height: 550,
                        rename:
                        {
                            suffix: '-350px'
                        }
                    }]
            }, aImgResponsiveCommonConfig))
        .pipe(gulp.dest(path.build.img)); //И бросим в build
}

function fnBuildIMG_Responsive_Phone_Index ()
{
    return gulp.src(['src/img/index/phone/*.jpg'])
        .pipe(responsive(
            {
                '**/*.jpg':
                    [{
                        // for mobile phones better use height for adequate quality
                        height: 550,
                        rename:
                        {
                            // suffix: '-350px'
                            suffix: '-phone'
                        }
                    }]
            }, aImgResponsiveCommonConfig))
        .pipe(gulp.dest(path.build.img + 'index/phone/')); //И бросим в build
}

function watchChanges ()
{
    gulp.watch(path.watch.html, fnBuildHTML);
    gulp.watch(path.watch.php, fnBuildPHP);
    gulp.watch(path.watch.style, fnBuildStyle);
    gulp.watch(path.watch.js, fnBuildJS);
    gulp.watch(path.watch.img, fnBuildHTML);
    gulp.watch(path.watch.fonts, fnBuildHTML);
}

function clean (cb)
{
    return rimraf(path.clean, cb);
}

function webserver ()
{
    return browserSync(config);
}

gulp.task('html:build', fnBuildHTML);
gulp.task('php:build', fnBuildPHP);
gulp.task('js:build', fnBuildJS);
gulp.task('style:build', fnBuildStyle);
gulp.task('fonts:build', fnBuildFonts);
// check differences between both fnBuildIMG and fnBuildIMG_Responsive accordingly to the img's sizes and qualities afterall
gulp.task('images:build', fnBuildIMG);
gulp.task('images-responsive:build', fnBuildIMG_Responsive);
gulp.task('images-responsive-phone:build', fnBuildIMG_Responsive_Phone_Index);

var aBlockTaskNames = [
    'html:build',
    'php:build',
    'js:build',
    'style:build',
    'fonts:build',
    /* закомментил что бы занимало меньше времени */
    'images:build',
    'images-responsive:build',
    'images-responsive-phone:build'
];

gulp.task('clean', clean);
/* закомментил что бы занимало мнеьше времени */
gulp.task('build', gulp.series('clean', gulp.parallel(aBlockTaskNames)));
// gulp.task('build', gulp.parallel(aBlockTaskNames));
gulp.task('webserver', webserver);
gulp.task('watch', watchChanges);
gulp.task('default', gulp.series('build', gulp.parallel('webserver', 'watch')));