/* eslint-disable no-undef */
// webpack.common.js

const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// Helper za injectovanje HTML parcijala
function readPart(partialPath) {
    const fullPath = path.resolve(__dirname, "src/taskpane", partialPath);
    return fs.readFileSync(fullPath, "utf8");
}

// Build ID za cache busting (Cloudflare/GitHub CI kompatibilno)
function getBuildId() {
    // Cloudflare Pages
    if (process.env.CF_PAGES_COMMIT_SHA) return String(process.env.CF_PAGES_COMMIT_SHA).slice(0, 12);

    // GitHub Actions
    if (process.env.GITHUB_SHA) return String(process.env.GITHUB_SHA).slice(0, 12);

    // Lokalno (svaki build unikatan)
    return String(Date.now());
}

const BUILD_ID = getBuildId();

module.exports = {
    // ✅ Webpack filesystem cache (ne menja output, samo ubrzava)
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

        // Service Worker (mora da ostane stabilno ime: sw.js)
        sw: ["./src/sw.ts"],
    },

    // Output Configuration
    output: {
        path: path.resolve(__dirname, "dist"),

        // ✅ Hashovani fajlovi za sve osim SW (SW mora biti "sw.js")
        filename: (pathData) => {
            const name = pathData.chunk && pathData.chunk.name ? String(pathData.chunk.name) : "";
            if (name === "sw") return "sw.js";
            return "[name].[contenthash:8].js";
        },

        // ✅ I async chunk-ovi dobijaju hash
        chunkFilename: "[name].[contenthash:8].js",

        globalObject: "self", // OBAVEZNO za Workere u Office-u
        clean: true, // Brise dist pre builda (ok je; i dalje ti prebuild radi clean za sve ostalo)
    },

    // Resolver
    resolve: {
        extensions: [".ts", ".tsx", ".html", ".js", ".json", ".wasm"],
        alias: {
            "@wasm": path.resolve(__dirname, "src/wasm-core/pkg"),
            "@src": path.resolve(__dirname, "src"),
        },
    },

    // Loaders
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

            // NOTE: ikonice se kopiraju CopyWebpackPlugin-om pod stabilnim imenima.
            // Ako importuješ druge slike iz koda, ovo će ih staviti u dist/assets/ bez hash-a (namerno).
            {
                test: /\.(png|jpg|jpeg|gif|ico)$/,
                type: "asset/resource",
                generator: { filename: "assets/[name][ext]" },
            },

            // Inline binarni fajlovi (rečnici)
            {
                test: /\.bin$/,
                type: "asset/inline",
            },

            // Inline WASM (najsigurnije za Office)
            {
                test: /\.wasm$/,
                type: "asset/inline",
            },
        ],
    },

    // Plugins
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

        new CopyWebpackPlugin({
            patterns: [
                // ✅ PROD manifest (jedini koji treba da se hostuje javno)
                { from: "manifest.prod.xml", to: "manifest.prod.xml" },

                // ✅ (preporuka) dist/manifest.xml neka bude production, ne localhost
                { from: "manifest.prod.xml", to: "manifest.xml" },

                // Cloudflare Pages headers
                { from: "src/static/_headers", to: "_headers", toType: "file" },

                // PWA manifest
                { from: "src/static/manifest.webmanifest", to: "manifest.webmanifest" },

                // Support/Privacy stranice
                { from: "src/static/support.html", to: "support.html" },
                { from: "src/static/privacy.html", to: "privacy.html" },

                // ✅ Ikonice (iz root assets foldera koji si naveo)
                { from: "assets/icon-16.png", to: "assets/icon-16.png" },
                { from: "assets/icon-32.png", to: "assets/icon-32.png" },
                { from: "assets/icon-64.png", to: "assets/icon-64.png" },
                { from: "assets/icon-80.png", to: "assets/icon-80.png" },
            ],
        }),
    ],

    performance: {
        hints: false,
    },
};
