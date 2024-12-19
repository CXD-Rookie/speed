/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-06-21 14:52:37
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-08-22 15:37:08
 * @FilePath: \speed\src\common\webSocketService.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// webSocketService.ts
import { Dispatch } from 'redux';
import { store } from '@/redux/store';

import eventBus from '../api/eventBus';
import tracking from './tracking';

interface ApiParamsType {
  platform?: number,
  client_token?: string;
  client_id?: string;
  user_token?: string; // 可选属性
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = process.env.REACT_APP_WSAPI_URL ?? "";
  private onMessage: (event: MessageEvent) => void = () => {};
  private dispatch!: Dispatch;
  private readonly platform: number = 3; // 当前是 window 环境
  private heartbeatInterval: NodeJS.Timeout | null = null; // 存定时心跳计时器
  private abnormalInterval: NodeJS.Timeout | null = null; // 服务端断开计时器
  private heartbeatNum: number = 0; // 定时心跳次数
  private reconnectTime: number = 0; // 用于未返回数据计时
  private apiHeaderParams: ApiParamsType = {}; // 发送请求参数
  private receivedTime: number = 0; // webSocket 每接收到一次消息更新一下当前时间
  private verifyErrorCode: number = 4000; // 前端校验 webSocket 参数错误码
  private normalCloseCode: number = 4001 // 前端正常手动关闭 webSocket
  private serveErrorCode: number = 4003; // 服务端未返回值错误码
  private severlStopCode: number = 4004 // 服务端返回错误码位于 >= 100000 - < 200000
  private severlverifyCode: number = 4005 // 服务端返回错误码位于 < 100000 - >= 200000

