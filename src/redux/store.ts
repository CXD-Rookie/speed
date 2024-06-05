/*
 * @Author: zhangda
 * @Date: 2024-04-16 14:11:44
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-05 16:37:36
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: \speed\src\redux\store.ts
 */
// 引入api，creatStore用于创建store对象
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // 使用 localStorage 作为默认存储
import rootReducer from './reducers'; // 你的根 reducer

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['accountInfo'] // 仅持久化 accountInfo reducer
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, applyMiddleware(thunk));
const persistor = persistStore(store);

export { store, persistor };

