import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone, Accept } from 'react-dropzone';
import issueApi from "@/api/issue";
import "./index.scss"
interface FeedbackType {
  id: string;
  value: string;
}

const FeedbackPopup: React.FC = () => {
  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);


  useEffect(() => {
    fetch_Feedback_type()
  }, []);

  const handleButtonClick = (typeId : any) => {
    setSelectedType(typeId);
  };
  const fetch_Feedback_type = async () => {
    try {
      let res = await issueApi.feedback_type();
      setFeedbackTypes(res.data.types);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] } as Accept,
    onDrop: (acceptedFiles) => {
      if (uploadedImages.length + acceptedFiles.length > 3) {
        alert('最多只能上传 3 张图片');
        return;
      }
      setUploadedImages([...uploadedImages, ...acceptedFiles]);
    }
  });

  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
  };

  const handleSubmit = async () => {
    if (!selectedType || !description) {
      alert('请选择问题类型并填写问题描述');
      return;
    }

    const imageUploadPromises = uploadedImages.map(file => {
      const formData = new FormData();
      formData.append('file', file);
      return axios.post('https://tc-js.yuwenlong.cn/api/v1/feedback_upload_image?platform=3', formData);
    });

    try {
      const imageUploadResponses = await Promise.all(imageUploadPromises);
      const imageUrls = imageUploadResponses.map(response => response.data.url);

      setUploadedImageUrls(imageUrls);

      await axios.post('https://tc-js.yuwenlong.cn/api/v1/feedback', {
        feedback_type: selectedType,
        content: description,
        image_url: imageUrls,
        contact_way: contact
      });

      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <div className="overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0, 0, 0, 0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
      <div className="feedback-popup" >
        <div className="popup-header" >
          <span>问题反馈</span>
          <img src="assets/cloture_write.svg"  />
        </div>
        <div className="type-buttons" id="btnAll">
          <div className="matter-type">
            <span>*</span>
            问题类型
          </div>
          {feedbackTypes.map(type => (
          <button
            className={`type-btn ${selectedType === type.id ? 'selected' : ''}`}
            key={type.id}
            onClick={() => handleButtonClick(type.id)}
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
              id="description"
              className="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="请描述您所遇到的问题，上传图片格式支持JPG/PNG/JPEG，大小<5MB"
            />
            <div id="description-input-num" className="description-input-num">
              {description.length}/500
            </div>
          </div>
        </div>
        <div className="layui-upload" >
          <blockquote className="layui-elem-quote layui-quote-nm" >
            <div className="layui-upload-list" id="upload-demo-preview">
              <div {...getRootProps()} >
                <input {...getInputProps()} />
                <p>拖拽文件到此处，或点击选择文件</p>
              </div>
            </div>
          </blockquote>
          <div id="preview" className="preview" >
            {uploadedImages.map((file, index) => (
              <div key={index} >
                <img src={URL.createObjectURL(file)} alt="preview"  />
                <button onClick={() => handleRemoveImage(index)}>X</button>
              </div>
            ))}
          </div>
        </div>
        <div className="contact" >
          <div>联系方式（选填）</div>
          <div className="contact-input-box">
            <input
              id="contact-input"
              className="contact-input"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value.slice(0, 50))}
              placeholder="手机/邮箱/微信"
              
            />
            <div id="contact-input-num" className="contact-input-num" >
              {contact.length}/50
            </div>
          </div>
        </div>
        <button className="submit-btn" onClick={handleSubmit} >提交</button>
        {showSuccess && (
          <div id="popup-success" className="popup-success" >
            <img className="popup-success-img" src="assets/cloture_write.svg" width="12" height="12" alt="success" />
            <div className="sucess-text">您的问题已反馈</div>
            <button className="sucess-btn" onClick={() => setShowSuccess(false)} >确定</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPopup;
