/* eslint-disable no-undef */
// webpack.config.js
// webpack.config.js
// webpack.config.js
// webpack.config.js
const { merge } = require("webpack-merge");
const devCerts = require("office-addin-dev-certs");

const commonConfig = require("./webpack.common.js");
const devConfig = require("./webpack.dev.js");
const prodConfig = require("./webpack.prod.js");

module.exports = async (env, options) => {
    const isDev = options.mode === "development";
    const envConfig = isDev ? devConfig : prodConfig;

    if (isDev) {
        const httpsOptions = await devCerts.getHttpsServerOptions();
        envConfig.devServer = {
            ...envConfig.devServer,
            server: {
                type: "https",
                options: {
                    ca: httpsOptions.ca,
                    key: httpsOptions.key,
                    cert: httpsOptions.cert,
                },
            },
        };
    }

    return merge(commonConfig, envConfig);
};
