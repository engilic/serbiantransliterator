// webpack.dev.js

// webpack.dev.js

/* eslint-disable no-undef */

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
