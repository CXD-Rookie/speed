/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-13 14:37:30
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-05-21 18:25:12
 * @FilePath: \speed\src\api\login.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { get, post } from "./api";

class LoginApi {
  url = `https://rm-mga-dev.yuwenlong.cn/api/v1`
  // url = `/api/v1`

  getPhoneCode (parmas) {
    return post(
      `${this.url}/send_sms/${parmas?.phone}`, { scene_id: parmas?.scene_id, captcha_verify_param: parmas?.captcha_verify_param }
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
}

const loginApi = new LoginApi();

export default loginApi;