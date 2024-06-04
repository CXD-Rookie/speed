/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { useDropzone, Accept } from "react-dropzone";
import issueApi from "@/api/issue";
import "./index.scss";

interface FeedbackType {
  id: string;
  value: string;
}

interface FeedbackTypeProps {
  showIssueModal?: boolean;
  onClose?: () => void;
}

const FeedbackPopup: React.FC<FeedbackTypeProps> = (props) => {
  const { showIssueModal = false, onClose = () => {} } = props;

  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchFeedbackType();
  }, []);

  const handleButtonClick = (typeId: any) => {
    setSelectedType(typeId);
  };

  const fetchFeedbackType = async () => {
    try {
      const res = await issueApi.feedback_type();
      setFeedbackTypes(res.data.types);
    } catch (error) {
      console.error("Error fetching feedback types:", error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png"] } as Accept,
    onDrop: (acceptedFiles) => {
      if (uploadedImages.length + acceptedFiles.length > 3) {
        alert("最多只能上传 3 张图片");
        return;
      }
      setUploadedImages([...uploadedImages, ...acceptedFiles]);
    },
  });

  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
  };

  const handleSubmit = async () => {
    if (!selectedType || !description) {
      alert("请选择问题类型并填写问题描述");
      return;
    }

    const imageUploadPromises = uploadedImages.map((file) => {
      const formData = new FormData();
      formData.append("file", file); // 确保文件名也传递

      return issueApi.feedback_upload_image(formData);
    });

    try {
      const imageUploadResponses = await Promise.all(imageUploadPromises);
      const imageUrls = imageUploadResponses.map(
        (response) => response.data.url
      );

      setUploadedImageUrls(imageUrls);

      await issueApi.feedback({
        feedback_type: selectedType,
        content: description,
        image_url: imageUrls,
        contact_way: contact,
      });

      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  useEffect(() => {
    window.addEventListener("message", function (event) {
      if (event.origin !== "process.env.REACT_APP_ISSUE_IFRAME_URL") {
        return;
      }

      // 处理来自 iframe 的消息
      const message = event.data;
      console.log(message);
      if (message.type === "GREETING") {
        onClose();
      }
    });
  }, []);

  return (
    <Modal
      className="overlay"
      open={showIssueModal}
      onCancel={onClose}
      title="问题反馈"
      width={"67.6vw"}
      centered
      maskClosable={false}
      footer={null}
    >
      <iframe src="process.env.REACT_APP_ISSUE_IFRAME_URL/issue.html"></iframe>
      {/* <div className="feedback-popup">
        <div className="type-buttons" id="btnAll">
          <div className="matter-type">
            <span>*</span>
            问题类型
          </div>
          {feedbackTypes.map((type) => (
            <button
              className={`type-btn ${
                selectedType === type.id ? "selected" : ""
              }`}
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
        <div className="layui-upload">
          <blockquote className="layui-elem-quote layui-quote-nm">
            <div className="layui-upload-list" id="upload-demo-preview">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>拖拽文件到此处，或点击选择文件</p>
              </div>
            </div>
          </blockquote>
          <div id="preview" className="preview">
            {uploadedImages.map((file, index) => (
              <div key={index}>
                <img src={URL.createObjectURL(file)} alt="preview" />
                <button onClick={() => handleRemoveImage(index)}>X</button>
              </div>
            ))}
          </div>
        </div>
        <div className="contact">
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
            <div id="contact-input-num" className="contact-input-num">
              {contact.length}/50
            </div>
          </div>
        </div>
        <button className="submit-btn" onClick={handleSubmit}>
          提交
        </button>
        {showSuccess && (
          <div id="popup-success" className="popup-success">
            <img
              className="popup-success-img"
              src="assets/cloture_write.svg"
              width="12"
              height="12"
              alt="success"
            />
            <div className="success-text">您的问题已反馈</div>
            <button
              className="success-btn"
              onClick={() => setShowSuccess(false)}
            >
              确定
            </button>
          </div>
        )}
      </div> */}
    </Modal>
  );
};

export default FeedbackPopup;
