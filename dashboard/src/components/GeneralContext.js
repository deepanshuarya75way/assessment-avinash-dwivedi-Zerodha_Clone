import React, { useState } from "react";

import BuyActionWindow from "./BuyActionWindow";

const GeneralContext = React.createContext({
  openBuyWindow: (uid) => {},
  openSellWindow: (uid) => {},
  closeBuyWindow: () => {},
});

export const GeneralContextProvider = (props) => {
  const [isOrderWindowOpen, setIsOrderWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [orderMode, setOrderMode] = useState("BUY");

  const openWindow = (uid, mode) => {
    setOrderMode(mode);
    setSelectedStockUID(uid);
    setIsOrderWindowOpen(true);
  };

  const handleCloseWindow = () => {
    setIsOrderWindowOpen(false);
    setSelectedStockUID("");
  };

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow: (uid) => openWindow(uid, "BUY"),
        openSellWindow: (uid) => openWindow(uid, "SELL"),
        closeBuyWindow: handleCloseWindow,
      }}
    >
      {props.children}
      {isOrderWindowOpen && (
        <BuyActionWindow
          key={`${orderMode}-${selectedStockUID}`}
          uid={selectedStockUID}
          mode={orderMode}
        />
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;