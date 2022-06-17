export class ExchangeConnector {
  constructor() {
    this.baseUrl = null;
    this.fetchCandlesEndpoint = null;
    this.candlesStream = null;
    this.candlesStreamPingInterval = null;
  }

  async fetchApi({ url, method, headers }) {
    return fetch(url, {
      method,
      headers: {
        ...headers,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
      },
    }).then((res) => {
      return res.json();
    });
  }

  fetchCandles(params) {
    const fetchCandlesParams = this.createFetchCandlesParams(params);

    return this.fetchApi({
      url: `${this.baseUrl}/${this.fetchCandlesEndpoint}${fetchCandlesParams}`,
    })
      .then(this.handleFetchCandlesResponse)
      .catch((error) => {
        return error;
      });
  }

  subscribeCandles({ symbol, interval, onMessage, onClose, onError }) {
    const ws = new WebSocket(this.baseWsUrl);

    this.candlesStream = ws;

    ws.onopen = () => {
      const requestMessage = this.candleStreamMessageCreators["subscribe"](
        symbol,
        interval
      );

      ws.send(JSON.stringify(requestMessage));

      if (this.createStreamPingMessage) {
        const pingMessage = this.createStreamPingMessage();

        const pingInterval = setInterval(() => {
          return ws.send(JSON.stringify(pingMessage));
        }, 14000);

        this.candlesStreamPingInterval = pingInterval;
      }
    };

    ws.onmessage = (event) => {
      const message = this.handleSubscribeCandlesMessage(
        JSON.parse(event.data)
      );

      if (message) {
        return onMessage(message);
      }
    };

    ws.onclose = onClose;
    ws.onerror = onError;
  }

  unsubscribeCandles({ symbol, interval }) {
    if (this.candlesStream) {
      const requestMessage = this.candleStreamMessageCreators["unsubscribe"](
        symbol,
        interval
      );

      if (this.candlesStreamPingInterval) {
        clearInterval(this.candlesStreamPingInterval);
      }

      this.candlesStream.send(JSON.stringify(requestMessage));
      this.candlesStream.close();
      this.candlesStream = null;
    } else {
      throw new Error("Ws connection not exist or already closed");
    }
  }
}
