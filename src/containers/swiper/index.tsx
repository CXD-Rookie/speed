/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 11:20:33
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-30 11:25:12
 * @FilePath: \speed\src\containers\swiper\indeX.tsX
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from 'react';
import { Carousel } from 'antd';
import "./index.scss";

// 模拟接口函数
const fetchBannerImages = (): Promise<{ src: string; type: number }[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { src: "https://cdn.accessorx.com/web/assets/banner1@2x.png", type: 1 },
        { src: "https://cdn.accessorx.com/web/assets/banner2@2x.png", type: 2 },
        { src: "https://cdn.accessorx.com/web/assets/banner3@2x.png", type: 3 },
      ]);
    }, 1000); // 模拟网络延迟
  });
};

interface SwiperProps {
  onImageClick: (type: number) => void;
}

const Swiper: React.FC<SwiperProps> = ({ onImageClick }) => {
  const [images, setImages] = useState<{ src: string; type: number }[]>([]);

  useEffect(() => {
    // 获取图片数据
    fetchBannerImages().then((data) => {
      setImages(data);
    });
  }, []);

  return (
    <Carousel arrows infinite={false}>
      {images.map(({ src, type }, index) => (
        <div key={index} onClick={() => onImageClick(type)}>
          <img className="imgalt" src={src} alt={`活动 ${index + 1}`} />
        </div>
      ))}
    </Carousel>
  );
};

export default Swiper;


