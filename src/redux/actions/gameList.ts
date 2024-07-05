// actions/gameList.ts
export const SET_GAME_LIST = 'SET_GAME_LIST';

export const setGameList = (gameList: any[]) => ({
  type: SET_GAME_LIST,
  payload: gameList,
});
