import { ADD, DIV, MUL, NEG, Railyard, SUB } from 'railyard';

const lexerRules = [
  /([a-zA-Z_]\w*)/g,
  /(\d+(\.\d*)?)/g,
  /([+*^/()-])/g,
  /\s+/g,
];

function * tokenize(code: string) {
  const len = code.length;
  let cursor = 0;
  scan: while (cursor < len) {
    for (const rule of lexerRules) {
      rule.lastIndex = cursor;
      const match = rule.exec(code);
      if (match && match.index === cursor) {
        if (match.length > 1) { yield match[1]; }
        cursor += match[0].length;
        continue scan;
      }
    }
    throw new Error(`Unrecognized token in formula "${code}" at position ${cursor}`);
  }
}

function getParser() {
  return new Railyard()
    .register({ type: 'infix', name: '^', precedence: 9, associativity: "right", fn: Math.pow })
    .register({ type: 'infix', name: '*', precedence: 8, associativity: "left", fn: MUL })
    .register({ type: 'infix', name: '/', precedence: 8, associativity: "left", fn: DIV })
    .register({ type: 'infix', name: '+', precedence: 8, associativity: "left", fn: ADD })
    .register({ type: 'infix', name: '-', precedence: 8, associativity: "left", fn: SUB })
    .register({ type: 'function', name: '-', arity: 1, fn: NEG })
    .register({ type: 'function', name: 'sin', arity: 1, fn: Math.sin })
    .register({ type: 'function', name: 'log', arity: 1, fn: Math.log })
    .register({ type: 'function', name: 'cos', arity: 1, fn: Math.cos });
}

function getFree(expr: string[], parser: Railyard) {
  const vars = new Set<string>();
  for (const { type, value } of parser.parseToRPN(expr)) {
    if (type === 'value') { vars.add(value as string); }
  }
  return vars;
}

function resolveConstants(
  constants: { [key: string]: number | string },
  vals: { [key: string]: number },
  parser: Railyard,
) {
  let deps: [string, string[], string[]][] = [];
  for (const [key, expr] of Object.entries(constants)) {
    if (typeof expr === 'number') {
      vals[key] = expr;
    } else {
      const s = [...tokenize(expr)];
      deps.push([key, s, [...getFree(s, parser)]]);
    }
  }
  while (deps.length > 0) {
    const ndeps: [string, string[], string[]][] = [];
    for (const [k, e, d] of deps) {
      const nd = d.filter(v => typeof vals[v] !== 'number');
      if (nd.length === 0) {
        vals[k] = parser.interpret(e) as number;
      } else {
        ndeps.push([k, e, nd]);
      }
    }
    if (ndeps.length === deps.length) {
      throw new Error("Recursive formula in constant definitions");
    }
    deps = ndeps;
  }
}

export type InterpFn = (f: number | string) => number;
export type InterpArgs = (a: { [key: string]: number }) => void;
export type DynamicFn = (expr: string) => (t: number) => number;

export function getInterpreter(
  constants: { [key: string]: number | string } = {},
): [InterpArgs, InterpFn, DynamicFn] {
  const parser = getParser();

  const vals: { [key: string]: number } = { pi: Math.PI, e: Math.E };
  let args: { [key: string]: number } = {};

  parser.lookup(s => {
    let val = parseFloat(s);
    if (isNaN(val)) { val = vals[s]; }
    if (typeof val !== 'number') { val = args[s]; }
    if (typeof val !== 'number') {
      throw new Error(`Unknown constant ${s}`);
    }
    return val;
  });

  resolveConstants(constants, vals, parser);

  const argFn = (a: { [key: string]: number }) => { args = a; };
  const interpFn = (f: number | string) => {
    if (typeof f === 'number') { return f; }
    
    try {
      return parser.interpret(tokenize(f)) as number;
    } catch (_) {
      throw new Error(`Invalid formula "${f}"`);
    }
  };

  const dynFn = (expr: string) => {
    const { fn, free: { vars } } = parser.compile(tokenize(expr));
    vars.delete('t');
    if (vars.size > 0) {
      throw new Error(`Invalid formula "${expr}"`);
    }
    return (t: number) => {
      try {
        return fn({ t }) as number;
      } catch (_) {
        throw new Error(`Invalid formula "${expr}"`);
      }
    };
  }
  
  return [argFn, interpFn, dynFn];
}