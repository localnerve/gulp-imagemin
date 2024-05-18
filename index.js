import path from 'node:path';
import process from 'node:process';
import log from 'fancy-log';
import PluginError from 'plugin-error';
import through from 'through2-concurrent';
import prettyBytes from 'pretty-bytes';
import chalk from 'chalk';
import imagemin from 'imagemin';
import plur from 'plur';

const PLUGIN_NAME = 'gulp-imagemin';
const defaultPlugins = ['gifsicle', 'mozjpeg', 'optipng', 'svgo'];

async function loadPlugin(plugin, ...args) {
	let result;

	try {
		const imported = await import(`#${plugin}`);
		const factory = imported.default;
		result = factory(...args);
	} catch (error) {
		const message = `${PLUGIN_NAME}: Could not load default plugin \`${plugin}\`...\n  * ${error}`;
		log(message);
		result = Promise.reject(message);
	}

	return result;
}

function exposePlugin(plugin) {
	return async (...args) => {
		const loadedPlugin = await loadPlugin(plugin, ...args);
		return loadedPlugin;
	};
}

async function getAvailableDefaultPlugins() {
	const settledDefaultPlugins = await Promise.allSettled(defaultPlugins.map(plugin => loadPlugin(plugin)));
	return settledDefaultPlugins.filter(outcome => outcome.status === 'fulfilled').map(outcome => outcome.value);
}

export default function gulpImagemin(plugins, options) {
	if (typeof plugins === 'object' && !Array.isArray(plugins)) {
		options = plugins;
		plugins = undefined;
	}

	options = {
		// TODO: Remove this when Gulp gets a real logger with levels
		silent: process.argv.includes('--silent'),
		verbose: process.argv.includes('--verbose'),
		...options,
	};

	const validExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.svg']);

	const promisedPlugins = plugins && Promise.all(plugins);
	const pendingPlugins = promisedPlugins || getAvailableDefaultPlugins();

	let totalBytes = 0;
	let totalSavedBytes = 0;
	let totalFiles = 0;

	return through.obj({
		maxConcurrency: 8,
	}, (file, encoding, callback) => {
		if (file.isNull()) {
			callback(null, file);
			return;
		}

		if (file.isStream()) {
			callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return;
		}

		if (!validExtensions.has(path.extname(file.path).toLowerCase())) {
			if (options.verbose) {
				log(`${PLUGIN_NAME}: Skipping unsupported image ${chalk.blue(file.relative)}`);
			}

			callback(null, file);
			return;
		}

		(async () => {
			try {
				const resolvedPlugins = await pendingPlugins;
				const data = await imagemin.buffer(file.contents, {
					plugins: resolvedPlugins,
				});
				const originalSize = file.contents.length;
				const optimizedSize = data.length;
				const saved = originalSize - optimizedSize;
				const percent = originalSize > 0 ? (saved / originalSize) * 100 : 0;
				const savedMessage = `saved ${prettyBytes(saved)} - ${percent.toFixed(1).replace(/\.0$/, '')}%`;
				const message = saved > 0 ? savedMessage : 'already optimized';

				if (saved > 0) {
					totalBytes += originalSize;
					totalSavedBytes += saved;
					totalFiles++;
				}

				if (options.verbose) {
					log(`${PLUGIN_NAME}:`, chalk.green('✔ ') + file.relative + chalk.gray(` (${message})`));
				}

				file.contents = Buffer.from(data);

				callback(null, file);
			} catch (error) {
				callback(new PluginError(PLUGIN_NAME, error, {fileName: file.path}));
			}
		})();
	}, callback => {
		if (!options.silent) {
			const percent = totalBytes > 0 ? (totalSavedBytes / totalBytes) * 100 : 0;
			let message = `Minified ${totalFiles} ${plur('image', totalFiles)}`;

			if (totalFiles > 0) {
				message += chalk.gray(` (saved ${prettyBytes(totalSavedBytes)} - ${percent.toFixed(1).replace(/\.0$/, '')}%)`);
			}

			log(`${PLUGIN_NAME}:`, message);
		}

		callback();
	});
}

export const gifsicle = exposePlugin('gifsicle');
export const mozjpeg = exposePlugin('mozjpeg');
export const optipng = exposePlugin('optipng');
export const svgo = exposePlugin('svgo');
