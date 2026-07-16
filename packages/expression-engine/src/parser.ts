import { ASTNode, LiteralNode, IdentifierNode, MemberExpressionNode, CallExpressionNode, ConditionalExpressionNode } from './types';

export interface Token {
  type: 'Number' | 'String' | 'Boolean' | 'Identifier' | 'Operator' | 'Punctuator' | 'EOF';
  value: string;
  line: number;
  column: number;
}

const FORBIDDEN_PROPERTIES = new Set(['__proto__', 'constructor', 'prototype']);

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let line = 1;
  let lineStart = 0;

  while (index < source.length) {
    const char = source[index];

    // Newlines
    if (char === '\n') {
      line++;
      index++;
      lineStart = index;
      continue;
    }

    // Whitespace
    if (/\s/.test(char)) {
      index++;
      continue;
    }

    const column = index - lineStart + 1;

    // Numbers
    if (/\d/.test(char) || (char === '.' && index + 1 < source.length && /\d/.test(source[index + 1]))) {
      let numStr = '';
      let hasDot = false;
      while (index < source.length) {
        const c = source[index];
        if (c === '.') {
          if (hasDot) break;
          hasDot = true;
          numStr += c;
          index++;
        } else if (/\d/.test(c)) {
          numStr += c;
          index++;
        } else {
          break;
        }
      }
      tokens.push({ type: 'Number', value: numStr, line, column });
      continue;
    }

    // Strings
    if (char === '"' || char === "'") {
      const quoteType = char;
      let strVal = '';
      index++; // Skip quote
      let closed = false;
      while (index < source.length) {
        const c = source[index];
        if (c === quoteType) {
          closed = true;
          index++; // Skip quote
          break;
        } else if (c === '\\') {
          // Handle simple escapes
          index++;
          if (index < source.length) {
            strVal += source[index];
            index++;
          }
        } else {
          strVal += c;
          index++;
        }
      }
      if (!closed) {
        throw new Error(`Unterminated string starting at line ${line}, column ${column}`);
      }
      tokens.push({ type: 'String', value: strVal, line, column });
      continue;
    }

    // Check Multi-character Operators and Booleans
    const twoChars = source.slice(index, index + 2);
    if (twoChars === '&&' || twoChars === '||' || twoChars === '==' || twoChars === '!=' || twoChars === '<=' || twoChars === '>=') {
      tokens.push({ type: 'Operator', value: twoChars, line, column });
      index += 2;
      continue;
    }

    // Single-character Operators
    if ('+-*/%^!?=:><'.includes(char)) {
      tokens.push({ type: 'Operator', value: char, line, column });
      index++;
      continue;
    }

    // Punctuators
    if ('(),.[]{}'.includes(char)) {
      tokens.push({ type: 'Punctuator', value: char, line, column });
      index++;
      continue;
    }

    // Identifiers and Booleans
    if (/[a-zA-Z_]/.test(char)) {
      let idStr = '';
      while (index < source.length && /[a-zA-Z0-9_]/.test(source[index])) {
        idStr += source[index];
        index++;
      }
      if (idStr === 'true' || idStr === 'false') {
        tokens.push({ type: 'Boolean', value: idStr, line, column });
      } else {
        tokens.push({ type: 'Identifier', value: idStr, line, column });
      }
      continue;
    }

    throw new Error(`Unexpected character '${char}' at line ${line}, column ${column}`);
  }

  tokens.push({ type: 'EOF', value: '', line, column: index - lineStart + 1 });
  return tokens;
}

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private check(type: Token['type'], value?: string): boolean {
    if (this.isAtEnd()) return false;
    const tok = this.peek();
    if (tok.type !== type) return false;
    if (value !== undefined && tok.value !== value) return false;
    return true;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private match(type: Token['type'], ...values: string[]): boolean {
    if (this.isAtEnd()) return false;
    const tok = this.peek();
    if (tok.type === type) {
      if (values.length === 0 || values.includes(tok.value)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: Token['type'], message: string, value?: string): Token {
    if (this.check(type, value)) return this.advance();
    const tok = this.peek();
    throw new Error(`${message} (Found ${tok.type} "${tok.value}" at line ${tok.line}, col ${tok.column})`);
  }

  public parse(): ASTNode {
    const expr = this.expression();
    if (!this.isAtEnd()) {
      const tok = this.peek();
      throw new Error(`Unexpected token "${tok.value}" after expression at line ${tok.line}, col ${tok.column}`);
    }
    return expr;
  }

  private expression(): ASTNode {
    return this.conditional();
  }

  private conditional(): ASTNode {
    let expr = this.logicalOr();

    if (this.match('Operator', '?')) {
      const consequent = this.expression();
      this.consume('Operator', "Expect ':' after ternary condition branch", ':');
      const alternate = this.conditional();
      const node: ConditionalExpressionNode = {
        type: 'ConditionalExpression',
        test: expr,
        consequent,
        alternate,
      };
      return node;
    }

    return expr;
  }

  private logicalOr(): ASTNode {
    let expr = this.logicalAnd();

    while (this.match('Operator', '||')) {
      const op = this.previous().value;
      const right = this.logicalAnd();
      expr = {
        type: 'BinaryExpression',
        operator: op,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private logicalAnd(): ASTNode {
    let expr = this.equality();

    while (this.match('Operator', '&&')) {
      const op = this.previous().value;
      const right = this.equality();
      expr = {
        type: 'BinaryExpression',
        operator: op,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private equality(): ASTNode {
    let expr = this.comparison();

    while (this.match('Operator', '==', '!=')) {
      const op = this.previous().value;
      const right = this.comparison();
      expr = {
        type: 'BinaryExpression',
        operator: op,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private comparison(): ASTNode {
    let expr = this.term();

    while (this.match('Operator', '<', '>', '<=', '>=')) {
      const op = this.previous().value;
      const right = this.term();
      expr = {
        type: 'BinaryExpression',
        operator: op,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private term(): ASTNode {
    let expr = this.factor();

    while (this.match('Operator', '+', '-')) {
      const op = this.previous().value;
      const right = this.factor();
      expr = {
        type: 'BinaryExpression',
        operator: op,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private factor(): ASTNode {
    let expr = this.exponent();

    while (this.match('Operator', '*', '/', '%')) {
      const op = this.previous().value;
      const right = this.exponent();
      expr = {
        type: 'BinaryExpression',
        operator: op,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private exponent(): ASTNode {
    let expr = this.unary();

    if (this.match('Operator', '^')) {
      const op = this.previous().value;
      const right = this.exponent(); // Right associative!
      expr = {
        type: 'BinaryExpression',
        operator: op,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private unary(): ASTNode {
    if (this.match('Operator', '!', '-')) {
      const op = this.previous().value;
      const right = this.unary();
      return {
        type: 'UnaryExpression',
        operator: op,
        argument: right,
      };
    }

    return this.callOrMember();
  }

  private callOrMember(): ASTNode {
    let expr = this.primary();

    while (true) {
      if (this.match('Punctuator', '.')) {
        const nameTok = this.consume('Identifier', "Expect property name after '.'");
        const propNode: IdentifierNode = {
          type: 'Identifier',
          name: nameTok.value,
        };
        const node: MemberExpressionNode = {
          type: 'MemberExpression',
          object: expr,
          property: propNode,
          computed: false,
        };
        expr = node;
      } else if (this.match('Punctuator', '[')) {
        const indexExpr = this.expression();
        this.consume('Punctuator', "Expect ']' after index expression", ']');
        const node: MemberExpressionNode = {
          type: 'MemberExpression',
          object: expr,
          property: indexExpr,
          computed: true,
        };
        expr = node;
      } else if (this.match('Punctuator', '(')) {
        const args: ASTNode[] = [];
        if (!this.check('Punctuator', ')')) {
          do {
            args.push(this.expression());
          } while (this.match('Punctuator', ','));
        }
        this.consume('Punctuator', "Expect ')' after function arguments", ')');
        const node: CallExpressionNode = {
          type: 'CallExpression',
          callee: expr,
          arguments: args,
        };
        expr = node;
      } else {
        break;
      }
    }

    return expr;
  }

  private primary(): ASTNode {
    if (this.match('Boolean')) {
      const val = this.previous().value === 'true';
      const node: LiteralNode = { type: 'Literal', value: val };
      return node;
    }

    if (this.match('Number')) {
      const val = parseFloat(this.previous().value);
      const node: LiteralNode = { type: 'Literal', value: val };
      return node;
    }

    if (this.match('String')) {
      const val = this.previous().value;
      const node: LiteralNode = { type: 'Literal', value: val };
      return node;
    }

    if (this.match('Identifier')) {
      const name = this.previous().value;
      const node: IdentifierNode = { type: 'Identifier', name };
      return node;
    }

    // Grouping
    if (this.match('Punctuator', '(')) {
      const expr = this.expression();
      this.consume('Punctuator', "Expect ')' after expression", ')');
      return expr;
    }

    // Array Literals e.g. [1, 2, 3]
    if (this.match('Punctuator', '[')) {
      const elements: ASTNode[] = [];
      if (!this.check('Punctuator', ']')) {
        do {
          elements.push(this.expression());
        } while (this.match('Punctuator', ','));
      }
      this.consume('Punctuator', "Expect ']' after array elements", ']');
      return {
        type: 'ArrayExpression',
        elements,
      };
    }

    // Object Literals e.g. { x: 1, y: 2 }
    if (this.match('Punctuator', '{')) {
      const properties = Object.create(null);
      if (!this.check('Punctuator', '}')) {
        do {
          let key: string;
          if (this.match('Identifier') || this.match('String')) {
            key = this.previous().value;
          } else {
            const tok = this.peek();
            throw new Error(`Expect property name or string literal at line ${tok.line}, col ${tok.column}`);
          }
          if (FORBIDDEN_PROPERTIES.has(key)) {
            throw new Error(`Security Exception: Forbidden property name "${key}" in object literal`);
          }
          this.consume('Operator', "Expect ':' after property key", ':');
          properties[key] = this.expression();
        } while (this.match('Punctuator', ','));
      }
      this.consume('Punctuator', "Expect '}' after object properties", '}');
      return {
        type: 'ObjectExpression',
        properties,
      };
    }

    const tok = this.peek();
    throw new Error(`Expect expression but found ${tok.type} "${tok.value}" at line ${tok.line}, col ${tok.column}`);
  }
}

export function parseExpression(source: string): ASTNode {
  const tokens = tokenize(source);
  const parser = new Parser(tokens);
  return parser.parse();
}
