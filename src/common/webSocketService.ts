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
    this.hasToken = !!token;
    let userToken = '';

    try {
      userToken = token ? JSON.parse(token) : '';
    } catch (e) {
      console.log('Failed to parse token:', e);
    }
    
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connection opened');
      this.reconnectAttempts = 0;
      this.flushMessageQueue(); 
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
      console.log('WebSocket connection closed', event);

      const normalCode = [this.verifyErrorCode, this.reconnectErrorCode, this.normalCloseCode,];
      const serveCode = [this.serveErrorCode]

      this.stopHeartbeat();
      
      // 如果code码不属于合法关闭 或者 是没有接收到服务端返回的返回参数 进行重新连接
      if (!normalCode.includes(event?.code) || serveCode.includes(event?.code)) {
        this.handleReconnection();
      }
    };

    this.ws.onerror = (error) => {
      console.log('WebSocket error:', error);

      // if () {

      // }
      this.stopHeartbeat();
      this.handleReconnection();
    };

    this.checkNetworkStatus();
  }

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

  sendMessage(message: any) {
    const id = message?.client_id;
    const token = message?.client_token;
    const platform = message?.platform;
    const user_token = message?.user_token;
    const isLoginTrue = id && token && platform === 3 && user_token;

    if (isLoginTrue && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.log('WebSocket is not open. Unable to send message:', message);
      this.messageQueue.push(message);
      // this.close({
      //   code: this.verifyErrorCode,
      //   reason: "前端校验参数失败"
      // });
    }
  }

  flushMessageQueue() {
    while (this.ws && this.ws.readyState === WebSocket.OPEN && this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      console.log('Flushing message:', message);
      this.ws.send(JSON.stringify(message));
    }
  }

  startHeartbeat() {
    // 如果没有 token，也允许发送消息
    if (!this.hasToken) {
      console.log('No token available, starting message attempts');
      this.heartbeatInterval = setInterval(() => {
        console.log(1111);
        (window as any).a();
      }, 5000); // 每5秒发送一次消息
  
      return; // 无 token 时返回，避免进入有 token 的逻辑
    }


    // 有 token 时的正常心跳逻辑
    if (this.hasToken) {
      console.log('Starting heartbeat');
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

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      console.log('Stopping heartbeat');
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  close(event: any = null) {
    if (this.ws) {
      console.log('Closing WebSocket connection', event);
      if (event && event.code) {
        const privateCode = [this.verifyErrorCode, this.serveErrorCode, this.reconnectErrorCode, this.normalCloseCode];
        // 不在已经定义的错误码并且是服务端返回的错误码 关闭连接时的状态码不能大于 65535
        const isSever = !privateCode.includes(event.code) && event.code > 0;

        this.ws.close(isSever ? this.severlverifyCode : event?.code, event?.reason);
      } else {
        this.ws.close(); // 使用默认的关闭状态码
      }
    }
  }

  checkNetworkStatus() {
    // window.addEventListener('offline', () => {
    //   console.log('Network disconnected, attempting reconnection...');
    //   this.handleReconnection();
    // });
    window.addEventListener('online', () => {
      console.log('Network reconnected, attempting to reconnect WebSocket');
      if (this.hasToken) {
        this.connect(this.url, this.onMessage, this.dispatch); // 网络恢复后重连
      } else {
        this.handleReconnection(); // 没有 token 时也尝试重连
      }
    });
  }

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

  loginReconnect() {
    this.close({ code: this.normalCloseCode, reason: "登录后主动关闭ws"}); // 关闭当前 WebSocket 连接
    this.connect(this.url, this.onMessage, this.dispatch);
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
