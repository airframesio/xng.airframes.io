import { useState } from 'react';
import { event } from '../lib/gtag';

// Tiny, dependency-free tokenizer. It returns React nodes (never raw HTML), so
// there's no injection surface. Good enough to make shell + TOML + config
// snippets readable without pulling in a full highlighter.

const CMDS = /^(xng|cargo|docker|sudo|apt|apt-get|brew|tar|cp|mv|systemctl|curl|git|dumpvdl2|dumphfdl|acarsdec)$/;

function scan(text, rules, keyBase) {
  const out = [];
  let pos = 0;
  let plain = '';
  const flush = () => {
    if (plain) {
      out.push(plain);
      plain = '';
    }
  };
  while (pos < text.length) {
    let matched = false;
    for (const { re, cls } of rules) {
      re.lastIndex = pos;
      const m = re.exec(text);
      if (m && m.index === pos && m[0].length) {
        flush();
        out.push(
          <span className={cls} key={`${keyBase}-${pos}`}>
            {m[0]}
          </span>
        );
        pos += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      plain += text[pos];
      pos += 1;
    }
  }
  flush();
  return out;
}

function highlightLine(line, lang, idx) {
  const key = `l${idx}`;

  if (lang === 'bash' || lang === 'console' || lang === 'sh') {
    const rules = [
      { re: /#.*/y, cls: 'tok-com' },
      { re: /"[^"]*"|'[^']*'/y, cls: 'tok-str' },
      { re: /--?[A-Za-z][\w-]*/y, cls: 'tok-flag' },
      { re: /[A-Za-z][\w./-]*/y, cls: '__word' },
      { re: /\b\d[\d._]*[kKmMgG]?\b/y, cls: 'tok-num' },
    ];
    // leading prompt
    let rest = line;
    const nodes = [];
    const pm = /^(\s*)(\$)(\s)/.exec(line);
    if (pm) {
      nodes.push(pm[1]);
      nodes.push(
        <span className="tok-prompt" key={`${key}-p`}>
          $
        </span>
      );
      nodes.push(pm[3]);
      rest = line.slice(pm[0].length);
    }
    const toks = scan(rest, rules, key).map((n, i) => {
      if (n && n.props && n.props.className === '__word') {
        const w = n.props.children;
        return (
          <span className={CMDS.test(w) ? 'tok-cmd' : undefined} key={`${key}-w${i}`}>
            {w}
          </span>
        );
      }
      return n;
    });
    return [...nodes, ...toks];
  }

  if (lang === 'toml' || lang === 'ini') {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('#')) {
      return [
        <span className="tok-com" key={`${key}-c`}>
          {line}
        </span>,
      ];
    }
    if (trimmed.startsWith('[')) {
      const lead = line.slice(0, line.length - trimmed.length);
      const hashAt = trimmed.indexOf('#');
      const head = hashAt >= 0 ? trimmed.slice(0, hashAt) : trimmed;
      const tail = hashAt >= 0 ? trimmed.slice(hashAt) : '';
      return [
        lead,
        <span className="tok-key" key={`${key}-s`}>
          {head}
        </span>,
        tail ? (
          <span className="tok-com" key={`${key}-sc`}>
            {tail}
          </span>
        ) : null,
      ];
    }
    const rules = [
      { re: /#.*/y, cls: 'tok-com' },
      { re: /^[ \t]*[A-Za-z0-9_.-]+(?=\s*=)/y, cls: 'tok-key' },
      { re: /"[^"]*"/y, cls: 'tok-str' },
      { re: /\b(true|false)\b/y, cls: 'tok-num' },
      { re: /\b\d[\d._:+-]*\b/y, cls: 'tok-num' },
    ];
    return scan(line, rules, key);
  }

  if (lang === 'json') {
    const rules = [
      { re: /"[^"]*"(?=\s*:)/y, cls: 'tok-key' },
      { re: /"[^"]*"/y, cls: 'tok-str' },
      { re: /\b(true|false|null)\b/y, cls: 'tok-num' },
      { re: /-?\b\d[\d._eE+-]*\b/y, cls: 'tok-num' },
    ];
    return scan(line, rules, key);
  }

  return [line];
}

export default function CodeBlock({ code, lang = 'bash', title }) {
  const [copied, setCopied] = useState(false);
  const text = String(code).replace(/\n$/, '');
  const lines = text.split('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      event({ action: 'code_copy', category: 'engagement', label: title || lang, value: 1 });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div className="code">
      <div className="code__bar">
        <span className="code__lang mono">{lang}</span>
        {title ? <span className="code__title mono">{title}</span> : null}
        <button type="button" className={`code__copy ${copied ? 'is-copied' : ''}`} onClick={copy} aria-label="Copy code">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>
          {lines.map((line, i) => (
            <span key={i}>
              {highlightLine(line, lang, i)}
              {i < lines.length - 1 ? '\n' : ''}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
