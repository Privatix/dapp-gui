const webpack = require('webpack');
const path = require('path');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const electronMainConfig = {
    context: __dirname,
    entry: {
        main: [
            "../src/main.ts",
        ]
    },
    target: 'electron-main',
    node: {
        __dirname: false
    },
    output: {
        path: __dirname + '/../build/',
        pathinfo: true,
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.ts', '.js', '.json', '.node', '.html'],
        modules: ['node_modules']
    },
    module: {
        rules:[
            /*  {enforce: 'pre', test: /\.ts$/, loader: "tslint-loader", options: {configFile: './configs/tslint.json'}}
            , */ {test: /\.ts$/, exclude: /node_modules/, loader: 'ts-loader?' + JSON.stringify({configFile: __dirname + '/tsconfig.json'}) },
            {test: /\.node$/, use: 'node-loader'}
        ]
    }

};

const electronRendererConfig = {
    context: path.resolve('./'),
    entry: {
        dapp: [
            "./src/dapp.tsx"
        ]
    },
    target: 'electron-renderer',
    output: {
        path: __dirname + '/../build/',
        pathinfo: true,
        filename: '[name].js',
    },
    resolve: {
        plugins: [new TsconfigPathsPlugin({configFile: __dirname + '/tsconfig.json', baseUrl: __dirname + '/src/'})],
        extensions: ['.ts', '.tsx', 'index.tsx', '.js', '.json', '.node', '.html', '.css'],
        modules: ['src', 'node_modules'],
    },
    module: {
        rules:[
            /* {enforce: 'pre', test: /\.ts$/, loader: "tslint-loader", options: {configFile: './configs/tslint.json'}}
           , */ {test: /\.tsx?$/, exclude: /node_modules/, loader: 'ts-loader?' + JSON.stringify({configFile: __dirname + '/tsconfig.json'}) },
            {test: /\.node$/, use: 'node-loader'},
            {test: /\.css$/, loader: 'style-loader!typings-for-css-modules-loader?namedExport&modules&camelCase'}
        ]
    }

};

module.exports = [electronMainConfig, electronRendererConfig];
