import React, { useState, useEffect } from "react";
import { Upload, Button, Input, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import axios from "axios";
import feedbackApi from "../../api/issue";
import "./FeedbackForm.scss"; // 自定义的样式文件
import tickIcon from "@/assets/images/common/tick.png";

interface FeedbackFormProps {
  onClose: () => void; // 用于关闭表单的回调函数
  defaultInfo?: string | null;
  setIssueOpen: (value: boolean) => void;
}

// 配置全局 message 样式
message.config({
  top: 100, // 距离顶部的距离，默认是 24px
  duration: 2, // 自动关闭的延时，单位秒，默认 3 秒
  maxCount: 1, // 最大显示数，超过限制时，最早的消息会被自动关闭，默认值为 1
});

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  defaultInfo,
  setIssueOpen,
}) => {
  const [types, setTypes] = useState<any[]>([]); // 反馈类型
  const [selectedType, setSelectedType] = useState<number | null>(null); // 当前选择的问题类型
  const [description, setDescription] = useState<string>(""); // 问题描述
  const [contact, setContact] = useState<string>(""); // 联系方式
  const [images, setImages] = useState<any[]>([]); // 上传的图片文件列表

  useEffect(() => {
    fetchFeedbackTypes(); // 组件加载时获取反馈类型

    return () => {
      setTypes([]);
      setSelectedType(null);
      setDescription("");
      setContact("");
      setImages([]);
    };
  }, []);

  useEffect(() => {
    if (defaultInfo && defaultInfo !== "没有找到区服") {
      setDescription(defaultInfo);
    }
  }, [defaultInfo]);

  useEffect(() => {
    // 如果有 defaultInfo 且等于 "缺少游戏"，自动选择对应的按钮
    if (defaultInfo) {
      const missingGameType = types.find(
        (type) => type.value === "缺少游戏/区服"
      );
      if (missingGameType) {
        handleTypeSelect(missingGameType.id);
      }
    }
  }, [defaultInfo, types]);

  // 获取反馈类型
  const fetchFeedbackTypes = async () => {
    try {
      const response = await feedbackApi.feedback_type();
      setTypes(response.data.types);
    } catch (error) {
      console.error("Failed to fetch feedback types:", error);
    }
  };

  // 处理问题类型选择
  const handleTypeSelect = (typeId: number) => {
    setSelectedType(typeId);
  };

  // 处理问题描述变化
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    if (value.length <= 500) {
      setDescription(value);
    }
  };

  // 处理联系方式变化
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value.length <= 50) {
      setContact(value);
    }
  };

  // 移除上传的图片
  const handleImageRemove = (file: any) => {
    const newImages = images.filter((img) => img.uid !== file.uid);
    setImages(newImages);
  };

  // 检查表单是否填写完整
  const isFormValid = () => {
    return selectedType !== null && description.trim() !== "";
  };

  // 定义验证码js加载错误处理函数
  const loadErrorCallback = () => {
    let appid = "190613711"; // 生成容灾票据或自行做其它处理
    let ticket =
      "terror_1001_" + appid + Math.floor(new Date().getTime() / 1000);

    codeCallback({
      ret: 0,
      randstr: "@" + Math.random().toString(36).substr(2),
      ticket,
      errorCode: 1001,
      errorMessage: "jsload_error",
    });
  };

  // 图形码验证通过回调兑换口令
  const codeCallback = async (captcha_verify_param: any) => {
    try {
      if (captcha_verify_param?.ret !== 0) {
        return;
      }

      if (!isFormValid()) {
        message.error("请选择问题类型并填写问题描述！");
        return;
      }
      const imagesArr: string[] = [];

      images.forEach((image) => {
        let filteredSrc = image.url.replace("https://cdn.accessorx.com/", "");
        imagesArr.push(filteredSrc);
      });

      const params = {
        feedback_type: String(selectedType),
        content: description,
        image_url: imagesArr,
        contact_way: contact, // 你的联系方式
        ticket: captcha_verify_param.ticket,
        randstr: captcha_verify_param.randstr,
      };

      const response = await feedbackApi.feedback(JSON.stringify(params));

      if (response?.error === 0) {
        // 提交成功后的处理逻辑
        setIssueOpen(true);
      } else {
        setIssueOpen(false);
      }
    } catch (error) {
      console.log("验证码错误", error);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      let captcha = new (window as any).TencentCaptcha(
        "190613711",
        codeCallback,
        {
          userLanguage: "zh",
        }
      );

      captcha.show();
    } catch (error) {
      loadErrorCallback();
    }
  };

  // 自定义上传逻辑
  const customRequest = async (file: any) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${feedbackApi.url}/feedback_upload_image?platform=3`,
        file,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            user_token: JSON.parse(localStorage.getItem("token") || ""), // 根据实际情况传递 token
          },
        }
      );

      // 处理上传成功的逻辑
      console.log("上传成功：", response.data.data.url);
      // message.success('上传成功');
      const imageUrl =
        `${"https://cdn.accessorx.com/"}` + response.data.data.url; // 获取服务器返回的图片 URL
      setImages((prevImages) => [
        ...prevImages,
        { url: imageUrl, uid: file.uid },
      ]); // 更新图片列表
      // onSuccess(response.data, file);
    } catch (error) {
      // 处理上传失败的逻辑
      console.error("上传失败：", error);
    }
  };

  const itemRender = (
    originNode: any,
    file: any,
    fileList: any,
    actions: any
  ) => {
    return (
      <div
        style={{
          position: "relative",
          display: "inline-block",
          width: "4.5vw",
          height: "4.5vw",
          margin: "0px",
        }}
      >
        <img
          src={file.thumbUrl || file.url}
          alt={file.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <CloseOutlined
          onClick={() => handleImageRemove(file)}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            cursor: "pointer",
            color: "red",
            background: "white",
            borderRadius: "50%",
            padding: "2px",
            fontSize: "12px",
          }}
        />
      </div>
    );
  };

  const beforeUpload = (file: any) => {
    const isValidFormat = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
    ].includes(file.type);
    if (!isValidFormat) {
      message.error({
        content: "抱歉，图片格式不支持，请上传JPG/JPEG/PNG/GIF/BMP格式的图片。",
        duration: 2,
        style: {
          marginTop: "20vh",
        },
      });
      return false;
    }
    const isLessThan5MB = file.size / 1024 / 1024 < 5;
    if (!isLessThan5MB) {
      message.error({
        content:
          "抱歉，图片尺寸过大（图片大小必须小于5MB），请尝试压缩文件或选择较小文件",
        duration: 2,
        style: {
          marginTop: "20vh",
        },
      });
      return false;
    }

    return true;
  };

  return (
    <div className="overlay">
      <div className="feedback-popup">
        <div className="matter-type">
          <span>*</span>
          问题类型
        </div>
        <div className="type-buttons" id="btnAll">
          {types.map((type) => (
            <button
              key={type.id}
              className={`type-btn ${
                selectedType === type.id ? "selected" : ""
              }`}
              onClick={() => handleTypeSelect(type.id)}
            >
              {type.value}
              {selectedType === type.id && (
                <img className="tick" src={tickIcon} alt="" />
              )}
            </button>
          ))}
        </div>
        <div className="matter-description">
          <div className="matter-text">
            <span>*</span>
            问题描述
          </div>
          <div className="description-input-box">
            <textarea
              className="description"
              placeholder="请描述您所遇到的问题，上传图片格式支持JPG/JPEG/PNG/GIF/BMP，大小<5MB"
              onChange={handleDescriptionChange}
              value={description}
            />
            <span className="char-count">{description.length}/500</span>
          </div>
        </div>
        <div className="layui-upload" id="uploadButton">
          <Upload
            customRequest={customRequest}
            listType="picture-card"
            itemRender={itemRender}
            beforeUpload={beforeUpload}
            fileList={images}
            onRemove={(file) => {
              const newImages = images.filter((img) => img.uid !== file.uid);
              setImages(newImages);
            }}
          >
            {images.length < 9 && (
              <div>
                <label id="ID-upload-demo-btn-2">
                  <i className="fas fa-plus"></i>
                </label>
              </div>
            )}
          </Upload>
        </div>
        <div className="contact">
          <div className="matter-type">联系方式（选填）</div>
          <div className="contact-input-box">
            <Input
              className="contact-input"
              type="text"
              placeholder="手机/邮箱/微信"
              value={contact}
              onChange={handleContactChange}
            />
            <span className="char-count-mobile">{contact.length}/50</span>
          </div>
        </div>
        {/*
        <Button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!isFormValid()}
        >
          提交
        </Button>*/}
        <Button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!isFormValid()}
        >
          提交
        </Button>
      </div>
    </div>
  );
};

export default FeedbackForm;
