import type { Expr, Project, Stmt, PrimitiveType } from './types';

function emitType(t: PrimitiveType): string {
  switch (t) {
    case 'void': return 'void';
    case 'bool': return 'bool';
    case 'i8': return 'int8_t';
    case 'i16': return 'int16_t';
    case 'i32': return 'int32_t';
    case 'i64': return 'int64_t';
    case 'u8': return 'uint8_t';
    case 'u16': return 'uint16_t';
    case 'u32': return 'uint32_t';
    case 'u64': return 'uint64_t';
    case 'f32': return 'float';
    case 'f64': return 'double';
    case 'string': return 'const char*';
    case 'ptr': return 'void*';
  }
}

function emitExpr(expr: Expr): string {
  switch (expr.kind) {
    case 'int': return String(expr.value);
    case 'float': return String(expr.value);
    case 'string': return JSON.stringify(expr.value);
    case 'bool': return expr.value ? 'true' : 'false';
    case 'ident': return expr.name;
    case 'call': return `${expr.name}(${expr.args.map(emitExpr).join(', ')})`;
  }
}

function emitStmt(stmt: Stmt, indent = 2): string {
  const pad = ' '.repeat(indent);
  switch (stmt.kind) {
    case 'let':
      return `${pad}${emitType(stmt.type ?? 'i32')} ${stmt.name} = ${emitExpr(stmt.value)};`;
    case 'assign':
      return `${pad}${stmt.name} = ${emitExpr(stmt.value)};`;
    case 'expr':
      return `${pad}${emitExpr(stmt.value)};`;
    case 'return':
      return `${pad}return${stmt.value ? ` ${emitExpr(stmt.value)}` : ''};`;
    case 'if':
      return [
        `${pad}if (${emitExpr(stmt.test)}) {`,
        ...stmt.then.map((s) => emitStmt(s, indent + 2)),
        `${pad}}${stmt.otherwise?.length ? ' else {' : ''}`,
        ...(stmt.otherwise?.map((s) => emitStmt(s, indent + 2)) ?? []),
        `${pad}${stmt.otherwise?.length ? '}' : ''}`,
      ].filter(Boolean).join('\n');
    case 'while':
      return [
        `${pad}while (${emitExpr(stmt.test)}) {`,
        ...stmt.body.map((s) => emitStmt(s, indent + 2)),
        `${pad}}`,
      ].join('\n');
  }
}

export function compileProjectToC(project: Project): string {
  const lines: string[] = [];
  lines.push('#include <stdint.h>');
  lines.push('#include <stdbool.h>');
  lines.push('#include <stdio.h>');
  lines.push('');
  for (const g of project.globals) {
    const init = g.value ? ` = ${emitExpr(g.value)}` : '';
    lines.push(`${emitType(g.type)} ${g.name}${init};`);
  }
  lines.push('');
  for (const fn of project.functions) {
    const params = fn.params.map((p) => `${emitType(p.type)} ${p.name}`).join(', ');
    lines.push(`${emitType(fn.returnType)} ${fn.name}(${params}) {`);
    for (const stmt of fn.body) lines.push(emitStmt(stmt));
    if (fn.returnType === 'void') lines.push('  return;');
    lines.push('}');
    lines.push('');
  }
  lines.push(`int main(void) { return ${project.entry}(); }`);
  return lines.join('\n');
}
