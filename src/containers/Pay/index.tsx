import React, { useState,useEffect,useRef } from 'react';
import QRCode from 'qrcode.react';
import './index.scss'

const Modal: React.FC = () => {
  const [jsonData] = useState([
    { price: 10, title: "包年", pricePerMonth: 28, totalPrice: 298 },
    { price: 20, title: "包年", pricePerMonth: 30, totalPrice: 320 },
    { price: 30, title: "包年", pricePerMonth: 32, totalPrice: 340 },
    { price: 40, title: "包年", pricePerMonth: 34, totalPrice: 360 },
    { price: 50, title: "包年", pricePerMonth: 36, totalPrice: 380 },
    { price: 60, title: "包年", pricePerMonth: 38, totalPrice: 400 }
  ]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const updateActiveTabIndex = (index: number) => {
    setActiveTabIndex(index);
  };

  const divRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;
    (window as any).NativeApi_OpenBrowser(dataTitle)
    console.log('data-title:', dataTitle);
  };

  useEffect(() => {
    const handleLeftArrowClick = () => {
      const tabsContainer = document.querySelector<HTMLElement>('.tabs-container');
      if (tabsContainer) {
        const scrollAmount = tabsContainer.scrollLeft - tabsContainer.offsetWidth;
        tabsContainer.scrollTo({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    const handleRightArrowClick = () => {
      const tabsContainer = document.querySelector<HTMLElement>('.tabs-container');
      if (tabsContainer) {
        const scrollAmount = tabsContainer.scrollLeft + tabsContainer.offsetWidth;
        tabsContainer.scrollTo({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    const leftArrow = document.querySelector('.arrow.left');
    const rightArrow = document.querySelector('.arrow.right');

    if (leftArrow) {
      leftArrow.addEventListener('click', handleLeftArrowClick);
    }

    if (rightArrow) {
      rightArrow.addEventListener('click', handleRightArrowClick);
    }

    return () => {
      if (leftArrow) {
        leftArrow.removeEventListener('click', handleLeftArrowClick);
      }
      if (rightArrow) {
        rightArrow.removeEventListener('click', handleRightArrowClick);
      }
    };
  }, []);

  
  return (
    <div className="pay-modal">
      <div className="headerAll">
        <div className="title">全平台会员特权</div>
        <div className="description">电竞专线/海外专线/超低延迟/动态多包/智能加速/多平台加速</div>
      </div>
      <div className="tabs-container">
        <div className="arrow left"></div>
        <div className="tabs">
          {jsonData.map((item, index) => (
            <div key={index} className={`tab ${index === activeTabIndex ? 'active' : ''}`} onClick={() => updateActiveTabIndex(index)}>
              <ul>
                <li>{item.title}</li>
                <li>¥<span className="price">{item.pricePerMonth}</span>/月</li>
                <li>总价：¥<span>{item.totalPrice}</span></li>
              </ul>
            </div>
          ))}
        </div>
        <div className="arrow right"></div>
      </div>
      <div className="line"></div>
      <div className="qrcode">
        <QRCode value={`http://www.baidu.com?price=${jsonData[activeTabIndex].price}`} />
      </div>
      <div className="carousel">
        {jsonData.map((item, index) => (
          <div key={index} className="carousel-item" style={{ display: index === activeTabIndex ? 'block' : 'none' }}>
            <div className="priceAll" data-price={item.price}>
              <ul>
                <li><span className="txt">支付宝或微信扫码支付</span></li>
                <li><span className="priceBig">{item.totalPrice}</span></li>
                <li>我已同意《<div className='txt' onClick={handleClick} ref={divRef} data-title="https://tc-js.yuwenlong.cn/terms_of_service.html">用户协议</div>》及《<div className='txt' onClick={handleClick} ref={divRef} data-title="https://tc-js.yuwenlong.cn/automatic_renewal_agreement.html">自动续费协议</div>》到期按每月29元自动续费，可随时取消 <i className="tips">?</i></li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Modal;
