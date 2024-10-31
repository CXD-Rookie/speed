// 比较版本大小
function compareVersions (version1= "", version2 = "") {
  // 将版本号按点号分割成数组
  const parts1 = version1.split(".").map(Number);
  const parts2 = version2.split(".").map(Number);

  // 获取最长的版本号长度
  const maxLength = Math.max(parts1.length, parts2.length);

  // 循环比较每个部分
  for (let i = 0; i < maxLength; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) {
      return false; // 如果前者大于后者版本，返回 false
    } else if (num1 < num2) {
      return true; // 如果前者小于后者版本，返回 true
    }
  }

  // 如果版本号完全相等，返回 false
  return false;
}

export {
  compareVersions,
}