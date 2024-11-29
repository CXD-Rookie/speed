const fs = require('fs');
const path = require('path');
const { exec } = require('shelljs');

// 切换到 dev 分支
exec('git checkout dev', { silent: true });

if (currentTag === '') {
  // 如果没有标签，则可能使用commit hash作为版本标识
  currentTag = exec('git rev-parse --short HEAD', { silent: true }).stdout.trim();
}

// 获取当前Git标签
let currentTag = exec('git describe --tags --abbrev=0', { silent: true }).stdout.trim();

if (currentTag === '') {
  // 如果没有标签，则可能使用commit hash作为版本标识
  currentTag = exec('git rev-parse --short HEAD', { silent: true }).stdout.trim();
}

// 定义要添加或更新的环境变量
const newEnvVars = {
  REACT_APP_VERSION: currentTag,
  // 可以在这里添加更多的环境变量
};

// 从环境变量中读取 npm_config_argv
const npmConfigArgv = process.env.npm_config_argv;

// 解析 JSON 字符串
let argv;
try {
  argv = JSON.parse(npmConfigArgv);
} catch (error) {
  console.error('Failed to parse npm_config_argv:', error);
  process.exit(1); // 如果解析失败，则退出脚本
}

// 获取 cooked 数组
const { cooked } = argv;
let envFile;
// 检查 cooked 数组中的值
if (cooked.includes('build:dev')) {
  envFile = '.env.development';
} else if (cooked.includes('build:pro')) {
  envFile = '.env.production';
} else {
  console.error('Unknown build command. Please use one of the following: build:dev, build:staging, build:production.');
  process.exit(1); // 退出脚本，状态码为1表示有错误
}

// 获取 .env.development 文件的路径
const envFilePath = path.join(__dirname, envFile);

// 读取现有的 .env.development 文件
fs.readFile(envFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading .env file:', err);
    return;
  }

  // 将数据按行分割
  const lines = data.split('\n');

  // 遍历每一行并更新或添加新的环境变量
  Object.keys(newEnvVars).forEach(key => {
    const newValue = newEnvVars[key];
    const lineToMatch = `${key}=.*`;
    const newLine = `${key}=${newValue}`;

    // 查找匹配的行并替换
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(lineToMatch)) {
        lines[i] = newLine;
        break;
      }
    }

    // 如果没有找到匹配的行，则添加新行
    if (!lines.some(line => line.match(lineToMatch))) {
      lines.push(newLine);
    }
  });

  // 将更新后的数据写回 .env.development 文件
  fs.writeFile(envFilePath, lines.join('\n'), 'utf8', (err) => {
    if (err) {
      console.error('Error writing to .env file:', err);
    } else {
      console.log('.env.development updated successfully.');
    }
  });
});