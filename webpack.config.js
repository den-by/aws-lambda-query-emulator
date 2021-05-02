const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = env => ({
    entry: env.rootDir + '/function/graphql.js',

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
