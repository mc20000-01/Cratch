import { PROJECT_SCHEMA_VERSION, type Expr, type Project, type Stmt } from './types';

type LegacyProject = Omit<Project, 'schema_version'> & { schema_version?: number };

type IdState = { expr: number; stmt: number };
const nextExprId = (s: IdState) => `expr_${++s.expr}`;
const nextStmtId = (s: IdState) => `stmt_${++s.stmt}`;

function migrateExpr(expr: any, state: IdState): Expr {
  const id = typeof expr.id === 'string' ? expr.id : nextExprId(state);
  if (expr.kind === 'call')
    return { ...expr, id, args: (expr.args ?? []).map((a: any) => migrateExpr(a, state)) };
  return { ...expr, id };
}

function migrateStmt(stmt: any, state: IdState): Stmt {
  const id = typeof stmt.id === 'string' ? stmt.id : nextStmtId(state);
  if (stmt.kind === 'if') {
    return {
      ...stmt,
      id,
      test: migrateExpr(stmt.test, state),
      then: (stmt.then ?? []).map((s: any) => migrateStmt(s, state)),
      otherwise: stmt.otherwise?.map((s: any) => migrateStmt(s, state)),
    };
  }
  if (stmt.kind === 'while')
    return {
      ...stmt,
      id,
      test: migrateExpr(stmt.test, state),
      body: (stmt.body ?? []).map((s: any) => migrateStmt(s, state)),
    };
  if (stmt.kind === 'let' || stmt.kind === 'assign' || stmt.kind === 'expr')
    return { ...stmt, id, value: migrateExpr(stmt.value, state) };
  if (stmt.kind === 'return' && stmt.value) return { ...stmt, id, value: migrateExpr(stmt.value, state) };
  return { ...stmt, id };
}

export function upgradeProjectSchema(input: LegacyProject): Project {
  if (input.schema_version === PROJECT_SCHEMA_VERSION) return input as Project;
  const state: IdState = { expr: 0, stmt: 0 };
  return {
    ...input,
    schema_version: PROJECT_SCHEMA_VERSION,
    globals: (input.globals ?? []).map((g) => (g.value ? { ...g, value: migrateExpr(g.value, state) } : g)),
    functions: (input.functions ?? []).map((fn) => ({
      ...fn,
      body: (fn.body ?? []).map((s) => migrateStmt(s, state)),
    })),
  };
}

export const deserializeProject = (json: string): Project =>
  upgradeProjectSchema(JSON.parse(json) as LegacyProject);
export const serializeProject = (project: Project): string => JSON.stringify(project);
