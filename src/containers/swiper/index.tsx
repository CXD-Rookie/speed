/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 11:20:33
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-07 14:53:16
 * @FilePath: \speed\src\containers\swiper\indeX.tsX
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useRef, useState } from "react";
import { Carousel } from "antd";
import eventBus from '../../api/eventBus'; 
import { useDispatch, useSelector } from "react-redux";
import "./index.scss";
import rightIcon from "@/assets/images/common/you@2x.png";
import leftIcon from "@/assets/images/common/zuo@2x.png";

interface SwiperProps {
  onImageClick: (params: any) => void;
}
interface ImageItem {
  image_url: string;
  params: any;
}

const Swiper: React.FC<SwiperProps> = ({ onImageClick }) => {
  const carouselRef: any = useRef(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  

  useEffect(() => {
    // 初始化时从 localStorage 读取banner数据
    const storedData = JSON.parse(localStorage.getItem("all_data") || "[]");
    setImages(storedData);

    // 监听 eventBus 的 'dataUpdated' 事件
    const handleDataUpdated = (newData: ImageItem[]) => {
      setImages(newData);
    };

    eventBus.on('dataUpdated', handleDataUpdated);

    // 清理工作
    return () => {
      eventBus.off('dataUpdated', handleDataUpdated);
    };
  }, []);

  return (
    <div className="swiper-box">
      <Carousel arrows infinite={false} ref={carouselRef}>
        {images.map(({ image_url, params }, index:any) => (
          <div key={index} onClick={() => onImageClick(params)}>
            <img
              className="imgalt"
              src={"https://cdn.accessorx.com/" + image_url}
              alt={`活动 ${index + 1}`}
            />
          </div>
        ))}
      </Carousel>
      <img
        className="left-btn"
        src={leftIcon}
        width={20}
        height={32}
        alt=""
        onClick={() => carouselRef?.current?.prev()}
      />
      <img
        className="right-btn"
        src={rightIcon}
        width={20}
        height={32}
        alt=""
        onClick={() => carouselRef?.current?.next()}
      />
    </div>
  );
};
export default Swiper;
