/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-28 21:16:10
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-02 14:27:26
 * @FilePath: \speed\src\api\pay.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// /pay/qrcode

import { get, post } from "./api";

class PayApi {
  url = process.env.REACT_APP_API_URL;

  getPayTypeList (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/pay/type/list?platform=3`);
  }
  getCommodityList (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/commodity/list?platform=3`);
  }
  getQrCodeUrl (params) {
    // const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/pay/qrcode?cid=${params.cid}&user_id=${params.user_id}&key=${params.key}`);
  }
  getPolling (params) {
    // const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/pay/order/qrcode_key/polling?platform=3&key=${params.key}`);
  }

  getCommodityInfo (params) {
    // const queryString = new URLSearchParams(params).toString();
    console.log(params, "params------------")
    return get(`${this.url}/commodity/info?platform=3&cid=${params}`);
  }
  getfirst_purchase_renewed_discount (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/commodity/first_purchase_renewed_discount?platform=3`);
  }
  UnpaidOrder (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/pay/unpaid_order?platform=3`);
  }

  // 使用兑换码
  redeemPick (params) {
    return post(`${this.url}/redeem_code/pick_up?platform=3`, params);
  }
}

const payApi = new PayApi();

export default payApi;