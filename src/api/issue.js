import { get,post } from "./api";

class Feedback {

  url = `https://rm-mga-dev.yuwenlong.cn/api/v1`;

  feedback_type (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/feedback_type?platform=3`);
  }

  feedback_upload_image (params) {
    const queryString = new URLSearchParams(params).toString();
    return get(`${this.url}/feedback_upload_image?${queryString}`);
  }

  feedback (parmas) {
    return post(
      `${this.url}/feedback`, parmas
    );
  }
}

const feedbackApi = new Feedback();

export default feedbackApi;