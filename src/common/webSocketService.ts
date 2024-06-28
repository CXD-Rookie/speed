/*
 * @Author: steven libo@rongma.com
 * @Date: 2024-06-21 14:52:37
 * @LastEditors: steven libo@rongma.com
 * @LastEditTime: 2024-06-28 17:54:28
 * @FilePath: \speed\src\common\webSocketService.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// webSocketService.ts
import { Dispatch } from 'redux';
import eventBus from '../api/eventBus'; // 假设你有一个 eventBus 模块来处理事件

class WebSocketService {
  private ws: WebSocket | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 10;
  private readonly reconnectInterval: number = 3000; // 初始重连间隔为3秒

  connect(url: string, onMessage: (event: MessageEvent) => void, dispatch: Dispatch) {
    const token = localStorage.getItem('token');
    let userToken = '';

    try {
      userToken = token ? JSON.parse(token) : '';
    } catch (e) {
      console.log('Failed to parse token:', e);
    }
    // console.log("发送消息的userToken-------------------------",userToken)
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.sendMessage({
        platform: 3,
        client_token: localStorage.getItem('client_token') || '',
        client_id: localStorage.getItem('client_id') || '',
        user_token: userToken,
      });
      this.startHeartbeat();
      this.reconnectAttempts = 0; // 重置重连尝试次数
    };

    this.ws.onmessage = (event) => {
      onMessage(event);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.stopHeartbeat();
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        eventBus.emit('showModal', { show: true, type: "serverDisconnected" });
      } else {
        this.reconnect(url, onMessage, dispatch);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
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
    }
  }

  startHeartbeat() {
    const token = localStorage.getItem('token');
    this.heartbeatInterval = setInterval(() => {
      this.sendMessage({
        platform: 3,
        client_token: localStorage.getItem('client_token') || '',
        client_id: localStorage.getItem('client_id') || '',
        user_token: JSON.parse(token ? token : ''),
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
    console.log(11111111111111111)
    window.addEventListener('offline', () => {
      eventBus.emit('showModal', { show: true, type: "netorkError" })
    });
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;

