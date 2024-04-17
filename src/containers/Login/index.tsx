/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-04-16 19:26:21
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-04-17 10:45:37
 * @FilePath: \react-ts-antd\src\containers\Login\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from 'react';
import './index.scss';

const Login: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value);
    };

    const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVerificationCode(e.target.value);
    };

    const handleGetVerificationCode = () => {
        // 模拟发送获取验证码的请求，这里假设成功后开始倒计时
        if (isPhoneNumberValid) {
            setCountdown(120);
            const interval = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);
    
            setTimeout(() => {
                clearInterval(interval);
            }, 120000); // 120秒后清除定时器
        }
    };

    const handlePhoneNumberBlur = () => {
        // 检查手机号格式是否正确
        const phoneNumberRegex = /^1[3456789]\d{9}$/;
        setIsPhoneNumberValid(phoneNumberRegex.test(phoneNumber));
    };

    const handleLogin = () => {
        // 处理登录逻辑
        console.log('手机号:', phoneNumber);
        console.log('验证码:', verificationCode);
    };

    return (
        <div className="login-modal">
            <h2>登录</h2>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="请输入手机号"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    onBlur={handlePhoneNumberBlur}
                />
               
            </div>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="请输入验证码"
                    value={verificationCode}
                    onChange={handleVerificationCodeChange}
                />
                 
                <button onClick={handleGetVerificationCode} disabled={countdown !== 0}>
                    {countdown === 0 ? '获取验证码' : `${countdown}秒后重新获取`}
                </button>
               
            </div>
            <button onClick={handleLogin}>登录</button>
            <button>微信登录</button>
        </div>
    );
}

export default Login;

