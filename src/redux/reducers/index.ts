/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-21 20:47:13
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-05-22 14:33:45
 * @FilePath: \speed\src\redux\reducers\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { combineReducers } from 'redux';

import countReducer from './count';
import tigerReducer from './tiger';
import menuReducer from './menu';
import searchReducer from './search';  // 导入 search reducer

// 合并所有 reducers
export default combineReducers({
  count: countReducer,
  tigerArr: tigerReducer,
  menu: menuReducer,
  search: searchReducer,  // 添加 search reducer
});

