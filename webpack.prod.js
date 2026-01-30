// webpack.prod.js

// webpack.prod.js

// webpack.prod.js

// webpack.prod.js

// webpack.prod.js

// webpack.prod.js

// webpack.prod.js

// webpack.prod.js

/* eslint-disable no-undef */

const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

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
                // [FIX] IskljuÄi minifikaciju za velike binarne fajlove
                exclude: /\/node_modules\/|.*\.bin\.js/,
                terserOptions: {
                    compress: {
                        drop_console: true,
                        passes: 1, // Brzina
                    },
                    mangle: {
                        toplevel: true,
                    },
                    output: {
                        comments: false,
                        max_line_len: 1000, // Brzina za velike linije
                    },
                },
            }),
        ],
        splitChunks: {
            chunks: "all",
            minSize: 20000,
            maxSize: 500000, // VeÄ‡i chunkovi za reÄnike
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
};
