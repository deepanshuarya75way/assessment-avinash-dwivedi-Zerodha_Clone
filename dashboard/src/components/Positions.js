import React from "react";

import { positions } from "../data/data";
import { usePrices } from "./PriceContext";

const Positions = () => {
  const { getPrice, getChange } = usePrices();

  return (
    <>
      <h3 className="title">Positions ({positions.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg.</th>
              <th>LTP</th>
              <th>P&L</th>
              <th>Chg.</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((stock) => {
              const ltp = getPrice(stock.name) || stock.price;
              const pnl = ltp * stock.qty - stock.avg * stock.qty;
              const dayPct = getChange(stock.name).pct;
              const profClass = pnl >= 0 ? "profit" : "loss";
              const dayClass = dayPct >= 0 ? "profit" : "loss";

              return (
                <tr key={stock.name}>
                  <td>{stock.product}</td>
                  <td>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td>{ltp.toFixed(2)}</td>
                  <td className={profClass}>{pnl.toFixed(2)}</td>
                  <td className={dayClass}>
                    {dayPct >= 0 ? "+" : ""}
                    {dayPct.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Positions;