import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";

/* global Office */

const title = "Serbian Transliterator";

const render = (Component: React.FC) => {
    const rootElement = document.getElementById("container");
    if (rootElement) {
        const root = createRoot(rootElement);
        root.render(<Component />);
    }
};

Office.onReady(() => {
    render(App);
});

if ((module as any).hot) {
    (module as any).hot.accept("./components/App", () => {
        const NextApp = require("./components/App").App;
        render(NextApp);
    });
}
