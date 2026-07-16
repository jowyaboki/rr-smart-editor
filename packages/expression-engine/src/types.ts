export type ASTNodeType =
  | 'Literal'
  | 'Identifier'
  | 'UnaryExpression'
  | 'BinaryExpression'
  | 'ArrayExpression'
  | 'ObjectExpression'
  | 'MemberExpression'
  | 'CallExpression'
  | 'ConditionalExpression';

export interface BaseASTNode {
  type: ASTNodeType;
}

export interface LiteralNode extends BaseASTNode {
  type: 'Literal';
  value: any;
}

export interface IdentifierNode extends BaseASTNode {
  type: 'Identifier';
  name: string;
}

export interface UnaryExpressionNode extends BaseASTNode {
  type: 'UnaryExpression';
  operator: string;
  argument: ASTNode;
}

export interface BinaryExpressionNode extends BaseASTNode {
  type: 'BinaryExpression';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface ArrayExpressionNode extends BaseASTNode {
  type: 'ArrayExpression';
  elements: ASTNode[];
}

export interface ObjectExpressionNode extends BaseASTNode {
  type: 'ObjectExpression';
  properties: { [key: string]: ASTNode };
}

export interface MemberExpressionNode extends BaseASTNode {
  type: 'MemberExpression';
  object: ASTNode;
  property: ASTNode; // If computed is false, this is an IdentifierNode representing the key. If computed is true, this is any ASTNode.
  computed: boolean;
}

export interface CallExpressionNode extends BaseASTNode {
  type: 'CallExpression';
  callee: ASTNode;
  arguments: ASTNode[];
}

export interface ConditionalExpressionNode extends BaseASTNode {
  type: 'ConditionalExpression';
  test: ASTNode;
  consequent: ASTNode;
  alternate: ASTNode;
}

export type ASTNode =
  | LiteralNode
  | IdentifierNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | ArrayExpressionNode
  | ObjectExpressionNode
  | MemberExpressionNode
  | CallExpressionNode
  | ConditionalExpressionNode;

export interface ExpressionContext {
  variables: Record<string, any>;
  functions: Record<string, Function>;
  resolveReference?: (path: string) => any;
}

export interface ExpressionError {
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
}
