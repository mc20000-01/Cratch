export const PROJECT_SCHEMA_VERSION = 2;

export type PrimitiveType =
  | 'void' | 'bool' | 'i8' | 'i16' | 'i32' | 'i64'
  | 'u8' | 'u16' | 'u32' | 'u64'
  | 'f32' | 'f64' | 'string' | 'ptr';

export type NodeUiMeta = {
  x: number;
  y: number;
  collapsed?: boolean;
  comment?: string;
};

type ExprNodeBase = { id: string; ui?: NodeUiMeta };
type StmtNodeBase = { id: string; ui?: NodeUiMeta };

export type Expr =
  | (ExprNodeBase & { kind: 'int'; value: number })
  | (ExprNodeBase & { kind: 'float'; value: number })
  | (ExprNodeBase & { kind: 'string'; value: string })
  | (ExprNodeBase & { kind: 'bool'; value: boolean })
  | (ExprNodeBase & { kind: 'ident'; name: string })
  | (ExprNodeBase & { kind: 'call'; name: string; args: Expr[] });

export type Stmt =
  | (StmtNodeBase & { kind: 'let'; name: string; value: Expr; ty?: PrimitiveType })
  | (StmtNodeBase & { kind: 'assign'; name: string; value: Expr })
  | (StmtNodeBase & { kind: 'expr'; value: Expr })
  | (StmtNodeBase & { kind: 'return'; value?: Expr })
  | (StmtNodeBase & { kind: 'if'; test: Expr; then: Stmt[]; otherwise?: Stmt[] })
  | (StmtNodeBase & { kind: 'while'; test: Expr; body: Stmt[] });

export type FunctionDecl = {
  name: string;
  params: { name: string; ty: PrimitiveType }[];
  return_type: PrimitiveType;
  body: Stmt[];
};

export type Project = {
  schema_version: number;
  name: string;
  globals: { name: string; ty: PrimitiveType; value?: Expr }[];
  functions: FunctionDecl[];
  entry: string;
};
