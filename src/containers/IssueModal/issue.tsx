import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Button, Input, message, Modal } from 'antd';
import { UploadOutlined,CloseOutlined } from '@ant-design/icons';
import feedbackApi from "../../api/issue";
import './FeedbackForm.scss'; // 自定义的样式文件

interface FeedbackFormProps {
    onClose: () => void; // 用于关闭表单的回调函数
  }
  
  const FeedbackForm: React.FC<FeedbackFormProps> = ({ onClose }) => {
    const [types, setTypes] = useState<any[]>([]); // 反馈类型
    const [selectedType, setSelectedType] = useState<number | null>(null); // 当前选择的问题类型
    const [description, setDescription] = useState<string>(''); // 问题描述
    const [contact, setContact] = useState<string>(''); // 联系方式
    const [images, setImages] = useState<any[]>([]); // 上传的图片文件列表
  
    useEffect(() => {
      fetchFeedbackTypes(); // 组件加载时获取反馈类型
    }, []);
  
    // 获取反馈类型
    const fetchFeedbackTypes = async () => {
      try {
        const response = await feedbackApi.feedback_type();
        setTypes(response.data.types);
        console.log(types)
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
      setDescription(e.target.value);
    };
  
    // 处理联系方式变化
    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setContact(e.target.value);
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
      const imagesArr: string[] = []
  

    //   formData.append('feedback_type', String(selectedType));
    //   formData.append('content', description);
    //   formData.append('contact_way', contact);
  
      images.forEach((image) => {
        imagesArr.push(image.url);
      });

      const params = {
        'feedback_type': String(selectedType),
        'content': description,
        'image_url': imagesArr,
        'contact_way': contact // 你的联系方式
      };
  
      try {
        const response = await feedbackApi.feedback(JSON.stringify(params))
        console.log('Feedback submitted successfully:', response);
        // 提交成功后的处理逻辑
        Modal.success({
          title: '反馈成功',
          content: '感谢您的反馈，我们会尽快处理！',
          onOk: onClose, // 点击确定后关闭表单
        });
      } catch (error) {
        console.error('Failed to submit feedback:', error);
        message.error('反馈提交失败，请稍后重试！');
      }
    };
  
    // 自定义上传逻辑
    const customRequest = async ( file:any) => {
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
        message.success('上传成功');
        const imageUrl = `${'https://cdn.accessorx.com/'}`+response.data.data.url; // 获取服务器返回的图片 URL
        setImages((prevImages) => [...prevImages, { url: imageUrl, uid: file.uid }]); // 更新图片列表
        // onSuccess(response.data, file);
      } catch (error) {
        // 处理上传失败的逻辑
        console.error('上传失败：', error);
        message.error('上传失败');
        // onError(error);
      }
    };
  
    const itemRender = (originNode: any, file: any, fileList: any, actions: any) => {
      return (
        <div style={{ position: 'relative', display: 'inline-block', width: '7.5vw', height: '7.5vw',margin:'0px' }}>
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
              fontSize: '12px'
            }}
          />
        </div>
      );
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
              ></textarea>
            </div>
          </div>
          <div className="layui-upload" id="uploadButton">
            <Upload
              customRequest={customRequest}
              listType="picture-card"
              itemRender={itemRender}
              fileList={images}
              onRemove={(file) => {
                const newImages = images.filter((img) => img.uid !== file.uid);
                setImages(newImages);
              }}
            >
              {images.length < 9 && (
                <div>
                  <label id="ID-upload-demo-btn-2"><i className="fas fa-plus"></i></label>
                  <div style={{ marginTop: 8 }}></div>
                </div>
              )}
            </Upload>
          </div>
          <div className="contact">
            <div>联系方式（选填）</div>
            <div className="contact-input-box">
              <Input
                className="contact-input"
                type="text"
                placeholder="手机/邮箱/微信"
                value={contact}
                onChange={handleContactChange}
              />
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