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
import eventBus from '../api/eventBus';
interface ApiParamsType {
  platform?: number,
  client_token?: string;
  client_id?: string;
  user_token?: string; // 可选属性
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectInterval: number = 5000;
  private messageQueue: any[] = [];
  private url: string = '';
  private onMessage: (event: MessageEvent) => void = () => {};
  private dispatch!: Dispatch;
  private hasToken: boolean = false;
  private readonly platform: number = 3; // 当前是 window 环境
  private apiHeaderParams: ApiParamsType = {}; // 发送请求参数
  private reconnectTimeout: NodeJS.Timeout | null = null; // 用于存储重连的定时器
  private verifyErrorCode: number = 4000; // 前端校验 webSocket 参数错误码
  private normalCloseCode: number = 4001 // 前端正常手动关闭 webSocket
  private reconnectErrorCode: number = 4002 // 前端重连次数最大后错误码
  private serveErrorCode: number = 4003; // 服务端未返回值错误码
  private severlStopCode: number = 4004 // 服务端返回错误码位于 >= 100000 - < 200000
  private severlverifyCode: number = 4005 // 服务端返回错误码位于 < 100000 - >= 200000

  connect(url: string, onMessage: (event: MessageEvent) => void, dispatch: Dispatch) {
    this.url = url;
    this.onMessage = onMessage;
    this.dispatch = dispatch;
    
    const token = localStorage.getItem('token');
    const userToken = token ? JSON.parse(token) : '';
    
    this.hasToken = !!token;
    this.apiHeaderParams = {
      platform: this.platform,
      client_token: localStorage.getItem('client_token') ?? "",
      client_id: localStorage.getItem('client_id') ?? "",
      user_token: userToken,
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('连接 webSocket 服务', console.log(this.ws));
      const isLoginTrue =  Object.values(this.apiHeaderParams).every(value => value != null && value !== '');
      
      this.reconnectAttempts = 0;
      
      if (isLoginTrue) {
        this.sendMessage(this.apiHeaderParams);
      } else {
        this.close({ code: this.verifyErrorCode, reason: "前端校验参数错误"})
      }

      this.startHeartbeat(); // 启动心跳
    };

    this.ws.onmessage = (event: any) => {
      const serveData = JSON.parse(event.data);
      
      // 登录信息出现问题，退出登录，停止加速，关闭 webSocket
      if (serveData?.code >= 100000 && serveData?.code < 200000) {
        if (
          serveData?.code === 110001 && 
          !localStorage.getItem('isClosed') && 
          localStorage.getItem('token')
        ) {
          localStorage.setItem('isClosed', 'true'); // 标记为已关闭
          const isRemote = JSON.parse(localStorage.getItem("isRemote") || "0") // 标记11001是绑定手机时出现的
    
          if (!Number(isRemote)) {
            (window as any).loginOutStopWidow("remoteLogin");
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("isRealName");
            localStorage.removeItem("isModalDisplayed");
          }

          localStorage.removeItem("isRemote")
        }
        
        this.close({code: this.severlStopCode, reason: serveData?.message})
        onMessage(event);
        return;
      }

      // 服务端其他错误 停止加速，关闭 webSocket
      if (event?.code < 100000 && event?.code >= 200000) {
        this.close({code: this.severlverifyCode, reason: serveData?.message})
        onMessage(event);
        return;
      }
      
      if (!serveData) {
        this.close({ code: this.serveErrorCode, reason: "webSocket服务端没有返回值"  });
        onMessage(event);
      }

      onMessage(event);
    };

    this.ws.onclose = (event) => {
      console.log('关闭连接', event);

      const normalCode = [
        this.normalCloseCode, // 前端正常手动关闭 4001
        this.reconnectErrorCode, // 前端重连次数最大后关闭 4002
      ];
      const heartbeatCode = [
        this.verifyErrorCode, // 前端校验参数错误 4000
        this.severlStopCode // 服务端返回错误码位于 4004
      ]
      const timeCode = [
        this.serveErrorCode,
        this.severlverifyCode
      ]
      this.stopHeartbeat();

      // 如果登录信息清除则启动定时心跳，防止
      if (heartbeatCode.includes(event?.code)) {
        this.startHeartbeat();
      } else if (timeCode.includes(event?.code)) {
        // 如果code码不属于合法关闭 或者 是没有接收到服务端返回的返回参数 进行重新连接
        this.timeReconnection();
      } else if (!normalCode.includes(event?.code)) {
        // 5次重连
        // this.handleReconnection();
      }
    };
  }

  // 5分钟定时重连机制
  timeReconnection() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout); // 清除旧的定时器
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect(this.url, this.onMessage, this.dispatch);
    }, 300000);
  }

  // 重连机制
  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const retryTimeout = this.reconnectInterval * Math.pow(2, this.reconnectAttempts);
      
      this.reconnectAttempts++;
      console.log(`尝试第 ${this.reconnectAttempts} 次重连，等待 ${retryTimeout / 1000} 秒...`);

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout); // 清除旧的定时器
      }

      this.reconnectTimeout = setTimeout(() => {
        this.connect(this.url, this.onMessage, this.dispatch);
      }, retryTimeout);
    } else {
      console.error('超过最大重连次数，放弃重连');
      eventBus.emit('showModal', { show: true, type: "netorkError" });
      this.close({
        code: this.reconnectErrorCode,
        reason: "前端校验参数失败"
      });
    }
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

  // 心跳
  startHeartbeat() {
    console.log("启动定时心跳", this.hasToken ? "有user_token" : "没有user_token");

    // 如果没有 token，定时读取token变化，不做webScoket连接
    if (!this.hasToken) {
      this.heartbeatInterval = setInterval(() => {
        (window as any).schedulePoll();

        const token = localStorage.getItem("token");
        console.log("无token心跳");
        if (token) {
          this.close({ code: this.normalCloseCode, reason: "登录后主动关闭"});
          this.sendMessage(this.apiHeaderParams);
        }
      }, 5000); // 每5秒发送一次消息
  
      return; // 无 token 时返回，避免进入有 token 的逻辑
    }

    // 有 token 时的正常心跳逻辑
    if (this.hasToken) {
      this.heartbeatInterval = setInterval(() => {
        const isLoginTrue =  Object.values(this.apiHeaderParams).every(value => value != null && value !== '');

        if (this.ws && this.ws.readyState === WebSocket.OPEN && isLoginTrue) {
          console.log("有token心跳");
          this.sendMessage(this.apiHeaderParams);
        }
      }, 5000); // 每5秒发送一次心跳
    }
  }

  // 停止心跳
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      console.log('停止心跳');
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
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
      this.hasToken = true; // 更新 token 后标记 token 存在     
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
