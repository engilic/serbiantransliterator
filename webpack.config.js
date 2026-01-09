/* eslint-disable no-undef */
const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

async function getHttpsOptions() {
    const httpsOptions = await devCerts.getHttpsServerOptions();
    return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
    const dev = options.mode === "development";
    const config = {
        devtool: "source-map",
        entry: {
            polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
            taskpane: ["./src/taskpane/taskpane.ts", "./src/taskpane/taskpane.html"],
            commands: ["./src/commands/commands.ts", "./src/commands/commands.html"],
        },
        resolve: { extensions: [".ts", ".html", ".js"] },
        module: {
            rules: [
                { test: /\.ts$/, use: "babel-loader", exclude: /node_modules/ },
                { test: /\.html$/, use: "html-loader", exclude: /node_modules/ },
                {
                    test: /\.(png|jpg|gif|ico)$/,
                    type: "asset/resource",
                    generator: { filename: "assets/[name][ext]" },
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: "taskpane.html",
                template: "./src/taskpane/taskpane.html",
                chunks: ["polyfill", "taskpane"],
            }),
            new HtmlWebpackPlugin({
                filename: "commands.html",
                template: "./src/commands/commands.html",
                chunks: ["polyfill", "commands"],
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: "assets/*", to: "assets/[name][ext]" },
                    { from: "manifest*.xml", to: "[name][ext]" },
                    { from: "src/static/support.html", to: "support.html", noErrorOnMissing: true },
                    { from: "src/static/privacy.html", to: "privacy.html", noErrorOnMissing: true },
                    { from: "src/static/_headers", to: "_headers", toType: "file", noErrorOnMissing: true },
                ],
            }),
        ],
        devServer: {
            headers: { "Access-Control-Allow-Origin": "*" },
            server: {
                type: "https",
                options: dev ? await getHttpsOptions() : {}
            },
            port: 3000,
            hot: false,
            liveReload: true,
            watchFiles: ["src/**/*"],
        },
    };
    return config;
};