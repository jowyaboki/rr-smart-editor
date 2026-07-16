import { ASTNode, ExpressionContext } from './types';

// List of forbidden property keys to prevent prototype pollution / sandbox escape
const FORBIDDEN_PROPERTIES = new Set(['__proto__', 'constructor', 'prototype']);

export function evaluateAST(node: ASTNode, context: ExpressionContext): any {
  switch (node.type) {
    case 'Literal':
      return node.value;

    case 'Identifier': {
      if (node.name in context.variables) {
        return context.variables[node.name];
      }
      if (context.resolveReference) {
        const refVal = context.resolveReference(node.name);
        if (refVal !== undefined) return refVal;
      }
      throw new Error(`Variable or Reference "${node.name}" is not defined`);
    }

    case 'UnaryExpression': {
      const argVal = evaluateAST(node.argument, context);
      switch (node.operator) {
        case '!':
          return !argVal;
        case '-':
          return -argVal;
        default:
          throw new Error(`Unsupported unary operator: ${node.operator}`);
      }
    }

    case 'BinaryExpression': {
      const leftVal = evaluateAST(node.left, context);

      // Short-circuit evaluation for logical operators
      if (node.operator === '&&') {
        return leftVal && evaluateAST(node.right, context);
      }
      if (node.operator === '||') {
        return leftVal || evaluateAST(node.right, context);
      }

      const rightVal = evaluateAST(node.right, context);

      switch (node.operator) {
        case '+':
          return leftVal + rightVal;
        case '-':
          return leftVal - rightVal;
        case '*':
          return leftVal * rightVal;
        case '/':
          if (rightVal === 0) {
            return 0; // Prevent Division by Zero NaN
          }
          return leftVal / rightVal;
        case '%':
          return leftVal % rightVal;
        case '^':
          return Math.pow(leftVal, rightVal);
        case '==':
          return leftVal == rightVal;
        case '!=':
          return leftVal != rightVal;
        case '<':
          return leftVal < rightVal;
        case '>':
          return leftVal > rightVal;
        case '<=':
          return leftVal <= rightVal;
        case '>=':
          return leftVal >= rightVal;
        default:
          throw new Error(`Unsupported binary operator: ${node.operator}`);
      }
    }

    case 'ArrayExpression':
      return node.elements.map((el) => evaluateAST(el, context));

    case 'ObjectExpression': {
      const result: Record<string, any> = {};
      for (const [key, valNode] of Object.entries(node.properties)) {
        if (FORBIDDEN_PROPERTIES.has(key)) {
          throw new Error(`Security Exception: Access to property "${key}" is forbidden`);
        }
        result[key] = evaluateAST(valNode, context);
      }
      return result;
    }

    case 'MemberExpression': {
      const obj = evaluateAST(node.object, context);
      if (obj === null || obj === undefined) {
        throw new Error(`Cannot read property of ${obj}`);
      }

      let key: any;
      if (node.computed) {
        key = evaluateAST(node.property, context);
      } else {
        if (node.property.type === 'Identifier') {
          key = node.property.name;
        } else {
          key = evaluateAST(node.property, context);
        }
      }

      if (typeof key === 'string' && FORBIDDEN_PROPERTIES.has(key)) {
        throw new Error(`Security Exception: Access to property "${key}" is forbidden`);
      }

      return obj[key];
    }

    case 'CallExpression': {
      let func: any;
      if (node.callee.type === 'Identifier') {
        const name = node.callee.name;
        if (name in context.functions) {
          func = context.functions[name];
        } else if (name in context.variables && typeof context.variables[name] === 'function') {
          func = context.variables[name];
        } else {
          throw new Error(`Function "${name}" is not defined`);
        }
      } else {
        func = evaluateAST(node.callee, context);
      }

      if (typeof func !== 'function') {
        throw new Error('Callee is not a function');
      }

      const args = node.arguments.map((arg) => evaluateAST(arg, context));
      return func(...args);
    }

    case 'ConditionalExpression': {
      const testVal = evaluateAST(node.test, context);
      if (testVal) {
        return evaluateAST(node.consequent, context);
      } else {
        return evaluateAST(node.alternate, context);
      }
    }

    default:
      throw new Error(`Unknown AST Node Type: ${(node as any).type}`);
  }
}
