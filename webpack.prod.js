/* eslint-disable no-undef */
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    devtool: false, // Najmanji bundle, bez mapa

    optimization: {
        minimize: true,
        concatenateModules: true, // Scope Hoisting (Dobro zadržati!)
        minimizer: [
            new TerserPlugin({
                parallel: true,
                extractComments: false,
                terserOptions: {
                    compress: {
                        drop_console: true,
                        passes: 1, // [FIX] Smanjeno sa 2 na 1 (mnogo brže)
                    },
                    mangle: {
                        toplevel: true,
                    },
                    output: {
                        comments: false,
                    },
                },
            }),
        ],
        splitChunks: {
            chunks: "all",
            minSize: 20000,
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
        // [OPTIMIZED] Samo Gzip. Brotli je prespor za CI, a Cloudflare ga radi automatski.
        new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.(js|css|html|svg|wasm)$/,
            threshold: 10240, // [FIX] Ne komprimuj fajlove manje od 10KB (nema poente)
            minRatio: 0.8,
        }),
    ],

    performance: {
        hints: false,
    },
});
