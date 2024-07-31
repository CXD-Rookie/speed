/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-07-29 11:20:33
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-31 19:23:59
 * @FilePath: \speed\src\containers\swiper\indeX.tsX
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect, useState } from 'react';
import { Carousel } from 'antd';
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAccountInfo } from "@/redux/actions/account-info";
import activePayApi from "@/api/activePay";
import "./index.scss";

interface SwiperProps {
  images: { image_url: string; params: any }[];
  onImageClick: (params: any) => void;
}

const Swiper: React.FC<SwiperProps> = ({ images, onImageClick }) => {
  return (
    <Carousel arrows infinite={false}>
      {images.map(({ image_url, params }, index) => (
        <div className="swiper" key={index} onClick={() => onImageClick(params)}>
          <img className="imgalt" src={'https://cdn.accessorx.com/' + image_url} alt={`活动 ${index + 1}`} />
        </div>
      ))}
    </Carousel>
  );
};
export default Swiper;


