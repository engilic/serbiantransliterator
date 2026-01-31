// @ts-nocheck
// tests-e2e/mocks/office.js

/* global window */

window.Office = {
    HostType: { Word: "Word" },
    EventType: { DocumentSelectionChanged: "DocumentSelectionChanged" },
    CoercionType: { Text: "Text" },
    AsyncResultStatus: { Succeeded: "succeeded" },
    context: {
        document: {
            addHandlerAsync: function (event, handler, cb) {
                if (cb) cb({ status: "succeeded" });
            },
            removeHandlerAsync: function (event, handler, cb) {
                if (cb) cb({ status: "succeeded" });
            },
            getSelectedDataAsync: function (type, cb) {
                cb({ status: "succeeded", value: "" });
            },
        },
        displayLanguage: "sr-Latn-RS",
    },
    onReady: function (callback) {
        // Simuliramo kaÅ¡njenje mreÅ¾e da bi bilo realnije
        setTimeout(function () {
            callback({ host: "Word" });
        }, 50);
    },
};
