import { ExchangeConnector } from "./base";
import { transformBinaceStreamSymbol } from "./utils";
import qs from "qs";

export class Binance extends ExchangeConnector {
  constructor() {
    super();
    this.baseUrl = "https://api.binance.com/api";
    this.baseWsUrl = "wss://stream.binance.com:9443/ws";
    this.fetchCandlesEndpoint = "v3/klines";
    this.candleStreamMessageCreators = {
      subscribe: function (symbol, interval) {
        return {
          method: "SUBSCRIBE",
          params: [`${transformBinaceStreamSymbol(symbol)}@kline_${interval}`],
          id: 1,
        };
      },
      unsubscribe: function (symbol, interval) {
        return {
          method: "UNSUBSCRIBE",
          params: [`${transformBinaceStreamSymbol(symbol)}@kline_${interval}`],
          id: 1,
        };
      },
    };
  }

  createFetchCandlesParams({
    symbol,
    interval,
    startTime,
    endTime,
    limit = 1000,
  }) {
    const params = qs.stringify({
      symbol: symbol.replace("/", ""),
      interval,
      startTime,
      endTime,
      limit,
    });

    return `?${params}`;
  }

  handleFetchCandlesResponse(response) {
    if (response?.length && !response.code) {
      return response.map(([timestamp, open, high, low, close, volume]) => {
        return {
          open: +open,
          high: +high,
          low: +low,
          close: +close,
          volume: +volume,
          timestamp,
        };
      });
    } else {
      throw new Error(`handleFetchCandlesResponse error: ${response.msg}`);
    }
  }

  handleSubscribeCandlesMessage(message) {
    if (message.e === "kline") {
      const candle = message.k;

      return {
        open: +candle.o,
        high: +candle.h,
        low: +candle.l,
        close: +candle.c,
        volume: +candle.v,
        interval: "",
        symbol: candle.s,
      };
    }
  }
}
