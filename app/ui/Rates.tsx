"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CurrencyRate,
  allCurrencies,
  computeRateToDzd,
  getRates,
  saveRates,
} from "../utils/rates";

export default function Rates() {
  const [eurToDzd, setEurToDzd] = useState<string>("0");
  const [usdToDzd, setUsdToDzd] = useState<string>("0");
  const [custom, setCustom] = useState<CurrencyRate[]>([]);

  const snapshot = useMemo(
    () => ({ baseEurToDzd: parseFloat(eurToDzd) || 0, baseUsdToDzd: parseFloat(usdToDzd) || 0, custom }),
    [eurToDzd, usdToDzd, custom]
  );

  useEffect(() => {
    const s = getRates();
    setEurToDzd(String(s.baseEurToDzd));
    setUsdToDzd(String(s.baseUsdToDzd));
    setCustom(s.custom);
  }, []);

  function addCurrency() {
    setCustom((curr) => [
      ...curr,
      { code: "GBP", anchor: "EUR", perAnchor: 0.85 },
    ]);
  }

  function updateRow(index: number, next: Partial<CurrencyRate>) {
    setCustom((curr) =>
      curr.map((c, i) => (i === index ? { ...c, ...next } : c))
    );
  }

  function removeRow(index: number) {
    setCustom((curr) => curr.filter((_, i) => i !== index));
  }

  function onSave() {
    saveRates({
      baseEurToDzd: parseFloat(eurToDzd) || 0,
      baseUsdToDzd: parseFloat(usdToDzd) || 0,
      custom,
    });
    alert("Rates saved locally.");
  }

  const currencies = allCurrencies(custom);

  return (
    <section className="card">
      <h2 className="h2">Base Rates</h2>
      <div className="grid2">
        <label className="field">
          <span className="label">1 EUR ? DZD</span>
          <input
            className="input"
            type="number"
            value={eurToDzd}
            onChange={(e) => setEurToDzd(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="label">1 USD ? DZD</span>
          <input
            className="input"
            type="number"
            value={usdToDzd}
            onChange={(e) => setUsdToDzd(e.target.value)}
          />
        </label>
      </div>

      <div className="row between">
        <h2 className="h2">Custom Currencies</h2>
        <button className="btn" onClick={addCurrency}>Add</button>
      </div>

      <div className="table">
        <div className="thead">
          <div>Code</div>
          <div>Anchor</div>
          <div>1 unit = ? Anchor</div>
          <div>? DZD (computed)</div>
          <div></div>
        </div>
        {custom.map((c, idx) => (
          <div key={idx} className="trow">
            <div>
              <input
                className="input"
                value={c.code}
                onChange={(e) => updateRow(idx, { code: e.target.value.toUpperCase().slice(0, 6) })}
              />
            </div>
            <div>
              <select
                className="select"
                value={c.anchor}
                onChange={(e) =>
                  updateRow(idx, { anchor: e.target.value as "EUR" | "USD" })
                }
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <input
                className="input"
                type="number"
                step="0.000001"
                value={c.perAnchor}
                onChange={(e) =>
                  updateRow(idx, { perAnchor: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="mono">
              {formatNumber(
                computeRateToDzd(
                  c,
                  parseFloat(eurToDzd) || 0,
                  parseFloat(usdToDzd) || 0
                )
              )}
            </div>
            <div>
              <button className="btn danger" onClick={() => removeRow(idx)}>
                ?
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="actions end">
        <button className="btn primary" onClick={onSave}>
          Save Rates
        </button>
      </div>

      <div className="hint">
        <small>
          Define custom currencies as a multiple of EUR or USD. Example: if 1 GBP = 1.15 EUR,
          set Anchor=EUR and 1 unit = 1.15.
        </small>
      </div>
    </section>
  );
}

function formatNumber(n: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 6,
  }).format(n);
}

