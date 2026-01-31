// @ts-nocheck
// webpack.common.js

/* eslint-disable no-undef */

/**
 * Zajednička Webpack konfiguracija za Serbian Transliterator.
 * Upravlja uvozom fajlova, CSS-om, parcijalima i Office Manifestom.
 */

const path = require("path");
const fs = require("fs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/**
 * Pomoćna funkcija za učitavanje HTML parcijala unutar taskpane.html.
 */
function readPart(partialPath) {
    const fullPath = path.resolve(__dirname, "src/taskpane", partialPath);
    return fs.readFileSync(fullPath, "utf8");
}

module.exports = {
    // 1. Početne tačke (Entry Points)
    entry: {
        taskpane: ["./src/taskpane/taskpane.ts"],
        commands: ["./src/commands/commands.ts"],
    },

    // 2. Izlazna konfiguracija (Output)
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        globalObject: "self",
        clean: true,
    },

    // 3. Rezolucija modula
    resolve: {
        extensions: [".ts", ".tsx", ".html", ".js", ".json", ".wasm"],
        alias: {
            "@wasm": path.resolve(__dirname, "src/wasm-core/pkg"),
            "@src": path.resolve(__dirname, "src"),
        },
    },

    // 4. Loaders (Pravila za transformaciju fajlova)
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
                generator: {
                    filename: "assets/[name][ext]",
                },
            },
            // Binarni fajlovi (Rečnici) se pakuju inline radi brzine
            {
                test: /\.bin$/,
                type: "asset/inline",
            },
            // WASM motor se pakuje inline za maksimalnu kompatibilnost u Wordu
            {
                test: /\.wasm$/,
                type: "asset/inline",
            },
        ],
    },

    // 5. Plugins
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),

        // Generisanje taskpane.html sa HTML parcijalima
        new HtmlWebpackPlugin({
            filename: "taskpane.html",
            template: "./src/taskpane/taskpane.html",
            chunks: ["taskpane"],
            templateParameters: {
                readPart: readPart,
            },
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
                {
                    from: "manifest*.xml",
                    to: "[name][ext]",
                },
                {
                    from: "src/static/_headers",
                    to: "_headers",
                    toType: "file",
                },
                {
                    from: "src/static/manifest.webmanifest",
                    to: "manifest.webmanifest",
                },
            ],
        }),
    ],

    performance: {
        hints: false,
    },

    // [GOD MODE FIX]: Utišavanje Webpack šuma
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

    infrastructureLogging: {
        level: "warn",
    },
};
