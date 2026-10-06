import React, { useState, useEffect } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import { usePrices } from "./PriceContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const signed = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}`;

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const { getPrice, getChange, registerSymbols } = usePrices();

  const loadHoldings = () =>
    axios.get(`${BACKEND_URL}/allHoldings`).then((res) => {
      registerSymbols(res.data);
      setAllHoldings(res.data);
    });

  useEffect(() => {
    loadHoldings().catch(() => {});
    // Re-fetch periodically so orders placed from the watchlist show up here.
    const id = setInterval(() => loadHoldings().catch(() => {}), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach the live mock price to every holding.
  const rows = allHoldings.map((stock) => {
    const ltp = getPrice(stock.name) || stock.price;
    const invested = stock.avg * stock.qty;
    const curValue = ltp * stock.qty;
    const pnl = curValue - invested;
    const netPct = invested ? (pnl / invested) * 100 : 0;
    const dayPct = getChange(stock.name).pct;
    return { stock, ltp, invested, curValue, pnl, netPct, dayPct };
  });

  const totalInvestment = rows.reduce((sum, r) => sum + r.invested, 0);
  const totalCurrent = rows.reduce((sum, r) => sum + r.curValue, 0);
  const totalPnl = totalCurrent - totalInvestment;
  const totalPnlPct = totalInvestment ? (totalPnl / totalInvestment) * 100 : 0;

  const labels = rows.map((r) => r.stock.name);

  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: rows.map((r) => r.ltp),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <>
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Day chg.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ stock, ltp, curValue, pnl, netPct, dayPct }) => {
              const profClass = pnl >= 0 ? "profit" : "loss";
              const dayClass = dayPct >= 0 ? "profit" : "loss";

              return (
                <tr key={stock._id || stock.name}>
                  <td>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>{ltp.toFixed(2)}</td>
                  <td>{curValue.toFixed(2)}</td>
                  <td className={profClass}>{pnl.toFixed(2)}</td>
                  <td className={profClass}>{signed(netPct)}%</td>
                  <td className={dayClass}>{signed(dayPct)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>{totalInvestment.toFixed(2)}</h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>{totalCurrent.toFixed(2)}</h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5>
            {totalPnl.toFixed(2)} ({signed(totalPnlPct)}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>
      <VerticalGraph data={data} />
    </>
  );
};

export default Holdings;