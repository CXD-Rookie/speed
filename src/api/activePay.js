/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-30 16:49:34
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-06 10:50:25
 * @FilePath: \speed\src\api\activePay.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// /pay/qrcode

import { get, post } from "./api";

class PayApi {

  url = `https://test-api.accessorx.com/api/v1`;

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
  
  getBanner (params) {
    // const queryString = new URLSearchParams(params).toString();
    console.log(params, "params------------")
    return get(`${this.url}/banner/list?platform=3`);
  }
}

const activePayApi = new PayApi();

export default activePayApi;