/*
 * @Author: zhangda
 * @Date: 2024-05-24 11:23:33
 * @LastEditors: zhangda
 * @LastEditTime: 2024-05-24 11:43:28
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\setupProxy.js
 */
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/apiProxy", {
      target: "https://rm-mga-dev.yuwenlong.cn",
      changeOrigin: true,
      pathRewrite: { "^/apiProxy": "" },
      logLevel: "debug"
    }),
  );
};
