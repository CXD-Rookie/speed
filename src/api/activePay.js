/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-30 16:49:34
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-06 10:50:25
 * @FilePath: \speed\src\api\activePay.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// /pay/qrcode

import { get } from "./api";

class PayApi {
  url = process.env.REACT_APP_API_URL + "api/v1";
  
  getBanner () {
    return get(`${this.url}/banner/list?platform=3`);
  }
}

const activePayApi = new PayApi();

export default activePayApi;