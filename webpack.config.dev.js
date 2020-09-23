const CopyWebpackPlugin = require('copy-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const path = require("path");

module.exports = {
    mode: 'development',
    devServer: {
        contentBase: 'doc',
        port: 3000
    },
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'doc')
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{
                from: 'build/assets',
                to: 'assets'
            }]
        }),
        new HTMLWebpackPlugin({
            template: 'build/index.html',
            filename: 'index.html'
        })
    ]
}