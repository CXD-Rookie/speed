// actions/version.ts
export const SET_VERSION = 'SET_VERSION';

export const setVersion = (version: any) => ({
  type: SET_VERSION,
  payload: version,
});
