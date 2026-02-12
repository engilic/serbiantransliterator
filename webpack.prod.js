// webpack.prod.js

const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");

module.exports = {
    mode: "production",
    devtool: false,

    // ✅ MAX1: disable filesystem cache in prod builds (prevents RealContentHashPlugin cache corruption)
    cache: false,

    optimization: {
        minimize: true,
        concatenateModules: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                extractComments: false,
                exclude: /\/node_modules\/|.*\.bin\.js/,
                terserOptions: {
                    compress: { drop_console: true, passes: 1 },
                    mangle: { toplevel: true },
                    output: { comments: false, max_line_len: 1000 },
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

        new InjectManifest({
            swSrc: "./src/sw.ts",
            swDest: "sw.js",
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
            exclude: [/taskpane/, /commands/, /manifest\.xml$/, /manifest\.prod\.xml$/],
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        }),
    ],

    performance: { hints: false },
};
