# gulp-imagemin

> Minify PNG, JPEG, GIF and SVG images with [`imagemin`](https://github.com/imagemin/imagemin)

> **This is a updated, maintained fork of [`gulp-imagemin`](https://github.com/sindresorhus/gulp-imagemin)**

*Issues with the output should be reported on the [`imagemin` issue tracker](https://github.com/imagemin/imagemin/issues).*

## Install

```
$ npm install --save-dev gulp-imagemin
```

### Prerequisites

1. [Binaries](#binary-prerequisites)
2. [Overrides](#override-prerequisites)

#### Binary Prerequisites
To install some binaries, prerequisites are required. Here are a few of the prerequisites for the plugins:

##### Macos
To install most plugins
```
$ brew install cmake autoconf automake libtool nasm zlib libimagequant
```
##### Linux
To install most plugins
```
$ sudo apt-get install autoconf automake libtool nasm zlib1g-dev
```

To install imagemin-pngquant
```
$ sudo apt-get install libpng-dev libimagequant-dev
```

#### Override Prerequisites

To cover security and functional issues exposed in older component dependencies still in the original `imagemin` ecosystem, the following overrides are required at the top level project's `package.json`:
```
  "overrides": {
    "download": "npm:@xhmikosr/downloader",
    "bin-wrapper": "npm:@xhmikosr/bin-wrapper",
    "bin-build": "npm:@localnerve/bin-build"
  }
```

## Usage

### Basic

```js
import gulp from 'gulp';
import imagemin from 'gulp-imagemin';

export default () => (
	gulp.src('src/images/*')
		.pipe(imagemin())
		.pipe(gulp.dest('dist/images'))
);
```

### Custom plugin options

```js
import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin';

// …
.pipe(imagemin([
	gifsicle({interlaced: true}),
	mozjpeg({quality: 75, progressive: true}),
	optipng({optimizationLevel: 5}),
	svgo({
		plugins: [
			{
				name: 'removeViewBox',
				active: true
			},
			{
				name: 'cleanupIds',
				active: false
			}
		]
	})
]))
// …
```

### Custom plugin options and custom `gulp-imagemin` options

```js
import imagemin, {svgo} from 'gulp-imagemin';

// …
.pipe(imagemin([
	svgo({
		plugins: [
			{
				name: 'removeViewBox',
				active: true
			}
		]
	})
], {
	verbose: true
}))
// …
```

## API

Comes bundled with the following optimizers:

- [gifsicle](https://github.com/imagemin/imagemin-gifsicle) — *Compress GIF images, lossless*
- [mozjpeg](https://github.com/imagemin/imagemin-mozjpeg) — *Compress JPEG images, lossy*
- [optipng](https://github.com/imagemin/imagemin-optipng) — *Compress PNG images, lossless*
- [svgo](https://github.com/imagemin/imagemin-svgo) — *Compress SVG images, lossless*

These are bundled for convenience and most users will not need anything else.

### imagemin(plugins?, options?)

Unsupported files are ignored.

#### plugins

Type: `Array`\
Default: `[gifsicle(), mozjpeg(), optipng(), svgo()]`

[Plugins](https://www.npmjs.com/browse/keyword/imageminplugin) to use. This will completely overwrite all the default plugins. So, if you want to use custom plugins and you need some of defaults too, then you should pass default plugins as well. Note that the default plugins come with good defaults and should be sufficient in most cases. See the individual plugins for supported options.

#### options

Type: `object`

##### verbose

Type: `boolean`\
Default: `false`

Enabling this will log info on every image passed to `gulp-imagemin`:

```
gulp-imagemin: ✔ image1.png (already optimized)
gulp-imagemin: ✔ image2.png (saved 91 B - 0.4%)
```

##### silent

Type: `boolean`\
Default: `false`

Don't log the number of images that have been minified.

You can also enable this from the command-line with the `--silent` flag if the option is not already specified.
