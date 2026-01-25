/* eslint-disable no-undef */
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin"); // [MAX4]

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
    plugins: [
        // [MAX4] Pre-compressed assets (Gzip)
        // Cloudflare automatski servira .gz ako browser podržava
        new CompressionPlugin({
            filename: "[path][base].gz",
            algorithm: "gzip",
            test: /\.(js|css|html|svg|wasm)$/,
            threshold: 0, // Komprimuj sve (čak i male fajlove)
            minRatio: 0.8,
        }),
        // [MAX4] Pre-compressed assets (Brotli - još bolja kompresija)
        new CompressionPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            test: /\.(js|css|html|svg|wasm)$/,
            threshold: 0, // Komprimuj sve
            minRatio: 0.8,
        }),
    ],
    performance: {
        hints: false,
    },
};
