/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 11:20:33
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-21 11:43:56
 * @FilePath: \speed\src\containers\swiper\indeX.tsX
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { Fragment, useEffect, useRef, useState, useCallback } from "react";
import { Carousel } from "antd";

import "./index.scss";
import eventBus from "../../api/eventBus";

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

  // 使用 useCallback 包装 onImageClick 以避免不必要的重新创建
  const handleClick = useCallback((params: any) => {
    if (params === "0") {
      (window as any).NativeApi_OpenBrowser("https://qm.qq.com/q/KzaRJZbj8I");
    }
    onImageClick(params);
  }, []);

  return (
    <div className="swiper-box">
      <Carousel
        arrows
        infinite={true}
        autoplay={true}
        autoplaySpeed={5000}
        dots={images?.length > 1}
        ref={carouselRef}
      >
        {images.map(({ image_url, params }, index: any) => (
          <div key={index} onClick={() => handleClick(params)}>
            <img
              className="imgalt"
              src={"https://cdn.accessorx.com/" + image_url}
              alt={`活动 ${index + 1}`}
            />
          </div>
        ))}
      </Carousel>
      {images?.length > 1 && (
        <Fragment>
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
        </Fragment>
      )}
    </div>
  );
};
export default Swiper;
