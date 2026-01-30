// webpack.config.js

// webpack.config.js

// webpack.config.js

// webpack.config.js

// webpack.config.js

// webpack.config.js

// webpack.config.js

// webpack.config.js

/* eslint-disable no-undef */

const { merge } = require("webpack-merge");
const devCerts = require("office-addin-dev-certs");

const commonConfig = require("./webpack.common.js");
const devConfig = require("./webpack.dev.js");
const prodConfig = require("./webpack.prod.js");

/**
 * Glavna Webpack konfiguracija koja spaja common, dev i prod okruženja.
 * God Mode: HTTPS sertifikati se automatski generišu za lokalni Office razvoj.
 */
module.exports = async (env, options) => {
    const isDev = options.mode === "development";
    const envConfig = isDev ? devConfig : prodConfig;

    if (isDev) {
        // Generisanje SSL sertifikata neophodnih za Word Add-in (mora biti HTTPS)
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

    // Spajamo bazičnu konfiguraciju sa specifičnom za okruženje
    return merge(commonConfig, envConfig);
};
