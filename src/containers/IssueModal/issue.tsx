import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Button, Input, message, Modal } from 'antd';
import { UploadOutlined,CloseOutlined } from '@ant-design/icons';
import feedbackApi from "../../api/issue";
import './FeedbackForm.scss'; // 自定义的样式文件

interface FeedbackFormProps {
  onClose: () => void; // 用于关闭表单的回调函数
  defaultInfo?: string | null;
}

// 配置全局 message 样式
message.config({
  top: 100, // 距离顶部的距离，默认是 24px
  duration: 2, // 自动关闭的延时，单位秒，默认 3 秒
  maxCount: 1, // 最大显示数，超过限制时，最早的消息会被自动关闭，默认值为 1
});

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onClose,defaultInfo }) => {
  const [types, setTypes] = useState<any[]>([]); // 反馈类型
  const [selectedType, setSelectedType] = useState<number | null>(null); // 当前选择的问题类型
  const [description, setDescription] = useState<string>(''); // 问题描述
  const [contact, setContact] = useState<string>(''); // 联系方式
  const [images, setImages] = useState<any[]>([]); // 上传的图片文件列表

  useEffect(() => {
    fetchFeedbackTypes(); // 组件加载时获取反馈类型
  }, []);

  useEffect(() => {
    if (defaultInfo) {
      setDescription(defaultInfo);
    }
  }, [defaultInfo]);

  useEffect(() => {
    // 如果有 defaultInfo 且等于 "缺少游戏"，自动选择对应的按钮
    if (defaultInfo) {
      const missingGameType = types.find((type) => type.value === "缺少游戏");
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
      console.log(types);
    } catch (error) {
      console.error('Failed to fetch feedback types:', error);
    }
  };

  // 处理问题类型选择
  const handleTypeSelect = (typeId: number) => {
    setSelectedType(typeId);
  };

  // 处理问题描述变化
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  // 处理文件上传成功
  const handleUploadSuccess = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`);
      const imageUrl = info.file.response.data.url; // 获取服务器返回的图片 URL
      setImages([...images, { url: imageUrl, uid: info.file.uid }]); // 更新图片列表
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败`);
    }
  };

  // 上传组件中的上传按钮渲染
  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  // 移除上传的图片
  const handleImageRemove = (file: any) => {
    const newImages = images.filter((img) => img.uid !== file.uid);
    setImages(newImages);
  };

  // 检查表单是否填写完整
  const isFormValid = () => {
    return selectedType !== null && description.trim() !== '';
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!isFormValid()) {
      message.error('请选择问题类型并填写问题描述！');
      return;
    }
    const imagesArr: string[] = [];

    images.forEach((image) => {
      let filteredSrc = image.url.replace('https://cdn.accessorx.com/', '');
      imagesArr.push(filteredSrc);
    });

    const params = {
      feedback_type: String(selectedType),
      content: description,
      image_url: imagesArr,
      contact_way: contact, // 你的联系方式
    };

    try {
      const response = await feedbackApi.feedback(JSON.stringify(params));
      console.log('Feedback submitted successfully:', response);
      // 提交成功后的处理逻辑
      Modal.success({
        title: '反馈成功',
        content: '感谢您的反馈，我们会尽快处理！',
        onOk: onClose, // 点击确定后关闭表单
        className: 'popup-success', // 添加自定义类名
        okText: '确定', // 修改按钮文本
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      // message.error('反馈提交失败，请稍后重试！');
    }
  };

  // 自定义上传逻辑
  const customRequest = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${feedbackApi.url}/feedback_upload_image?platform=3`, file, {
        headers: {
          'Content-Type': 'multipart/form-data',
          user_token: JSON.parse(localStorage.getItem('token') || ''), // 根据实际情况传递 token
        },
      });

      // 处理上传成功的逻辑
      console.log('上传成功：', response.data.data.url);
      // message.success('上传成功');
      const imageUrl = `${'https://cdn.accessorx.com/'}` + response.data.data.url; // 获取服务器返回的图片 URL
      setImages((prevImages) => [...prevImages, { url: imageUrl, uid: file.uid }]); // 更新图片列表
      // onSuccess(response.data, file);
    } catch (error) {
      // 处理上传失败的逻辑
      console.error('上传失败：', error);
    }
  };

  const itemRender = (originNode: any, file: any, fileList: any, actions: any) => {
    return (
      <div style={{ position: 'relative', display: 'inline-block', width: '4.5vw', height: '4.5vw', margin: '0px' }}>
        <img
          src={file.thumbUrl || file.url}
          alt={file.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <CloseOutlined
          onClick={() => handleImageRemove(file)}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            cursor: 'pointer',
            color: 'red',
            background: 'white',
            borderRadius: '50%',
            padding: '2px',
            fontSize: '12px',
          }}
        />
      </div>
    );
  };

  const beforeUpload = (file: any) => {
    const isValidFormat = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'].includes(file.type);
    if (!isValidFormat) {
      message.error({
        content: '抱歉，图片格式不支持，请上传JPG/JPEG/PNG/GIF/BMP格式的图片。',
        duration: 2,
        style: {
          marginTop: '20vh',
        },
      });
      return false;
    }
    const isLessThan5MB = file.size / 1024 / 1024 < 5;
    if (!isLessThan5MB) {
      message.error({
        content: '抱歉，图片尺寸过大（图片大小必须小于5MB），请尝试压缩文件或选择较小文件',
        duration: 2,
        style: {
          marginTop: '20vh',
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
              className={`type-btn ${selectedType === type.id ? 'selected' : ''}`}
              onClick={() => handleTypeSelect(type.id)}
            >
              {type.value}
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
            ></textarea>
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
                {/* <div style={{ marginTop: 8 }}></div> */}
              </div>
            )}
          </Upload>
        </div>
        <div className="contact">
          <div className="matter-type">
            联系方式（选填）
            
          </div>
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
        <Button className="submit-btn" onClick={handleSubmit} disabled={!isFormValid()}>
          提交
        </Button>
      </div>
    </div>
  );
};

export default FeedbackForm;