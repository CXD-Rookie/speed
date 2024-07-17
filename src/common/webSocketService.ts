/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-06-21 14:52:37
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-07-12 14:26:44
 * @FilePath: \speed\src\common\webSocketService.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// webSocketService.ts
import { Dispatch } from 'redux';
import eventBus from '../api/eventBus'; 
import tracking from "@/common/tracking";
class WebSocketService {
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 10;
  private readonly reconnectInterval: number = 3000; // 初始重连间隔为3秒
  private messageQueue: any[] = []; // 缓存未发送的信息
  private url: string = '';
  private onMessage: (event: MessageEvent) => void = () => {};
  private dispatch!: Dispatch; // 使用断言来表示该属性在实际使用前会被赋值

  connect(url: string, onMessage: (event: MessageEvent) => void, dispatch: Dispatch) {
    this.url = url;
    this.onMessage = onMessage;
    this.dispatch = dispatch;
    // localStorage.removeItem('isClosed'); // 初始化时清除标志位

    const token = localStorage.getItem('token');
    let userToken = '';

    try {
      userToken = token ? JSON.parse(token) : '';
    } catch (e) {
      console.log('Failed to parse token:', e);
    }
    
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.sendMessage({
        platform: 3,
        client_token: localStorage.getItem('client_token') || '{}',
        client_id: localStorage.getItem('client_id') || '{}',
        user_token: userToken,
      });
      this.startHeartbeat();
      this.reconnectAttempts = 0; // 重置重连尝试次数
      this.flushMessageQueue(); // 连接恢复后发送缓存的信息
    };

    this.ws.onmessage = (event:any) => {
      let t = JSON.parse(event.data)
      if(t.code === 110001){
        if (!localStorage.getItem('isClosed') && localStorage.getItem('token')) {
          localStorage.setItem('isClosed', 'true'); // 标记为已关闭
          (window as any).loginOutStopWidow();
        }
      }
      onMessage(event);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.stopHeartbeat();

      // if (!localStorage.getItem('isClosed') && localStorage.getItem('token')) {
      //   localStorage.setItem('isClosed', 'true'); // 标记为已关闭
      //   (window as any).loginOutStopWidow();
      // }

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        eventBus.emit('showModal', { show: true, type: "serverDisconnected" });
      } else {
        this.reconnect(url, onMessage, dispatch);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);

      // if (!localStorage.getItem('isClosed')) {
      //   localStorage.setItem('isClosed', 'true'); // 标记为已关闭
      //   (window as any).loginOutStopWidow();
      // }

      this.stopHeartbeat();

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        eventBus.emit('showModal', { show: true, type: "serverDisconnected" });
      } else {
        this.reconnect(url, onMessage, dispatch);
      }
    };

    this.checkNetworkStatus();
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open. Unable to send message:', message);
      this.messageQueue.push(message); // 缓存未发送的信息
    }
  }

  flushMessageQueue() {
    while (this.ws && this.ws.readyState === WebSocket.OPEN && this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(JSON.stringify(message));
    }
  }

  startHeartbeat() {
    const token = localStorage.getItem('token');
    this.heartbeatInterval = setInterval(() => {
      this.sendMessage({
        platform: 3,
        client_token: localStorage.getItem('client_token') || '{}',
        client_id: localStorage.getItem('client_id') || '{}',
        user_token: JSON.parse(token ? token : '{}'),
      });
    }, 3000); // 每3秒发送一次心跳
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }

  reconnect(url: string, onMessage: (event: MessageEvent) => void, dispatch: Dispatch) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const retryTimeout = this.reconnectInterval * Math.pow(2, this.reconnectAttempts);
      console.log(`断开重连 ${retryTimeout / 1000} seconds...`);
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(url, onMessage, dispatch);
      }, retryTimeout);
    } else {
      console.error('超过最大重连次数，放弃重连');
    }
  }

  checkNetworkStatus() {
    window.addEventListener('offline', () => {
      tracking.trackNetworkError("网络断开offline")
      eventBus.emit('showModal', { show: true, type: "netorkError" });
    });

    window.addEventListener('online', () => {
      console.log('Network reconnected, attempting to reconnect WebSocket');
      this.reconnect(this.url, this.onMessage, this.dispatch);
    });
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
