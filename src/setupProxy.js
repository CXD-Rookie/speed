/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:23:33
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-06 11:26:00
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\setupProxy.js
 */
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/apiProxy", {
      target: "https://test-api.accessorx.com",
      changeOrigin: true,
      pathRewrite: { "^/apiProxy": "" },
      logLevel: "debug"
    }),
  );
};
