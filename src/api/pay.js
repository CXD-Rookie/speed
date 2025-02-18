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

  getPayTypeList () {
    return get(`${this.url}/pay/type/list?platform=3`);
  }

  getCommodityList (params) {
    return get(`${this.url}/commodity/list?platform=3`, params);
  }

  getPolling (params) {
    return get(`${this.url}/pay/order/qrcode_key/polling?platform=3&key=${params.key}`);
  }

  getCommodityInfo (params) {
    return get(`${this.url}/commodity/info?platform=3&cid=${params}`);
  }

  getfirst_purchase_renewed_discount () {
    return get(`${this.url}/commodity/first_purchase_renewed_price?platform=3`);
  }

  UnpaidOrder () {
    return get(`${this.url}/pay/unpaid_order?platform=3`);
  }

  // 使用兑换码
  redeemPick (params) {
    return post(`${this.url}/redeem_code/pick_up?platform=3`, params);
  }

  // 兑换码记录
  redeemList (params) {
    return get(`${this.url}/redeem_code/use_list?platform=3`, params);
  }
}

const payApi = new PayApi();

export default payApi;