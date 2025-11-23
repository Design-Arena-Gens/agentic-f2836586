"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CurrencyRate,
  allCurrencies,
  computeRateToDzd,
  convertAmount,
  getRates,
} from "../utils/rates";

const keypadLayout = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  [".", "0", "?"],
];

export default function Converter() {
  const [amount, setAmount] = useState<string>("0");
  const [from, setFrom] = useState<string>("DZD");
  const [to, setTo] = useState<string>("EUR");
  const [snapshot, setSnapshot] = useState<{
    baseEurToDzd: number;
    baseUsdToDzd: number;
    custom: CurrencyRate[];
  } | null>(null);

  useEffect(() => {
    setSnapshot(getRates());
  }, []);

  const currencies = useMemo(() => allCurrencies(snapshot?.custom || []), [snapshot]);

  const output = useMemo(() => {
    if (!snapshot) return "0";
    const parsed = parseFloat(amount || "0");
    if (Number.isNaN(parsed)) return "0";
    const result = convertAmount(
      parsed,
      from,
      to,
      snapshot.baseEurToDzd,
      snapshot.baseUsdToDzd,
      snapshot.custom
    );
    return formatNumber(result);
  }, [amount, from, to, snapshot]);

  function onKey(key: string) {
    if (key === "?") {
      setAmount((a) => (a.length <= 1 ? "0" : a.slice(0, -1)));
      return;
    }
    if (key === ".") {
      setAmount((a) => (a.includes(".") ? a : a + "."));
      return;
    }
    setAmount((a) => {
      if (a === "0") return key;
      return a + key;
    });
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <section className="card">
      <div className="row">
        <div className="col">
          <label className="label">From</label>
          <select
            className="select"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
        <div className="col">
          <label className="label">To</label>
          <select className="select" value={to} onChange={(e) => setTo(e.target.value)}>
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="display">
        <div className="display-row">
          <span className="display-amount">{amount}</span>
          <span className="display-code">{from}</span>
        </div>
        <div className="display-row">
          <span className="display-result">{output}</span>
          <span className="display-code">{to}</span>
        </div>
      </div>

      <div className="keypad">
        {keypadLayout.map((row, idx) => (
          <div className="keypad-row" key={idx}>
            {row.map((k) => (
              <button key={k} className="key" onClick={() => onKey(k)}>
                {k}
              </button>
            ))}
          </div>
        ))}
        <div className="actions">
          <button className="btn" onClick={() => setAmount("0")}>
            C
          </button>
          <button className="btn" onClick={swap}>
            ?
          </button>
        </div>
      </div>

      {snapshot && (
        <div className="rates-note">
          <small>
            EUR?DZD: {formatNumber(snapshot.baseEurToDzd)} ? USD?DZD:{" "}
            {formatNumber(snapshot.baseUsdToDzd)}
          </small>
        </div>
      )}
    </section>
  );
}

function formatNumber(n: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 6,
  }).format(n);
}

