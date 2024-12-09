class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = '';
  private messageQueue: any[] = [];
  private onMessage: (event: MessageEvent) => void = () => {};

  connect(url: string, onMessage: (event: MessageEvent) => void) {
    this.url = url;
    this.onMessage = onMessage;
    this.ws = new WebSocket(url);

    const token = localStorage.getItem('token');
    const userToken = token ? JSON.parse(token) : '';
    
    this.ws.onopen = () => {
      console.log('调用webSocketBeat心跳验证加速key');

      const client_token = localStorage.getItem('client_token');
      const client_id = localStorage.getItem('client_id');

      this.flushMessageQueue(); 
      this.sendMessage({
        platform: 3,
        client_token,
        client_id,
        user_token: userToken,
      });
    };

    this.ws.onclose = () => {
      console.log('关闭webSocketBeat心跳');
    };
  }

  // 发送消息
  sendMessage(message: any) {
    console.log("webSocketBeat心跳发送消息", message);
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open. Unable to send message:', message);
      this.messageQueue.push(message);
    }
  }

  // 关闭 ws
  closeWs() {
    if (this.ws) {
      console.log('Closing WebSocket connection');
      this.ws.close();
    }
  }

  flushMessageQueue() {
    while (
      this.ws && 
      this.ws.readyState === WebSocket.OPEN &&
      this.messageQueue.length > 0
    ) {
      const message = this.messageQueue.shift();

      console.log('错误webSocketBeat心跳消息', message);
      this.ws.send(JSON.stringify(message));
    }
  }
}

const webSocketBeat = new WebSocketService();

export default webSocketBeat;