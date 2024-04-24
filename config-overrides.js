/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-04-23 10:59:32
 * @FilePath: \react-ts-antd\config-overrides.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    // 指定@符指向src目录
    '@': path.resolve(__dirname, 'src'),
  }),

  // 添加 Babel 转换规则
  config => {
    // 查找 JavaScript 文件的规则
    const jsRule = config.module.rules.find(rule => rule.oneOf && rule.oneOf.find(one => one.test && one.test.toString().includes('.js')));

    // 添加 Babel 转换规则
    if (jsRule) {
      jsRule.oneOf.unshift({
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // 使用 babel-loader 处理 JavaScript 文件
          options: {
            configFile: path.resolve(__dirname, '.babelrc') // 指定 Babel 配置文件路径
          }
        }
      });
    }

    return config;
  }
);
