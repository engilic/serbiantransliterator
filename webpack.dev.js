// webpack.dev.js
/* eslint-disable no-undef */

module.exports = {
    mode: "development",
    devtool: "source-map",
    stats: "minimal",
    devServer: {
        headers: { "Access-Control-Allow-Origin": "*" },
        port: 3000,
        hot: true, // [GOD MODE]: Omogućava zamenu koda bez refresha
        liveReload: true,
        static: {
            directory: "./dist",
            watch: true,
        },
        // [GOD MODE]: Garantuje da server ne izlazi nakon jednog build-a
        watchFiles: {
            paths: ["src/**/*", "assets/**/*"],
            options: { usePolling: false },
        },
        client: {
            overlay: true,
            progress: true,
        },
    },
};
