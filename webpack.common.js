/* eslint-disable no-undef */
const path = require("path");
// pkg je obrisan jer se ne koristi
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
    entry: {
        polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
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
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: {
                            // Isključujemo sources da ne bi pokušavao da resolve-uje slike
                            sources: false,
                            // Preprocessor koji dozvoljava EJS sintaksu <%= ... %>
                            preprocessor: (content, _loaderContext) => {
                                let result = content;
                                // Jednostavna zamena za require include-ove
                                // Ovo radi replace pre nego što html-loader parsira
                                result = result.replace(/<%= require\('(.+?)'\) %>/g, (match, filepath) => {
                                    const absolutePath = path.resolve(_loaderContext.context, filepath);
                                    // Koristimo fs da učitamo fajl sinhrono
                                    return _loaderContext.fs.readFileSync(absolutePath, "utf8");
                                });
                                return result;
                            },
                        },
                    },
                ],
                exclude: /node_modules/,
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
            chunks: ["polyfill", "taskpane"],
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
            },
        }),
        new HtmlWebpackPlugin({
            filename: "commands.html",
            template: "./src/commands/commands.html",
            chunks: ["polyfill", "commands"],
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
            },
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "assets/*", to: "assets/[name][ext]" },
                { from: "manifest*.xml", to: "[name][ext]" },
                { from: "src/static/assets", to: "assets", noErrorOnMissing: true },
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
