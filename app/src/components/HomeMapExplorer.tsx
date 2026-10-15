"use client";
import {
  useState,
  type ReactNode,
  type PointerEvent,
  type MouseEvent,
} from "react";
type StateRow = { code: string; name: string; value: string; href: string };
export function HomeMapExplorer({
  states,
  initial,
  children,
}: {
  states: StateRow[];
  initial: string;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState(initial);
  const [hover, setHover] = useState<string | null>(null);
  const current = states.find((s) => s.code === (hover || selected))!;
  const codeAt = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest("a[data-state]")?.getAttribute("data-state")
      : null;
  function point(e: PointerEvent<HTMLDivElement>) {
    const code = codeAt(e.target);
    if (code) setHover(code);
  }
  function tap(e: MouseEvent<HTMLDivElement>) {
    const code = codeAt(e.target);
    if (code && matchMedia("(pointer: coarse)").matches && selected !== code) {
      e.preventDefault();
      setSelected(code);
      setHover(null);
    }
  }
  return (
    <div className="home-money-map" data-selected={selected}>
      <style>{`.home-money-map a[data-state="${selected}"] path { stroke: #ad8233; stroke-width: 2.4; }`}</style>
      <div className="home-map-explorer">
        <form
          action="/#money"
          method="get"
          onSubmit={(e) => e.preventDefault()}
        >
          <label>
            Find your state
            <select
              name="state"
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setHover(null);
              }}
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Show state</button>
        </form>
        <div className="home-map-readout" aria-live="polite" aria-atomic="true">
          <strong>
            {current.name} · {current.value} to be top 1%
          </strong>
          <span>Windfall household estimate · April 2026</span>
          <a href={current.href}>See {current.name}'s figure →</a>
        </div>
      </div>
      <div
        className="home-map-canvas"
        onPointerOver={point}
        onPointerLeave={() => setHover(null)}
        onClick={tap}
        onFocus={(e) => {
          const code = codeAt(e.target);
          if (code) setHover(code);
        }}
        onBlur={() => setHover(null)}
      >
        {children}
      </div>
      <p className="home-map-instructions">
        Hover or focus to preview. On touch screens, tap once for the figure and
        again to open the state. The dropdown highlights a state.
      </p>
    </div>
  );
}
