import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { watchlist, holdings, positions } from "../data/data";

// ---------------------------------------------------------------------------
// Mock market engine. No real market API is used: prices are generated locally
// by a bounded random walk and refreshed on a fixed interval.
// ---------------------------------------------------------------------------

export const TICK_INTERVAL_MS = 2000; // how often prices update
const TICK_SIZE = 0.05; // NSE-style minimum price step
const MAX_STEP_PCT = 0.006; // max move per tick: +/- 0.6%
const MAX_DRIFT_PCT = 0.1; // never wander more than 10% from the open

const roundToTick = (value) =>
  Math.round(value / TICK_SIZE) * TICK_SIZE;

const round2 = (value) => Math.round(value * 100) / 100;

// Seed every known symbol once, using the first price we see for it as its
// "open" (previous close) reference.
const buildInitialState = () => {
  const open = {};
  [...watchlist, ...holdings, ...positions].forEach((item) => {
    if (open[item.name] === undefined) open[item.name] = item.price;
  });

  return { open, price: { ...open } };
};

// Produce the next price for one symbol. Direction is random, with a gentle
// pull back toward the open so prices go both up AND down and stay sensible.
const nextPrice = (current, open) => {
  const pull = ((open - current) / open) * 0.15;
  const move = (Math.random() * 2 - 1) * MAX_STEP_PCT + pull * MAX_STEP_PCT;

  let next = roundToTick(current * (1 + move));

  // Guarantee a visible tick so the UI is never "stuck" on the same price.
  if (next === roundToTick(current)) {
    next = current + (Math.random() < 0.5 ? -TICK_SIZE : TICK_SIZE);
  }

  const floor = open * (1 - MAX_DRIFT_PCT);
  const ceil = open * (1 + MAX_DRIFT_PCT);
  return round2(Math.min(ceil, Math.max(floor, next)));
};

const PriceContext = createContext({
  prices: {},
  getPrice: () => 0,
  getChange: () => ({ abs: 0, pct: 0, isDown: false }),
  registerSymbols: () => {},
});

export const PriceProvider = ({ children }) => {
  const [state, setState] = useState(buildInitialState);

  // Periodic price updates.
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => {
        const price = {};
        Object.keys(prev.price).forEach((symbol) => {
          price[symbol] = nextPrice(prev.price[symbol], prev.open[symbol]);
        });
        return { ...prev, price };
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  // Lets components (e.g. Holdings loaded from the DB) add symbols that the
  // engine doesn't know about yet, so they start moving too.
  const registerSymbols = useCallback((items) => {
    setState((prev) => {
      const missing = items.filter(
        (item) => item && item.name && prev.open[item.name] === undefined
      );
      if (missing.length === 0) return prev;

      const open = { ...prev.open };
      const price = { ...prev.price };
      missing.forEach((item) => {
        const base = Number(item.price) > 0 ? Number(item.price) : 100;
        open[item.name] = base;
        price[item.name] = base;
      });
      return { open, price };
    });
  }, []);

  const value = useMemo(() => {
    const getPrice = (name) => state.price[name] ?? 0;

    const getChange = (name) => {
      const open = state.open[name];
      const current = state.price[name];
      if (!open || current === undefined) {
        return { abs: 0, pct: 0, isDown: false };
      }
      const abs = current - open;
      return { abs, pct: (abs / open) * 100, isDown: abs < 0 };
    };

    return { prices: state.price, getPrice, getChange, registerSymbols };
  }, [state, registerSymbols]);

  return (
    <PriceContext.Provider value={value}>{children}</PriceContext.Provider>
  );
};

export const usePrices = () => useContext(PriceContext);

export default PriceContext;