/* eslint-disable no-undef */
// webpack.common.js

const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

function readPart(partialPath) {
    const fullPath = path.resolve(__dirname, "src/taskpane", partialPath);
    return fs.readFileSync(fullPath, "utf8");
}

function getBuildId() {
    if (process.env.CF_PAGES_COMMIT_SHA) return String(process.env.CF_PAGES_COMMIT_SHA).slice(0, 12);
    if (process.env.GITHUB_SHA) return String(process.env.GITHUB_SHA).slice(0, 12);
    return String(Date.now());
}

const BUILD_ID = getBuildId();

module.exports = {
    cache: {
        type: "filesystem",
        name: "serbian-transliterator-webpack-cache",
        buildDependencies: {
            config: [__filename],
        },
    },

    // Entry Points
    entry: {
        taskpane: ["./src/taskpane/taskpane.ts"],
        commands: ["./src/commands/commands.ts"],

        // ❌ OBRISANO: sw: ["./src/sw.ts"],
        // (Workbox sada sam uzima src/sw.ts i pravi sw.js)

        webapp: ["./src/web/web.ts"],
    },

    // Output Configuration
    output: {
        path: path.resolve(__dirname, "dist"),

        // ✅ POJEDNOSTAVLJENO: Svi fajlovi ovde dobijaju hash.
        // sw.js se pravi odvojeno preko InjectManifest plugina i ne prolazi kroz ovo.
        filename: "[name].[contenthash:8].js",

        chunkFilename: "[name].[contenthash:8].js",

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
            {
                test: /\.ts$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        cacheCompression: false,
                    },
                },
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
        new MiniCssExtractPlugin({ filename: "[name].[contenthash:8].css" }),

        new webpack.DefinePlugin({
            __BUILD_ID__: JSON.stringify(BUILD_ID),
        }),

        new HtmlWebpackPlugin({
            filename: "taskpane.html",
            template: "./src/taskpane/taskpane.html",
            chunks: ["taskpane"],
            templateParameters: { readPart },
            minify: {
                removeComments: true,
                collapseWhitespace: true,
            },
        }),

        new HtmlWebpackPlugin({
            filename: "commands.html",
            template: "./src/commands/commands.html",
            chunks: ["commands"],
            minify: true,
        }),

        new HtmlWebpackPlugin({
            filename: "web.html",
            template: "./src/web/web.html",
            chunks: ["webapp"],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
            },
        }),

        new CopyWebpackPlugin({
            patterns: [
                { from: "manifest.prod.xml", to: "manifest.prod.xml" },
                { from: "manifest.prod.xml", to: "manifest.xml" },
                { from: "src/static/index.html", to: "index.html" },
                { from: "src/static/_headers", to: "_headers", toType: "file" },
                { from: "src/static/manifest.webmanifest", to: "manifest.webmanifest" },
                { from: "src/static/support.html", to: "support.html" },
                { from: "src/static/privacy.html", to: "privacy.html" },
                { from: "assets/icon-16.png", to: "assets/icon-16.png" },
                { from: "assets/icon-32.png", to: "assets/icon-32.png" },
                { from: "assets/icon-64.png", to: "assets/icon-64.png" },
                { from: "assets/icon-80.png", to: "assets/icon-80.png" },
                { from: "assets/icon-192.png", to: "assets/icon-192.png" },
                { from: "assets/icon-512.png", to: "assets/icon-512.png" },
            ],
        }),
    ],

    performance: {
        hints: false,
    },
};
