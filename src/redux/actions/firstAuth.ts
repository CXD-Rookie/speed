/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-31 14:29:50
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-31 14:31:15
 * @FilePath: \speed\src\redux\actions\firstAuth.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// actions/version.ts
export const SET_FIRSTAUTH = 'SET_FIRSTAUTH';

export const setFirstAuth = (auth: any) => ({
  type: SET_FIRSTAUTH,
  payload: auth,
});
