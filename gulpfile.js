// Declare Dependencies
const { src, dest, series, watch } = require('gulp');
const clean = require('del');
const zipFolder = require('zip-folder');
const uglify = require('uglify-js');
const cssMinify = require('gulp-clean-css');
const imageMinify = require('gulp-imagemin');
const htmlMinify = require('gulp-cleanhtml');
const jsonMinify = require('gulp-jsonminify');
const composer = require('gulp-uglify/composer');
const minify = composer(uglify, console);

// Prepare Directories
// processFolder - present working directory for this script
// jsonFileName - if reading a set of directories from package.json file e.g. packages.json > 'directories' object
// Note: Change 'jsonFile.directories' based on the json object that holds the list of directories

const processFolder = 'ktp-ui';
const jsonFileName = './package.json';
const jsonFile = require(jsonFileName);
let directories = JSON.parse(JSON.stringify(jsonFile.directories));
for (let ctr = 0; ctr < directories.length; ctr++){
    directories[ctr] = directories[ctr] + '/**/*';
}

const minifyOptions = {
    mangle: false,
    compress: {
      drop_console: true,
      unused: false
}};

// Copy Source Directories
function createWorkFolder(){
    src(jsonFileName).pipe(dest(processFolder));
    return src(directories, { "base" : './' })
		.pipe(dest(processFolder));
}
// Minify+Obfuscate JS Files
function processJS(){
	clean(processFolder + '/**/hotbuild.js', {force: true}); // this will removed all hotbuild.js files
    return src(processFolder + '/**/*.js')
        .pipe(minify(minifyOptions))     
        .pipe(dest(processFolder));
}

// Minify JSON Files
function processJSON(){
    return src(processFolder + '/**/*.json')
        .pipe(jsonMinify())
        .pipe(dest(processFolder));
}

// Minify CSS Files
function processCSS(){
    return src(processFolder + '/**/*.css')
        .pipe(cssMinify(), {level: 2})
        .pipe(dest(processFolder));
}

// Minify Image Files
function processIMG(){
    return src([processFolder + '/**/**/*.jpg',
        processFolder + '/**/**/*.svg',
        processFolder + '/**/**/*.png',
        processFolder + '/**/**/*.gif'])
        .pipe(imageMinify())
        .pipe(dest(processFolder));
}

// Minify HTML Files
function processHTML(){
    return src(processFolder + '/**/*.html')
        .pipe(htmlMinify({removeComments:true}))
        .pipe(dest(processFolder));
}

// Delete Existing Output Directory
function zipDirectories(callback){
    zipFolder(processFolder, processFolder + '.zip', function(err) {
        if(err) {
            console.log('Error zipping: ' + processFolder, err);
        } else {
            console.log('Successfully zipped: '+ processFolder);
            clean(processFolder, {force:true});
        }
    });
    callback();
}

// Default Gulp Build Process
const buildWorkFolder = series(processJS,processJSON,processCSS,processIMG,processHTML);
exports.default = series(createWorkFolder,buildWorkFolder,zipDirectories);

// Watch File Changes (rebuild every 15 minutes)
// function watchFiles(){
//     watch(['./**/*.js',
//             './**/*.css',
//             './**/*.html',
//             './**/*.json',
//             './**/*.jpg',
//             './**/*.svg',
//             './**/*.png',
//             './**/*.gif'],
//         {delay : 900000},
//         series(buildWorkFolder,zipDirectories,cleanWorkFolder));
// }