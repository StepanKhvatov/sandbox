import { ExchangeConnector } from "./base";
import { intervalsToSeconds } from "./utils";
import qs from "qs";

export class Ftx extends ExchangeConnector {
  constructor() {
    super();
    this.baseUrl = "https://ftx.com/api";
    this.baseWsUrl = "wss://ftx.com/ws";
    this.fetchCandlesEndpoint = "markets";
    this.candleStreamMessageCreators = {
      subscribe: function (symbol) {
        return { op: "subscribe", channel: "trades", market: symbol };
      },
      unsubscribe: function (symbol) {
        return { op: "unsubscribe", channel: "trades", market: symbol };
      },
    };
  }

  createFetchCandlesParams({ symbol, interval, startTime, endTime }) {
    const params = qs.stringify({
      resolution: intervalsToSeconds[interval],
      start_time: startTime,
      end_time: endTime,
    });

    return `/${symbol}/candles?${params}`;
  }

  handleFetchCandlesResponse(response) {
    if (response.success && !response.error) {
      return response.result.map(
        ({ open, high, low, close, volume, startTime }) => {
          return {
            open,
            high,
            low,
            close,
            volume,
            timestamp: new Date(startTime).getTime(),
          };
        }
      );
    } else {
      throw new Error(
        `FtxConnector handleFetchCandlesResponse error: ${response.error}`
      );
    }
  }

  handleSubscribeCandlesMessage(message) {
    if (message.data) {
      const trades = message.data;

      const open = trades[0].price;

      const calculatedHighLowVolume = trades.reduce(
        (acc, { size, price }) => {
          return {
            high: price > acc.high ? price : acc.high,
            low: price < acc.low ? price : acc.low,
            volume: acc.volume + price * size,
          };
        },
        { high: open, low: open, volume: 0 }
      );

      const lastTrade = trades[trades.length - 1];

      const close = lastTrade.price;

      return {
        ...calculatedHighLowVolume,
        open,
        close,
        interval: "",
        symbol: message.market,
      };
    }
  }

  createStreamPingMessage() {
    return {
      op: "ping",
    };
  }
}
