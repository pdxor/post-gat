const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const corsAnywhere = require("cors-anywhere");

const app = express();

app.use(express.static("public"));

app.use(
  "/api",
  createProxyMiddleware({
    target: "https://api.openai.com",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "/v1",
    },
  })
);

// CORS Anywhere server configuration
const host = "localhost";
const port = 8080;

const proxy = corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins
  requireHeader: ["origin", "x-requested-with"],
  removeHeaders: ["cookie", "cookie2"],
});

proxy.listen(port, host, () => {
  console.log(`CORS Anywhere running on http://${host}:${port}`);
});

// Main server configuration
const MAIN_PORT = process.env.PORT || 3000;
app.listen(MAIN_PORT, () => console.log(`Server listening on port ${MAIN_PORT}`));
