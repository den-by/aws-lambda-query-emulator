const path = require('path');
const nodeExternals = require('webpack-node-externals');
require('dotenv').config()
const PROJECT_DIR = process.env['PROJECT_DIR']

module.exports = env => ({
    entry: PROJECT_DIR + '/function/graphql.js',

    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
    },
    devtool: 'source-map',
    target: 'node',
    mode: 'development',
    externals: [nodeExternals()], // exclude external modules
    optimization: {
        minimize: true,
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                "targets": {
                                    "node": "12"
                                }
                            }]
                        ],
                    }
                }
            }
        ]
    }
});
