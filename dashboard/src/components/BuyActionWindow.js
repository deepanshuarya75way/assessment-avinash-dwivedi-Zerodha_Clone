import React, { useContext, useState } from "react";

import axios from "axios";

import GeneralContext from "./GeneralContext";
import { usePrices } from "./PriceContext";

import "./BuyActionWindow.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";

const formatINR = (value) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const BuyActionWindow = ({ uid, mode = "BUY" }) => {
  const { closeBuyWindow } = useContext(GeneralContext);
  const { getPrice } = usePrices();

  const [stockQuantity, setStockQuantity] = useState("1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isBuy = mode === "BUY";
  const livePrice = getPrice(uid);
  const qty = parseInt(stockQuantity, 10);
  const isQtyValid = Number.isInteger(qty) && qty > 0;
  const orderValue = isQtyValid ? qty * livePrice : 0;

  const handleConfirm = async () => {
    if (!isQtyValid) {
      setError("Enter a quantity of 1 or more.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Price is locked at the moment the user confirms.
      await axios.post(`${BACKEND_URL}/newOrder`, {
        name: uid,
        qty,
        price: livePrice,
        mode,
      });
      closeBuyWindow();
    } catch (err) {
      setError(err.response?.data?.message || "Could not place the order.");
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`container order-window ${isBuy ? "mode-buy" : "mode-sell"}`}
      id="buy-window"
    >
      <div className="order-header">
        <h3>
          {isBuy ? "Buy" : "Sell"} {uid} <span>NSE</span>
        </h3>
        <p>Market price (mock) ₹{formatINR(livePrice)}</p>
      </div>

      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              step="1"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
              autoFocus
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="text"
              name="price"
              id="price"
              value={formatINR(livePrice)}
              disabled
              readOnly
            />
          </fieldset>
        </div>

        {error && <p className="order-error">{error}</p>}
      </div>

      <div className="buttons order-buttons">
        <span>
          Order value <strong>₹{formatINR(orderValue)}</strong>
        </span>
        <div>
          <button
            type="button"
            className={`btn ${isBuy ? "btn-blue" : "btn-orange"}`}
            onClick={handleConfirm}
            disabled={submitting || !isQtyValid}
          >
            {submitting ? "Placing..." : isBuy ? "Buy" : "Sell"}
          </button>
          <button
            type="button"
            className="btn btn-grey"
            onClick={closeBuyWindow}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;