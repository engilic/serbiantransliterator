/* eslint-disable no-undef */
// webpack.dev.js

module.exports = {
    mode: "development",
    devtool: "source-map",
    stats: "minimal",
    devServer: {
        headers: { "Access-Control-Allow-Origin": "*" },
        port: 3000,
        hot: false,
        liveReload: true,
        watchFiles: ["src/**/*"],
    },
};
