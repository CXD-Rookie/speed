import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode.react';
import payApi from "@/api/pay";
import './index.scss'

interface Commodity {
  id: string;
  name: string;
  type: number;
  price: string;
  month_price: string;
  scribing_price: string;
}

const Modal: React.FC = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [payTypes, setPayTypes] = useState<{ [key: string]: string }>({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [userToken, setUserToken] = useState(localStorage.getItem("token") || '');

  const updateActiveTabIndex = (index: number) => {
    setActiveTabIndex(index);
  };

  const divRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget as HTMLDivElement;
    const dataTitle = target.dataset.title;
    (window as any).NativeApi_OpenBrowser(dataTitle);
    console.log('data-title:', dataTitle);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payTypeResponse, commodityResponse] = await Promise.all([
          payApi.getPayTypeList(),
          payApi.getCommodityList()
        ]);

        if (payTypeResponse.error === 0 && commodityResponse.error === 0) {
          setPayTypes(payTypeResponse.data);
          setCommodities(commodityResponse.data.list);

          // Fetch the initial QR code URL based on the first commodity
          if (commodityResponse.data.list.length > 0) {
            const initialQrCodeResponse = await payApi.getQrCodeUrl({
              pid: commodityResponse.data.list[0].id,
              user_token: userToken
            });
            // setQrCodeUrl(initialQrCodeResponse);
          }
        }
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    if (userToken) {
      fetchData();
    }
  }, [userToken]);

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

  // useEffect(() => {
  //   const updateQrCode = async () => {
  //     if (commodities.length > 0) {
  //       try {
  //         const qrCodeResponse = await payApi.getQrCodeUrl({
  //           pid: commodities[activeTabIndex].id,
  //           user_token: userToken
  //         });
  //         // setQrCodeUrl(qrCodeResponse);
  //       } catch (error) {
  //         console.error('Error updating QR code', error);
  //       }
  //     }
  //   };

  //   updateQrCode();
  // }, [activeTabIndex, commodities, userToken]);

  return (
    <div className="pay-modal">
      <div className="headerAll">
        <div className="title">全平台会员特权</div>
        <div className="description">电竞专线/海外专线/超低延迟/动态多包/智能加速/多平台加速</div>
      </div>
      <div className="tabs-container">
        <div className="arrow left"></div>
        <div className="tabs">
          {commodities.map((item, index) => (
            <div key={index} className={`tab ${index === activeTabIndex ? 'active' : ''}`} onClick={() => updateActiveTabIndex(index)}>
              <ul>
                <li>{payTypes[item.type]}</li>
                <li>¥<span className="price">{item.month_price}</span>/月</li>
                <li>总价：¥<span>{item.price}</span></li>
              </ul>
            </div>
          ))}
        </div>
        <div className="arrow right"></div>
      </div>
      <div className="line"></div>
      <div className="qrcode">
        <QRCode value={qrCodeUrl} />
      </div>
      <div className="carousel">
        {commodities.map((item, index) => (
          <div key={index} className="carousel-item" style={{ display: index === activeTabIndex ? 'block' : 'none' }}>
            <div className="priceAll" data-price={item.price}>
              <ul>
                <li><span className="txt">支付宝或微信扫码支付</span></li>
                <li><span className="priceBig">{item.price}</span></li>
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
