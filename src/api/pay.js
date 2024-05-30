// /pay/qrcode

import { get,post } from "./api";

class PayApi {

  url = `https://rm-mga-dev.yuwenlong.cn/api/v1`;

  getPayTypeList(params){
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/pay/type/list?platform=3`);
  }
  getCommodityList (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/commodity/list?platform=3`);
  }
  getQrCodeUrl(params) {
    // const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/pay/qrcode?cid=${params.cid}&user_id=${params.user_id}&key=${params.key}`);
  }
  getPolling(params) {
    // const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/pay/order/qrcode_key/polling?platform=3&key=${params.key}`);
  }


}

const payApi = new PayApi();

export default payApi;