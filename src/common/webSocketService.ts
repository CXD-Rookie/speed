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
  private reconnectTimeout: NodeJS.Timeout | null = null; // 用于存储重连的定时器
  private messageAttempts: number = 0; // 用于记录无token时的消息发送次数
  private readonly maxMessageAttempts: number = 10; // 最大发送次数
  private verifyErrorCode: number = 4000; // 前端校验ws参数错误
  private serveErrorCode: number = 4001; // 服务端未返回值ws错误
  private reconnectErrorCode: number = 4002 // 重连次数最大后错误码
  private normalCloseCode: number = 4004 // 正常手动关闭ws
  private severlverifyCode: number = 4004 // 服务端返回code大于 0

  connect(url: string, onMessage: (event: MessageEvent) => void, dispatch: Dispatch) {
    this.url = url;
    this.onMessage = onMessage;
    this.dispatch = dispatch;
    
    const token = localStorage.getItem('token');
    const userToken = token ? JSON.parse(token) : '';

    this.hasToken = !!token;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('连接 webSocket 服务');
      this.reconnectAttempts = 0;
      this.sendMessage({
        platform: 3,
        client_token: localStorage.getItem('client_token') || '{}',
        client_id: localStorage.getItem('client_id') || '{}',
        user_token: userToken,
      });
      this.startHeartbeat(); // 确保有 token 时启动心跳
    };

    this.ws.onmessage = (event: any) => {
      const serveData = JSON.parse(event.data);
      
      if (serveData?.code === 110001 && !localStorage.getItem('isClosed') && localStorage.getItem('token')) {
        localStorage.setItem('isClosed', 'true'); // 标记为已关闭
        const isRemote = JSON.parse(localStorage.getItem("isRemote") || "0") // 标记11001是绑定手机时出现的
  
        if (!Number(isRemote)) {
          (window as any).loginOutStopWidow("remoteLogin");
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("isRealName");
          localStorage.removeItem("isModalDisplayed");
          eventBus.emit('clearTimer');
        }

        localStorage.removeItem("isRemote")
      } else if (serveData?.code > 0) {
        // 服务端返回code不为0,直接断开
        this.close({
          code: serveData?.code,
          reason: serveData?.message,
        });
      } else if (!serveData || !event) {
        this.close({code: this.serveErrorCode}); // ws没有返回值
      }
      
      onMessage(event);
    };

    this.ws.onclose = (event) => {
      console.log('关闭连接', event);

      const normalCode = [this.verifyErrorCode, this.reconnectErrorCode, this.normalCloseCode,];
      const serveCode = [this.serveErrorCode]

      this.stopHeartbeat();

      // 如果code码不属于合法关闭 或者 是没有接收到服务端返回的返回参数 进行重新连接
      if (!normalCode.includes(event?.code) || serveCode.includes(event?.code)) {
        this.handleReconnection();
      }
    };
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
      eventBus.emit('clearTimer');
      eventBus.emit('showModal', { show: true, type: "netorkError" });
      this.close({
        code: this.reconnectErrorCode,
        reason: "前端校验参数失败"
      });
    }
  }

  // 发送参数
  sendMessage(message: any) {
    const id = message?.client_id;
    const token = message?.client_token;
    const platform = message?.platform;
    const user_token = message?.user_token;
    const isLoginTrue = id && token && platform === 3 && user_token;

    if (isLoginTrue && this.ws && this.ws.readyState === WebSocket.OPEN) {
      // console.log('WebSocket 连接成功，发送成功，参数正确:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.log('WebSocket 连接成功，发送失败，参数错误:', message);
      this.messageQueue.push(message);
    }
  }

  // 心跳
  startHeartbeat() {
    console.log("启动定时心跳", this.hasToken ? "有user_token" : "没有user_token");
    // 如果没有 token，也允许发送消息
    if (!this.hasToken) {
      this.heartbeatInterval = setInterval(() => {
        (window as any).schedulePoll();

        const token = localStorage.getItem("token");

        if (token) {
          this.close({ code: this.normalCloseCode, reason: "登录后主动关闭ws"});
          this.connect(this.url, this.onMessage, this.dispatch);
        }
      }, 5000); // 每5秒发送一次消息
  
      return; // 无 token 时返回，避免进入有 token 的逻辑
    }

    // 有 token 时的正常心跳逻辑
    if (this.hasToken) {
      this.heartbeatInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.sendMessage({
            platform: 3,
            client_token: localStorage.getItem('client_token') || '{}',
            client_id: localStorage.getItem('client_id') || '{}',
            user_token: JSON.parse(localStorage.getItem('token') || '{}'),
          });
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
        const privateCode = [this.verifyErrorCode, this.serveErrorCode, this.reconnectErrorCode, this.normalCloseCode];
        // 定义的错误码直接传入，服务端返回的错误码转译为特定错误码传入，因为关闭连接时的状态码不能大于 65535
        const isSever = privateCode.includes(event.code) && event.code > 0;
        
        this.ws.close(isSever ? event?.code : this.severlverifyCode, event?.reason);
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

    this.close({ code: this.normalCloseCode, reason: "游侠登录后主动关闭ws"}); // 关闭当前 WebSocket 连接
    this.connect(this.url, this.onMessage, this.dispatch);
  }

  // 登录后重新连接
  loginReconnect() {
    this.close({ code: this.normalCloseCode, reason: "登录后主动关闭ws"}); // 关闭当前 WebSocket 连接
    this.connect(this.url, this.onMessage, this.dispatch);
  }
}

const webSocketService = new WebSocketService();

export default webSocketService;
