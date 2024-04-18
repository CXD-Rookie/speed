import { combineReducers } from 'redux';

import countReducer from './count';
import tigerReducer from './tiger';
import menuReducer from "./menu";

// 合并所有reducers
export default combineReducers({
  count: countReducer,
  tigerArr: tigerReducer,
  menu: menuReducer,
})
