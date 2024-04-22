/*
 * @Author: steven libo@rongma.com
 * @Date: 2023-09-15 13:48:17
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-04-22 15:36:56
 * @FilePath: \react-ts-antd\config-overrides.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpack = require('webpack');
// 加载环境变量文件
const dotenv = require('dotenv');
const envFiles = {
  development: '.env.development',
  production: '.env.production'
};
const env = dotenv.config({ path: envFiles[process.env.NODE_ENV] }).parsed;

module.exports = override(
  // 添加路径别名
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src'),
  }),
  // 代码分割
  // (config) => {
  //   config.optimization.splitChunks = {
  //     chunks: 'all',
  //     cacheGroups: {
  //       vendors: {
  //         test: /[\\/]node_modules[\\/]/,
  //         priority: -10,
  //         name: 'vendors',
  //         enforce: true,
  //       },
  //       commons: {
  //         name: 'commons',
  //         minChunks: 2,
  //         priority: -20,
  //         reuseExistingChunk: true,
  //       },
  //     },
  //   };
  //   return config;
  // },
  
  // 压缩优化
  (config) => {
    if (config.mode === 'production') {
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true, // 去掉 console
              drop_debugger: true // 去掉 debugger
            }
          }
        }),
        new OptimizeCSSAssetsPlugin(),
      ];
    }
    return config;
  },

  // 样式处理
  (config) => {
    const loaders = config.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf;
    loaders.unshift(
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    );
    return config;
  },

  // 图片处理
  (config) => {
    config.module.rules.push({
      test: /\.(png|jpg|gif)$/i,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 8192,
          },
        },
      ],
    });
    return config;
  },

   // 环境变量配置
   (config) => {
    // 将环境变量注入到 DefinePlugin 中
    config.plugins = config.plugins.map((plugin) => {
      if (plugin.constructor.name === 'DefinePlugin') {
        return new webpack.DefinePlugin({
          'process.env': JSON.stringify(env),
        });
      }
      return plugin;
    });
    return config;
  },

  // 代码分析
  (config) => {
    if (process.env.ANALYZE) {
      config.plugins.push(new BundleAnalyzerPlugin());
    }
    return config;
  }
);
