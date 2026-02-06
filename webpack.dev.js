// webpack.dev.js

module.exports = {
    mode: "development",
    devtool: "source-map",
    stats: "minimal",
    optimization: {
        minimize: false,
        concatenateModules: false,
        providedExports: false,
        usedExports: false,
        sideEffects: false,
    },
    devServer: {
        headers: { "Access-Control-Allow-Origin": "*" },
        port: 3000,
        hot: false,
        liveReload: true,
        watchFiles: ["src/**/*"],
    },
};
