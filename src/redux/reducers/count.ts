// reducer是一个纯函数
// 用于创建一个为Count组件服务的reducer，reducer本质就是一个函数
// 函数接收两个参数，分别为之前的状态（preState）动作对象（action）
export default function countReducer(
  preState = 0,
  action: { type: string; data: any }
): number {
  const { type, data } = action
  // 根据type进行数据操作
  switch (type) {
    case 'increment':
      return preState + data
    case 'decrement':
      return preState - data
    default:
      return preState
  }
}
