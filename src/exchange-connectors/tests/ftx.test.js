import { Ftx } from "../index";

test("Check Ftx fetchCandles method", (done) => {
  expect.assertions(1);

  const connector = new Ftx();

  connector.fetchCandles({ symbol: "BTC/USDT", interval: "1h" }).then((res) => {
    expect(Array.isArray(res)).toBe(true);
    done();
  });
});

test("Check Ftx subscribeCandles method", (done) => {
  expect.assertions(1);

  new Promise(function (resolve, reject) {
    const connector = new Ftx();

    connector.subscribeCandles({
      symbol: "BTC/USDT",
      interval: "1m",
      onMessage: (message) => {
        resolve(message);
      },
    });
  }).then((res) => {
    expect(res).toEqual({
      close: expect.anything(),
      high: expect.anything(),
      interval: "",
      low: expect.anything(),
      open: expect.anything(),
      symbol: expect.anything(),
      volume: expect.anything(),
    });
    done();
  });
}, 20000);
