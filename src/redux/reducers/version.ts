// reducers/gameList.ts
import { SET_VERSION } from '../actions/version';

const initialState = {
  version: {},
};

const versionReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_VERSION:
      return {
        ...state,
        version: action.payload,
      };
    default:
      return state;
  }
};

export default versionReducer;
