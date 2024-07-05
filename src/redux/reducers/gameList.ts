// reducers/gameList.ts
import { SET_GAME_LIST } from '../actions/gameList';

const initialState = {
  gameList: [],
};

const gameListReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_GAME_LIST:
      return {
        ...state,
        gameList: action.payload,
      };
    default:
      return state;
  }
};

export default gameListReducer;
