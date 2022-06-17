import { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Binance, Ftx } from "./exchange-connectors";

function App() {
  useEffect(() => {
    const connector = new Ftx();

    connector
      .fetchCandles({
        symbol: "BTC/USDT",
        interval: "1m",
      })
      .then((res) => {
        console.log(res);
      });
  }, []);

  useEffect(() => {
    const connector = new Binance();

    connector
      .fetchCandles({
        symbol: "BTC/USDT",
        interval: "1m",
      })
      .then((res) => {
        console.log(res);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
