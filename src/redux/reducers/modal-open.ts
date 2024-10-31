import { 
  START_PATH,
  CURRENCY_EXCHANGE,
  SETTING,
  FEEDBACKPOPUP,
  NEWUSER,
  APPCLOSE
} from "../actions/modal-open";

const initialState = {
  startPathOpen: false, // 启动路径开关
  currencyOpen: false, // 口令兑换开关
  setting: { // 设置开关传递信息
    settingOpen: false,
    type: "default",
  },
  feedbackPopup: { // 问题反馈
    open: false,
    defaultInfo: "",
  },
  newUserOpen: false, // 新用户弹窗
  appCloseOpen: false, // app关闭窗口设置提醒
};

const modalOpenReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case APPCLOSE:
      return {
        ...state,
        appCloseOpen: action.payload,
      };
    case NEWUSER:
      return {
        ...state,
        newUserOpen: action.payload,
      };
    case FEEDBACKPOPUP:
      return {
        ...state,
        feedbackPopup: {
          ...state?.setting,
          ...action.payload,
        },
      };
    case SETTING:
      return {
        ...state,
        setting: {
          ...state?.setting,
          ...action.payload,
        },
      };
    case CURRENCY_EXCHANGE:
      return {
        ...state,
        currencyOpen: action.payload,
      };
    case START_PATH:
      return {
        ...state,
        startPathOpen: action.payload,
      };
    default:
      return state;
  }
}

export default modalOpenReducer;