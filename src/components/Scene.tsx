import type { Layer, Line, Tone } from '../core/types';

const tc = (tone?: Tone) => (tone ? ` t-${tone}` : '');

function Lines({ lines, className }: { lines: Line[]; className: string }) {
  return (
    <div className={className}>
      {lines.map((l, i) => (
        <div key={i} className={`ln${tc(l.tone)}`}>
          <code>{l.text || ' '}</code>
          {l.note && <span className="ln-note">{l.note}</span>}
        </div>
      ))}
    </div>
  );
}

function LayerView({ layer }: { layer: Layer }) {
  switch (layer.kind) {
    case 'states':
      return (
        <div className="states">
          {layer.states.map((s, i) => (
            <span key={s} className="state-wrap">
              {i > 0 && <span className="state-arrow">→</span>}
              <span className={`state${s === layer.current ? ' on' : ''}`}>{s}</span>
            </span>
          ))}
        </div>
      );
    case 'timeline':
      return (
        <ol className="timeline">
          {layer.events.map((e, i) => (
            <li key={i} className={tc(e.tone).trim()}>
              <span className="tl-at">{e.at}</span>
              <span>{e.text}</span>
            </li>
          ))}
        </ol>
      );
    case 'terminal':
      return <Lines lines={layer.lines} className="terminal" />;
    case 'file':
      return (
        <div className="file">
          <div className="file-name">{layer.name}</div>
          <Lines lines={layer.lines} className="file-body" />
        </div>
      );
    case 'layers':
      return (
        <div className="img-layers">
          {layer.items.map((l, i) => (
            <div key={i} className={`img-layer${tc(l.tone)}`}>
              <code>{l.text}</code>
              {l.note && <span className="ln-note">{l.note}</span>}
            </div>
          ))}
        </div>
      );
    case 'flow':
      return (
        <div className="flow">
          {layer.nodes.map((n, i) => (
            <span key={i} className="flow-wrap">
              {i > 0 && (
                <span className={`flow-link${tc(layer.links?.[i - 1]?.tone)}`}>
                  {layer.links?.[i - 1]?.text && <small>{layer.links[i - 1].text}</small>}→
                </span>
              )}
              <span className={`flow-node${tc(n.tone)}`}>
                {n.text}
                {n.note && <small>{n.note}</small>}
              </span>
            </span>
          ))}
        </div>
      );
    case 'size-bar': {
      const max = Math.max(...layer.items.map((it) => it.value));
      return (
        <div className="size-bars">
          {layer.items.map((it, i) => (
            <div key={i} className="size-row">
              <div className="size-head">
                <code>{it.text}</code>
                <span className="size-shown">{it.shown}</span>
              </div>
              <div className="size-track">
                <div className={`size-fill${tc(it.tone)}`} style={{ width: `${Math.max((it.value / max) * 100, 1.5)}%` }} />
              </div>
            </div>
          ))}
        </div>
      );
    }
    case 'table':
      return (
        <table className="tbl">
          <thead>
            <tr>
              {layer.head.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {layer.rows.map((r, i) => (
              <tr key={i} className={tc(r.tone).trim()}>
                {r.cells.map((c, j) => (
                  <td key={j}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
  }
}

export function Scene({ layers }: { layers: Layer[] }) {
  return (
    <div className="scene">
      {layers.map((l, i) => (
        <div key={i}>
          {l.label && <div className="layer-label">{l.label}</div>}
          <LayerView layer={l} />
        </div>
      ))}
    </div>
  );
}
