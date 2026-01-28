/* eslint-disable no-undef */
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    devtool: false,

    optimization: {
        minimize: true,
        concatenateModules: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                extractComments: false,
                // [FIX] Isključi minifikaciju za fajlove veće od 500KB (verovatno sadrže rečnike)
                // Terser se guši na ogromnim linijama.
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
                        // [FIX] Ovo može pomoći: max_line_len
                        max_line_len: 1000,
                    },
                },
            }),
        ],
        splitChunks: {
            chunks: "all",
            minSize: 20000,
            // [FIX] Povećaj limit da ne secka rečnike previše
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
    ],

    performance: {
        hints: false,
    },
});
