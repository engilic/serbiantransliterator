/* eslint-disable no-undef */
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    devtool: false,
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true, // Čisti console.log za produkciju
                    },
                    mangle: {
                        toplevel: true,
                    },
                    output: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
        splitChunks: {
            chunks: "all",
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
    // === VISION 2026: HARDENING ===
    // Postavljamo stroge limite. Ako WASM pređe 3MB, CI pipeline puca.
    performance: {
        hints: "error", // 'warning' ne zaustavlja build, 'error' zaustavlja.
        maxAssetSize: 3000000, // 3MB limit za pojedinačni fajl (wasm/js)
        maxEntrypointSize: 3500000, // 3.5MB ukupno za inicijalno učitavanje
        assetFilter: function (assetFilename) {
            // Pratimo samo kod i binary, ne slike/fontove
            return assetFilename.endsWith(".js") || assetFilename.endsWith(".wasm");
        },
    },
};
