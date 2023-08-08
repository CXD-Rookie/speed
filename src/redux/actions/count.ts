export const increment = (data: any) => ({ type: 'increment', data })
export const decrement = (data: any) => ({ type: 'decrement', data })

// 模拟异步操作
export const incrementAsync = (data: any, delay: number) => {
  return (dispatch: (arg0: { type: string; data: any }) => void) => {
    setTimeout(() => {
      dispatch(increment(data))
    }, delay)
  }
}
