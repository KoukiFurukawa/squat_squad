const path = require('path');
const webpack = require("webpack");

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {

        entry: './src/index.tsx',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            filename: 'main.js',
            path: path.resolve(__dirname, 'static/js/'),
        },
        devServer: {
            static: path.join(__dirname, 'for_test/'),
            compress: true,
            port: 9000,
            hot: true,
            open: true
        },
        mode: 'production',
        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
            })
        ]
    }
};