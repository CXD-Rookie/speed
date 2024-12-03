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
// import { message } from 'antd';
import tracking from "@/common/tracking";

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
      let t = JSON.parse(event.data);
      if (t.code === 110001) {
        if (!localStorage.getItem('isClosed') && localStorage.getItem('token')) {
          localStorage.setItem('isClosed', 'true'); // 标记为已关闭
          const isRemote = JSON.parse(localStorage.getItem("isRemote") || "0") // 标记11001是绑定手机时出现的
   
          if (!Number(isRemote)) {
            (window as any).loginOutStopWidow("remoteLogin");
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("isRealName");
            // localStorage.removeItem("is_new_user");
            localStorage.removeItem("isModalDisplayed");
            eventBus.emit('clearTimer');
          }

          localStorage.removeItem("isRemote")
        }
      }
      onMessage(event);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.stopHeartbeat();
      this.handleReconnection();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
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
      // message.warning('网络连接不稳定，正在尝试重连...',5);
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
      this.close();
    }
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // console.log('Sending message:发送消息',);
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open. Unable to send message:', message);
      this.messageQueue.push(message);
      this.close();
      this.handleReconnection();
    }
  }

  flushMessageQueue() {
    while (this.ws && this.ws.readyState === WebSocket.OPEN && this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      console.log('Flushing message:', message);
      this.ws.send(JSON.stringify(message));
    }
  }

  // startHeartbeat() {
  //   if (!this.hasToken) {
  //     console.log('No token available, heartbeat not started');
  //     return;
  //   }
  //   console.log('Starting heartbeat');
  //   this.heartbeatInterval = setInterval(() => {
  //     if (this.ws && this.ws.readyState === WebSocket.OPEN) {
  //       this.sendMessage({
  //         platform: 3,
  //         client_token: localStorage.getItem('client_token') || '{}',
  //         client_id: localStorage.getItem('client_id') || '{}',
  //         user_token: JSON.parse(localStorage.getItem('token') || '{}'),
  //       });
  //     }
  //   }, 5000); // 每5秒发送一次心跳
  // }
  startHeartbeat() {
    // 如果没有 token，也允许发送消息
    if (!this.hasToken && this.messageAttempts < this.maxMessageAttempts) {
      console.log('No token available, starting message attempts');
      this.heartbeatInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.sendMessage({
            platform: 3,
            client_token: localStorage.getItem('client_token') || '{}',
            client_id: localStorage.getItem('client_id') || '{}',
            user_token: JSON.parse(localStorage.getItem('token') || '{}'),
          });
  
          this.messageAttempts++;
  
          // 当达到最大次数，停止发送消息
          if (this.messageAttempts >= this.maxMessageAttempts) {
            console.log('Reached maximum message attempts without token, stopping...');
            //@ts-ignore
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
          }
        }
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

  close() {
    if (this.ws) {
      console.log('Closing WebSocket connection');
      this.ws.close();
    }
  }

  checkNetworkStatus() {
    window.addEventListener('offline', () => {
      console.log('Network disconnected, attempting reconnection...');
      // tracking.trackNetworkError("网络断开offline");
      this.handleReconnection();
    }); 
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
    // localStorage.removeItem("is_new_user");
    //@ts-ignore
    setTimeout(() => {
      localStorage.setItem('token', JSON.stringify(newToken)); 
      this.hasToken = true; // 更新 token 后标记 token 存在     
    }, 500);
    this.close(); // 关闭当前 WebSocket 连接
    this.connect(this.url, this.onMessage, this.dispatch);
  }

  loginReconnect() {
    this.close(); // 关闭当前 WebSocket 连接
    this.connect(this.url, this.onMessage, this.dispatch);
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
