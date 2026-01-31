/* eslint-disable no-undef */
// webpack.common.js
// webpack.common.js
// webpack.common.js
// webpack.common.js
const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// Helper za injectovanje HTML parcijala
function readPart(partialPath) {
    const fullPath = path.resolve(__dirname, "src/taskpane", partialPath);
    return fs.readFileSync(fullPath, "utf8");
}

module.exports = {
    // 1. Entry Points
    entry: {
        taskpane: ["./src/taskpane/taskpane.ts"],
        commands: ["./src/commands/commands.ts"],
    },

    // 2. Output Configuration
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        globalObject: "self", // OBAVEZNO za Workere u Office-u
        clean: true, // Brise dist pre builda
    },

    // 3. Resolver
    resolve: {
        extensions: [".ts", ".tsx", ".html", ".js", ".json", ".wasm"],
        alias: {
            "@wasm": path.resolve(__dirname, "src/wasm-core/pkg"),
            "@src": path.resolve(__dirname, "src"),
        },
    },

    // 4. Loaders
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
            // [CRITICAL] Inline binarni fajlovi (rečnici)
            {
                test: /\.bin$/,
                type: "asset/inline",
            },
            // [CRITICAL] Inline WASM (najsigurnije za Office)
            {
                test: /\.wasm$/,
                type: "asset/inline",
            },
        ],
    },

    // 5. Plugins
    plugins: [
        new MiniCssExtractPlugin({ filename: "[name].css" }),

        new HtmlWebpackPlugin({
            filename: "taskpane.html",
            template: "./src/taskpane/taskpane.html",
            chunks: ["taskpane"],
            templateParameters: { readPart: readPart },
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

        new CopyWebpackPlugin({
            patterns: [
                { from: "manifest*.xml", to: "[name][ext]" },
                { from: "src/static/_headers", to: "_headers", toType: "file" },
                { from: "src/static/manifest.webmanifest", to: "manifest.webmanifest" },
            ],
        }),
    ],

    performance: {
        hints: false,
    },
};
