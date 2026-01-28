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
    entry: {
        taskpane: ["./src/taskpane/taskpane.ts"],
        commands: ["./src/commands/commands.ts"],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        globalObject: "self",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".html", ".js"],
        alias: {
            // Alias za lakši import WASM-a
            "@wasm": path.resolve(__dirname, "src/wasm-core/pkg"),
        },
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
                test: /\.(png|jpg|jpeg|gif|ico)$/,
                type: "asset/resource",
                generator: { filename: "assets/[name][ext]" },
            },
            {
                test: /\.bin$/,
                type: "asset/inline",
            },
            {
                test: /\.wasm$/,
                type: "asset/inline",
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({ filename: "[name].css" }),
        new HtmlWebpackPlugin({
            filename: "taskpane.html",
            template: "./src/taskpane/taskpane.html",
            chunks: ["taskpane"],
            templateParameters: { readPart: readPart },
        }),
        new HtmlWebpackPlugin({
            filename: "commands.html",
            template: "./src/commands/commands.html",
            chunks: ["commands"],
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "manifest*.xml", to: "[name][ext]" },
                { from: "src/static/_headers", to: "_headers", toType: "file" },
                { from: "src/static/manifest.webmanifest", to: "manifest.webmanifest" },
            ],
        }),
    ],
};
