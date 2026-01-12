/* eslint-disable no-undef */
const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
  const dev = options.mode === "development";

  const config = {
    devtool: dev ? "source-map" : false,
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      taskpane: ["./src/taskpane/taskpane.ts"],
      commands: ["./src/commands/commands.ts"],
    },
    resolve: { extensions: [".ts", ".html", ".js"] },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.html$/,
          use: "html-loader",
          exclude: /node_modules/,
        },

        // CSS bundling (taskpane.css se uvozi iz taskpane.ts)
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },

        {
          test: /\.(png|jpg|gif|ico)$/,
          type: "asset/resource",
          generator: { filename: "assets/[name][ext]" },
        },
      ],
    },
    optimization: {
      minimize: !dev,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: !dev,
            },
            mangle: {
              toplevel: true,
            },
            output: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            enforce: true,
          },
        },
      },
    },
    plugins: [
      // Izvlači CSS u fajl (npr. taskpane.css)
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),

      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "taskpane"],
        minify: !dev
          ? {
              collapseWhitespace: true,
              removeComments: true,
              removeRedundantAttributes: true,
            }
          : false,
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands"],
        minify: !dev
          ? {
              collapseWhitespace: true,
              removeComments: true,
            }
          : false,
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "assets/*", to: "assets/[name][ext]" },
          { from: "manifest*.xml", to: "[name][ext]" },

          // STATIC PAGES
          { from: "src/static/index.html", to: "index.html", noErrorOnMissing: true },
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
        options: dev ? await getHttpsOptions() : {},
      },
      port: 3000,
      hot: false,
      liveReload: true,
      watchFiles: ["src/**/*"],
    },
  };

  return config;
};