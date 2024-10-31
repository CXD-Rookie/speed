import { 
  START_PATH,
  CURRENCY_EXCHANGE,
  SETTING,
  FEEDBACKPOPUP
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
  } 
};

const modalOpenReducer = (state = initialState, action:any) => {
  switch (action.type) {
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