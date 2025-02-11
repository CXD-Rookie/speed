const fs = require('fs-extra');
const path = require('path');

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
} else if (cooked.includes('build:oem')) {
  envFile = '.env.oem';
} else {
  console.error('Unknown build command. Please use one of the following: build:dev, build:pro, build:oem.');
  process.exit(1); // 退出脚本，状态码为1表示有错误
}

// 读取对应的 .env 文件
const envFilePath = path.resolve(__dirname, envFile);
let envContent;
try {
  envContent = fs.readFileSync(envFilePath, 'utf8');
} catch (error) {
  console.error(`Failed to read ${envFile}:`, error);
  process.exit(1);
}

// 解析 .env 文件内容，获取 REACT_APP_WEB_ENV_URL
const lines = envContent.split('\n');
let jsonUrl;
for (const line of lines) {
  const [key, value] = line.split('=');
  if (key === 'REACT_APP_WEB_ENV_URL') {
    console.log(key, value);
    
    jsonUrl = value;
    break;
  }
}
console.log("json", jsonUrl);

if (!jsonUrl) {
  console.error(`REACT_APP_WEB_ENV_URL not found in ${envFile}`);
  process.exit(1);
}

// 异步函数用于获取 JSON 文件中的 REACT_APP_WEB_VERSION 字段
async function getWebVersion () {
  try {
    // 动态导入 node-fetch
    const { default: fetch } = await import('node-fetch');
    // 发送 HTTP 请求获取 JSON 文件
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // 将响应解析为 JSON 格式
    const jsonData = await response.json();
    console.log("json:", jsonData);

    return jsonData.REACT_APP_WEB_VERSION;
  } catch (error) {
    console.error('Error fetching JSON:', error);
    return null;
  }
}

// 异步函数用于将获取到的版本号注入到 .env 文件中
async function injectVersionToEnv () {
  const webVersion = await getWebVersion();
  if (webVersion) {
    try {
      // 读取 .env 文件内容
      let envContent = await fs.readFile(envFile, 'utf8');
      // 使用正则表达式查找并替换 REACT_APP_WEB_VERSION 字段
      const envLines = envContent.split('\n');
      const newEnvLines = envLines.map(line => {
        if (line.startsWith('REACT_APP_WEB_VERSION=')) {
          return `REACT_APP_WEB_VERSION=${webVersion}`;
        }
        return line;
      });
      // 如果 .env 文件中不存在 REACT_APP_WEB_VERSION 字段，则添加该字段
      const hasVersionField = newEnvLines.some(line => line.startsWith('REACT_APP_WEB_VERSION='));
      if (!hasVersionField) {
        newEnvLines.push(`REACT_APP_WEB_VERSION=${webVersion}`);
      }
      // 将修改后的内容写回到 .env 文件中
      await fs.writeFile(envFile, newEnvLines.join('\n'), 'utf8');
      console.log(`Successfully injected REACT_APP_WEB_VERSION=${webVersion} into ${envFile}`);
    } catch (error) {
      console.error('Error writing to .env file:', error);
    }
  }
}

// 执行注入操作
injectVersionToEnv();