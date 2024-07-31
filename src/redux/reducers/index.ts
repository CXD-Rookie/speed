/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-21 20:47:13
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-24 20:13:56
 * @FilePath: \speed\src\redux\reducers\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { combineReducers } from 'redux';

import countReducer from './count';
import tigerReducer from './tiger';
import menuReducer from './menu';
import searchReducer from './search';  // 导入 search reducer
import authReducer from './auth';  // 导入 search reducer
import searchEnterReducer from './search-enter';
import accountInfoReducer from './account-info';
import gameListReducer from './gameList'; // 导入新的 reducer
import versionReducer from './version'; // 导入新的 reducer
import firstAuthReducer from './firstAuth'; // 导入新的 reducer
// 合并所有 reducers
export default combineReducers({
  count: countReducer,
  tigerArr: tigerReducer,
  menu: menuReducer,
  search: searchReducer,  // 添加 search reducer
  auth:authReducer,
  searchEnter: searchEnterReducer,
  accountInfo: accountInfoReducer,
  version: versionReducer,
  firstAuth: firstAuthReducer,
});

