/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 11:20:33
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-01 11:21:18
 * @FilePath: \speed\src\containers\swiper\indeX.tsX
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useRef } from "react";
import { Carousel } from "antd";

import "./index.scss";
import rightIcon from "@/assets/images/common/you@2x.png";
import leftIcon from "@/assets/images/common/zuo@2x.png";

interface SwiperProps {
  images: { image_url: string; params: any }[];
  onImageClick: (params: any) => void;
}

const Swiper: React.FC<SwiperProps> = ({ images, onImageClick }) => {
  const carouselRef: any = useRef(null);

  useEffect(() => {
    console.log(images, "----------------images");
  }, [images]);

  return (
    <div className="swiper-box">
      <Carousel arrows infinite={false} ref={carouselRef}>
        {images.map(({ image_url, params }, index) => (
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
