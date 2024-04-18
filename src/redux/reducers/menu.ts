/*
 * @Author: zhangda
 * @Date: 2024-04-17 17:48:25
 * @LastEditors: zhangda
 * @LastEditTime: 2024-04-17 17:50:22
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\redux\reducers\menu.ts
 */
export default function menuReducer(
  preState = "home",
  action: { type: string; data: any }
): string {
  const { type, data } = action
  // 根据type进行数据操作
  switch (type) {
    case 'menuActive':
      return data
    default:
      return preState
  }
}
