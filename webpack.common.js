/* eslint-disable no-undef */
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
    entry: {
        taskpane: ["./src/taskpane/taskpane.ts"],
        commands: ["./src/commands/commands.ts"],
        sw: "./src/sw.ts",
    },
    resolve: {
        extensions: [".ts", ".html", ".js"],
    },
    experiments: {
        asyncWebAssembly: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "babel-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.(png|jpg|gif|ico)$/,
                type: "asset/resource",
                generator: {
                    filename: "assets/[name][ext]",
                },
            },
            {
                test: /\.bin$/,
                type: "asset/inline",
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
        new HtmlWebpackPlugin({
            filename: "taskpane.html",
            template: "./src/taskpane/taskpane.html",
            chunks: ["taskpane"],
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
            },
        }),
        new HtmlWebpackPlugin({
            filename: "commands.html",
            template: "./src/commands/commands.html",
            chunks: ["commands"],
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
            },
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "src/static/assets",
                    to: "assets",
                    globOptions: {
                        ignore: ["**/*.json"],
                    },
                    noErrorOnMissing: true,
                },
                { from: "manifest*.xml", to: "[name][ext]" },
                { from: "src/static/index.html", to: "index.html", noErrorOnMissing: true },
                { from: "src/static/support.html", to: "support.html", noErrorOnMissing: true },
                { from: "src/static/privacy.html", to: "privacy.html", noErrorOnMissing: true },
                { from: "src/static/_headers", to: "_headers", toType: "file", noErrorOnMissing: true },
                {
                    from: "src/static/manifest.webmanifest",
                    to: "manifest.webmanifest",
                    noErrorOnMissing: true,
                },
            ],
        }),
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, "src/wasm-core"),
            outDir: path.resolve(__dirname, "src/wasm-core/pkg"),
        }),
    ],
};
