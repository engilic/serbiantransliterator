/* eslint-disable no-undef */
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    mode: "production",
    devtool: false,
    optimization: {
        minimize: true,
        // [MAX] Scope Hoisting: Spaja male module u jedan scope = brže izvršavanje
        concatenateModules: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                        // [MAX] Dva prolaza optimizacije
                        passes: 2,
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
    performance: {
        hints: false,
    },
};
