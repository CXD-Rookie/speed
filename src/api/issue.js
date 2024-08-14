/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-05-27 11:19:48
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-06-18 18:46:25
 * @FilePath: \speed\src\api\issue.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { get, post } from "./api";

class Feedback {

  url = process.env.REACT_APP_API_URL;

  feedback_type () {
    return get(`${this.url}/feedback_type?platform=3`);
  }

  feedback_upload_image (params) {
    return post(`${this.url}/feedback_upload_image?platform=3`, params);
  }

  feedback (parmas) {
    return post(
      `${this.url}/feedback?platform=3`, parmas
    );
  }
}

const feedbackApi = new Feedback();

export default feedbackApi;