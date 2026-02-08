// webpack.prod.js

const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
// [NOVO] Workbox za generisanje manifesta
const { InjectManifest } = require("workbox-webpack-plugin");

module.exports = {
    mode: "production",
    devtool: false,

    optimization: {
        minimize: true,
        concatenateModules: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                extractComments: false,
                exclude: /\/node_modules\/|.*\.bin\.js/,
                terserOptions: {
                    compress: {
                        drop_console: true,
                        passes: 1,
                    },
                    mangle: {
                        toplevel: true,
                    },
                    output: {
                        comments: false,
                        max_line_len: 1000,
                    },
                },
            }),
        ],
        splitChunks: {
            chunks: "all",
            minSize: 20000,
            maxSize: 500000,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    priority: 10,
                    enforce: true,
                },
            },
        },
    },

    plugins: [
        new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.(js|css|html|svg|wasm)$/,
            threshold: 10240,
            minRatio: 0.8,
        }),

        // [NOVO] Generisanje liste fajlova za SW
        new InjectManifest({
            swSrc: "./src/sw.ts", // Tvoj izvorni SW
            swDest: "sw.js", // Gde Webpack izbacuje finalni SW
            include: [
                /\.html$/,
                /\.js$/,
                /\.css$/,
                /\.wasm$/,
                /\.png$/,
                /\.json$/,
                /\.md$/,
                /manifest\.webmanifest$/,
            ],
            // [BITNO] Ne keširaj Add-in fajlove za Web korisnike!
            exclude: [
                /taskpane/,
                /commands/,
                /manifest\.xml$/, // Office manifest
                /manifest\.prod\.xml$/, // Office manifest
            ],
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit (zbog WASM/Dict)
        }),
    ],

    performance: {
        hints: false,
    },
};
