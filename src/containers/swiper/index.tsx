/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 11:20:33
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-29 16:34:12
 * @FilePath: \speed\src\containers\swiper\indeX.tsX
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from 'react';
import { Carousel } from 'antd';
import "./index.scss";

// 模拟接口函数
const fetchBannerImages = (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        "https://cdn.accessorx.com/web/assets/banner1@2x.png",
        "https://cdn.accessorx.com/web/assets/banner2@2x.png",
        "https://cdn.accessorx.com/web/assets/banner3@2x.png",
      ]);
    }, 1000); // 模拟网络延迟
  });
};

interface SwiperProps {
  onImageClick: () => void;
}

const Swiper: React.FC<SwiperProps> = ({ onImageClick }) => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // 获取图片数据
    fetchBannerImages().then((data) => {
      setImages(data);
    });
  }, []);

  return (
    <Carousel arrows infinite={false}>
      {images.map((src, index) => (
        <div key={index} onClick={onImageClick}>
          <img className="imgalt" src={src} alt={`活动 ${index + 1}`} />
        </div>
      ))}
    </Carousel>
  );
};

export default Swiper;

