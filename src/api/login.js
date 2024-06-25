/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-13 14:37:30
 * @LastEditors: zhangda
 * @LastEditTime: 2024-06-25 16:56:52
 * @FilePath: \speed\src\api\login.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { get, post, put } from "./api";

class LoginApi {
  url = `https://test-api.accessorx.com/api/v1`
  url1 = process.env.REACT_APP_API_URL

  // getPhoneCode (parmas) {
  //   return post(
  //     `${this.url}/send_sms/${parmas?.phone}`, { scene_id: parmas?.scene_id, captcha_verify_param: parmas?.captcha_verify_param }
  //   );
  // }

  getPhoneCode (parmas) {
    return get(
      `${this.url}/send_sms/${parmas?.phone}?ticket=${parmas.ticket}&randstr=${parmas.randstr}`
    );
  }

  phoneCodeLogin (parmas) {
    return post(
      `${this.url}/login_phone_code`, parmas
    );
  }

  authenticationUser (parmas) {
    return post(
      `${this.url}/user/authentication?platform=${parmas?.platform}`, parmas
    );
  }

  loginOut (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/user/loginout?platform=3`);
  }

  userInfo (params) {
    return get(`${this.url}/user/info?platform=3`);
  }

  thirdPartyLogin (params) {
    return post(`${this.url}/third_party/user_login`, params)
  }

  updatePhone (params) {
    return put(`${this.url}/user/update_phone?platform=3`, params)
  }

  sendSmsCode (params) {
    return get(`${this.url}/user/send_sms`, params);
  }

  fetchBindThirdInfo (params) {
    return get(`${this.url}/user/select/bind`, params);
  }

  verifyPhone (params) {
    return post(`${this.url}/user/check/phone?platform=3`, params);
  }
}

const loginApi = new LoginApi();

export default loginApi;