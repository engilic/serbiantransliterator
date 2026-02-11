/* global window */
// tests-e2e/mocks/office.js

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
    // FIX: onReady mora da vrati Promise da bi .then() u taskpane.ts radio
    onReady: function (callback) {
        const info = { host: "Word" };
        const promise = new Promise((resolve) => {
            setTimeout(() => {
                if (callback) callback(info);
                resolve(info);
            }, 50);
        });
        return promise;
    },
};
