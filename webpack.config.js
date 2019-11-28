const path = require('path');

const pathModules = path.resolve(__dirname);

module.exports = {
	context: path.resolve(__dirname),
	entry: {
    content_scripts: './src/index.js',
    popup: './src/popup',
    editor: './src/editor'
	},
	output: {
		path: path.resolve(__dirname, './build/'),
		filename: '[name].js',
		chunkFilename: '[name].js'
	},
	watch: true,
	mode: 'development',
	resolve: {
		modules: [pathModules,'node_modules'],
	},  
	module: {
		rules: [
			{
				test: /\.js?$/,
				use: {
					loader: 'babel-loader'
				}
      }
		]
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 30000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /node_modules/,
          chunks: "initial",
          name: "vendor",
          priority: 10,
          enforce: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
	},
	devtool: 'source-map'
};
