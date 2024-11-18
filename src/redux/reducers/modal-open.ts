import { 
  START_PATH,
  CURRENCY_EXCHANGE,
  SETTING,
  FEEDBACKPOPUP,
  NEWUSER,
  APPCLOSE,
  DRAWVIPACTIVE,
  FIRSTPAYRP,
  PAY,
  MINORTYPE,
  BINDPHONE,
  UPDATE_VERSION,
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
  drawVipActive: { // 领取会员有效期弹窗
    open: false,
    value: {},
  },
  firstPayRP: { // 首次支付弹窗
    open: false,
    type: ""
  },
  payState: { // 支付弹窗
    open: false,
    couponValue: {},
  },
  minorState: { // 三方登录 实名认证等UI确定弹窗
    open: false,
    type: "",
  },
  bindState: { // 第三方手机绑定类型弹窗
    open: false,
    type: "",
  },
  versionState: {
    open: false, // 弹窗开关
    type: "", // 升级类型, 如果存在值则代表有可升级的版本
  }, // 发现新版本弹窗
};

const modalOpenReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case UPDATE_VERSION:
      return {
        ...state,
        versionState: {
          ...state?.versionState,
          ...action.payload,
        },
      };
    case BINDPHONE:
      return {
        ...state,
        bindState: {
          ...state?.bindState,
          ...action.payload,
        },
      };
    case MINORTYPE:
      return {
        ...state,
        minorState: {
          ...state?.minorState,
          ...action.payload,
        },
      };
    case PAY:
      return {
        ...state,
        payState: {
          ...state?.payState,
          ...action.payload,
        },
      };
    case FIRSTPAYRP:
      return {
        ...state,
        firstPayRP: {
          ...state?.firstPayRP,
          ...action.payload,
        },
      };
    case DRAWVIPACTIVE:
      return {
        ...state,
        drawVipActive: {
          ...state?.drawVipActive,
          ...action.payload,
        },
      };
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
          ...state?.feedbackPopup,
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