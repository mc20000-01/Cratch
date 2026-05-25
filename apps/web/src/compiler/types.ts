export type PrimitiveType =
  | 'void'
  | 'bool'
  | 'i8'
  | 'i16'
  | 'i32'
  | 'i64'
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u64'
  | 'f32'
  | 'f64'
  | 'string'
  | 'ptr';

export type Expr =
  | { kind: 'int'; value: number }
  | { kind: 'float'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'bool'; value: boolean }
  | { kind: 'ident'; name: string }
  | { kind: 'call'; name: string; args: Expr[] };

export type Stmt =
  | { kind: 'let'; name: string; value: Expr; type?: PrimitiveType }
  | { kind: 'assign'; name: string; value: Expr }
  | { kind: 'expr'; value: Expr }
  | { kind: 'return'; value?: Expr }
  | { kind: 'if'; test: Expr; then: Stmt[]; otherwise?: Stmt[] }
  | { kind: 'while'; test: Expr; body: Stmt[] };

export type FunctionDecl = {
  name: string;
  params: { name: string; type: PrimitiveType }[];
  returnType: PrimitiveType;
  body: Stmt[];
};

export type Project = {
  name: string;
  globals: { name: string; type: PrimitiveType; value?: Expr }[];
  functions: FunctionDecl[];
  entry: string;
};