  connect(url: string, onMessage: (event: MessageEvent) => void, dispatch: Dispatch) {
    this.url = url;
    this.onMessage = onMessage;
    this.dispatch = dispatch;
    
    const token = localStorage.getItem('token');
    const userToken = token ? JSON.parse(token) : '';
    
    this.apiHeaderParams = {
      platform: this.platform,
      client_token: localStorage.getItem('client_token') ?? "",
      client_id: localStorage.getItem('client_id') ?? "",
      user_token: userToken,
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('连接 webSocket 服务', console.log(this.ws));
      const apiHeader = this.checkMissingValues(this.apiHeaderParams); // 判断参数值为空的字段
      
      this.stopHeartbeat(); // 清除定时器

      // 如果参数正确，发送消息
      if (apiHeader?.length === 0) {
        this.abnormalHeartbeat(); // 启动检测是否接收到返回数据计时器
        this.sendMessage(this.apiHeaderParams); // 发送消息
      } else {
        if (store?.getState()?.accountInfo?.isLogin) {
          const webVersion = process.env.REACT_APP_VERSION;
          const version = (window as any).versionNowRef;

          // 参数错误，断开 webSocket
          this.close({ code: this.verifyErrorCode, reason: "前端校验参数错误"});
          (window as any).loginOutStopWidow(); // 退出登录

          // 如果参数 client_token 错误，调用客户端方法，重新更新读取 client_token，重新进行连接
          if (apiHeader.includes("client_token") || apiHeader.includes("client_id")) {
            (window as any).NativeApi_AsynchronousRequest("UpdateClientToken","", (respose: any) => {
              console.log(respose);
            })
            this.connect(this.url, this.onMessage, this.dispatch);
          }

          tracking.trackServerError(
            `errorCode=${this.verifyErrorCode};message=前端校验参数错误;apiName=${url};version=${version + "," + webVersion}`
          )
        }
      }
    };

    this.ws.onmessage = (event: any) => {
      const serveData = JSON.parse(event.data);
      const time = new Date().getTime(); // 获取当前时间
      const diff = time - this.receivedTime;
      
      this.reconnectTime = 0; // 接收到数据清除计时

      // 如果接收到服务端返回消息，则记录下当前时间
      if (serveData) {
        const webVersion = process.env.REACT_APP_VERSION;
        const version = (window as any).versionNowRef;
        
        // 登录信息出现问题，退出登录，停止加速，关闭 webSocket
        if (serveData?.code >= 100000 && serveData?.code < 200000) {
          this.receivedTime = 0;
          // 110001 判断为异地登录
          if (serveData?.code === 110001) {
            (window as any).loginOutStopWidow("remoteLogin");
          } else {
            (window as any).loginOutStopWidow(); // 退出登录
            this.close({code: this.severlStopCode, reason: serveData?.message})
          }
          
          tracking.trackServerError(
            `errorCode=${serveData?.code};message=${serveData?.message};apiName=${url};version=${version + "," + webVersion}`
          )
        } else if (serveData?.code !== 0 && (serveData?.code < 100000 || serveData?.code >= 200000)) {
          if (diff >= 30000 && diff !== time) {
            this.receivedTime = 0
            
            const eventBuNetwork = localStorage.getItem("eventBuNetwork");
            const local_games = localStorage.getItem("speed-1.0.0.1-games");
            const result_games = local_games ? JSON.parse(local_games) : [];
            const isA = result_games?.find((item: any) => item?.is_accelerate)?.id
            
            if (store?.getState()?.accountInfo?.isLogin && !(eventBuNetwork === "1") && isA) {
              eventBus.emit('showModal', { show: true, type: "servicerechargeReport" });
            }

            // 服务端其他错误 停止加速，关闭 webSocket
            this.close({code: this.severlverifyCode, reason: serveData?.message});
            (window as any).stopProcessReset();
            tracking.trackServerError(
              `errorCode=${serveData?.code};message=${serveData?.message};apiName=${url};version=${version + "," + webVersion}`
            )
          } else if (diff === time)  {
            this.receivedTime = time; // 如果第一次返回值就没有就保存一次当前时间，方便计时30秒
            this.connect(this.url, this.onMessage, this.dispatch);
          } else if (diff <= 5000) {
            this.connect(this.url, this.onMessage, this.dispatch);
          }
        } else {
          this.receivedTime = time;
        }
      } else {
        // 如果没接收到消息，则不记录时间，
        // 进行消息时间 receivedTime 和当前时间比较，如果间隔 >= 30s, 断开连接，重新发送，并且记录当前时间，方便和下次对比
        if (diff >= 30000 && diff !== time) {
          this.receivedTime = 0
          this.close({ code: this.serveErrorCode, reason: "服务端30秒没有返回消息"});
        } else if (diff === time)  {
          this.receivedTime = time; // 如果第一次返回值就没有就保存一次当前时间，方便计时30秒
        }
      }
      
      onMessage(event);
    };

    this.ws.onclose = (event) => {
      console.log('关闭连接', event);

      const heartbeatCode = [
        this.verifyErrorCode, // 前端校验参数错误 4000
        this.severlStopCode // 服务端返回错误码位于 4004
      ]
      const timeCode = [
        this.serveErrorCode,
        this.severlverifyCode
      ]

      // 如果登录信息清除则启动定时心跳，防止
      if (heartbeatCode.includes(event?.code)) {
        this.stopAbnormalHeartbeat();
      } else if (timeCode.includes(event?.code)) {
        this.stopAbnormalHeartbeat();
        // 如果code码不属于合法关闭 或者 是没有接收到服务端返回的返回参数 进行重新连接
        this.connect(this.url, this.onMessage, this.dispatch);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error observed:', error);
    };

    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);

    // 添加在线/离线事件监听器
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    // 移除在线/离线事件监听器
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  handleOnline() {
    console.log('The system is now online.');
    // 在这里你可以执行一些代码来恢复应用的功能或通知用户已重新上线

    // 使用防抖或节流来限制频繁调用
    // if (this.onlineTimeout) clearTimeout(this.onlineTimeout);
  }

  handleOffline() {
    console.log('The system is now offline.');
    this.stopHeartbeat();
    this.scheduleHeartbeat(); // 启动定时心跳
    this.stopAbnormalHeartbeat(); // 清除检测是否接收到数据的定时器
  }

  // 关闭心跳
  stopAbnormalHeartbeat() {
    if (this.abnormalInterval !== null) {
      clearInterval(this.abnormalInterval as NodeJS.Timeout);
      this.abnormalInterval = null;
    }
  }

  // 服务端没有返回值关闭ws或者异常抖动关闭ws启动定时器
  abnormalHeartbeat() {
    if (store.getState()?.accountInfo.isLogin) {
      this.abnormalInterval = setInterval(() => {
        this.reconnectTime = this.reconnectTime + 5;

        if (this.reconnectTime >= 30) {
          console.log("30秒没有接收到数据");
          
          this.stopAbnormalHeartbeat();
          this.connect(this.url, this.onMessage, this.dispatch);
        }
      }, 5000); // 每1分钟发送一次心跳
    }
  }

  // 关闭心跳
  stopHeartbeat() {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval as NodeJS.Timeout);
      this.heartbeatInterval = null;
      this.heartbeatNum = 0; // Reset the counter when stopping the heartbeat
    }
  }

  // 定时心跳
  scheduleHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.heartbeatNum >= 9) {
        this.stopHeartbeat();
        eventBus.emit('showModal', { show: true, type: "netorkError" }); // 弹窗网络错误
      } else {
        this.heartbeatNum++
        this.close({code: this.normalCloseCode, reason: "断网前端手动关闭连接"})
        this.connect(this.url, this.onMessage, this.dispatch);
      }
    }, 60000); // 每1分钟发送一次心跳
  }

  // 查看对象的那个键是空值
  checkMissingValues(params: any) {
    const missingKeys = [];
    
    // 遍历 apiHeaderParams 对象的所有键值对
    for (const key in params) {
      if ([null, undefined, ''].includes(params[key])) {
        missingKeys.push(key);
      }
    }

    return missingKeys;
  }

  // 发送参数
  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // console.log('WebSocket 连接成功，发送成功，参数正确:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.log('WebSocket 连接失败，发送失败:', message);
      this.close()
    }
  }

  // 断开 webSocket
  close(event: any = null) {
    if (this.ws) {
      console.log('进行断开 WebSocket 连接', event);
      if (event && event.code) {
        this.ws.close(event.code, event?.reason);
      } else {
        this.ws.close(); // 使用默认的关闭状态码
      }
    }
  }

  // 游侠登录触发的更新token重新连接
  updateTokenAndReconnect(newToken: any) {
    localStorage.removeItem("token");
    localStorage.removeItem("isRealName");

    setTimeout(() => {
      localStorage.setItem('token', JSON.stringify(newToken));
    }, 500);

    this.close({ code: this.normalCloseCode, reason: "游侠登录后主动关闭"}); // 关闭当前 WebSocket 连接
    this.connect(this.url, this.onMessage, this.dispatch);
  }

  // 登录后重新连接
  loginReconnect() {
    this.close({ code: this.normalCloseCode, reason: "登录后主动关闭"}); // 关闭当前 WebSocket 连接
    this.connect(this.url, this.onMessage, this.dispatch);
  }
}

const webSocketService = new WebSocketService();

export default webSocketService;
