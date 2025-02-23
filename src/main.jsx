import React from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import { registerSW } from "virtual:pwa-register";
import App from "./App";

registerSW({ immediate: true });

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: "#DFFf31" } }}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
