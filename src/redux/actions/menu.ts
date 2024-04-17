export const menuActive = (data: any) => ({ type: 'menuActive', data })

// 更新选择菜单
export const setMenuActive = (data: any) => {
  return (dispatch: (arg0: { type: string; data: any }) => void) => {
    dispatch(menuActive(data))
  }
}