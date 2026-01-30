// webpack.common.js

// webpack.common.js

// webpack.common.js

// webpack.common.js

// webpack.common.js

// webpack.common.js

// webpack.common.js

// webpack.common.js

/* eslint-disable no-undef */

const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

function readPart(partialPath) {
    const fullPath = path.resolve(__dirname, "src/taskpane", partialPath);
    return fs.readFileSync(fullPath, "utf8");
}

module.exports = {
    entry: { taskpane: ["./src/taskpane/taskpane.ts"], commands: ["./src/commands/commands.ts"] },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        globalObject: "self",
        clean: true,
    },
    resolve: {
        extensions: [".ts", ".tsx", ".html", ".js", ".json", ".wasm"],
        alias: {
            "@wasm": path.resolve(__dirname, "src/wasm-core/pkg"),
            "@src": path.resolve(__dirname, "src"),
        },
    },
    module: {
        rules: [
            { test: /\.ts$/, use: "babel-loader", exclude: /node_modules/ },
            { test: /\.css$/i, use: [MiniCssExtractPlugin.loader, "css-loader"] },
            {
                test: /\.(png|jpg|jpeg|gif|ico)$/,
                type: "asset/resource",
                generator: { filename: "assets/[name][ext]" },
            },
            { test: /\.bin$/, type: "asset/inline" },
            { test: /\.wasm$/, type: "asset/inline" },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: "[name].css" }),
        new HtmlWebpackPlugin({
            filename: "taskpane.html",
            template: "./src/taskpane/taskpane.html",
            chunks: ["taskpane"],
            templateParameters: { readPart: readPart },
            minify: { removeComments: true, collapseWhitespace: true },
        }),
        new HtmlWebpackPlugin({
            filename: "commands.html",
            template: "./src/commands/commands.html",
            chunks: ["commands"],
            minify: true,
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "manifest*.xml", to: "[name][ext]" },
                { from: "src/static/_headers", to: "_headers", toType: "file" },
                { from: "src/static/manifest.webmanifest", to: "manifest.webmanifest" },
            ],
        }),
    ],
    performance: { hints: false },
    stats: {
        preset: "minimal",
        modules: false,
        orphanModules: false,
        assets: true,
        colors: true,
        timings: true,
        version: false,
        hash: false,
    },
    infrastructureLogging: { level: "warn" },
};
