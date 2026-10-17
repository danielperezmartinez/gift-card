#!/bin/sh
# Falla si la versión de package.json no supera la de la rama principal.
# Uso: comprobar-version.sh <sha base>
set -e
base=$(git show "$1:package.json" | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).version")
actual=$(node -p "require('./package.json').version")
node -e '
const [base, actual] = process.argv.slice(1);
const n = (v) => v.split(/[.+-]/).slice(0, 3).map(Number);
const [a, b] = [n(base), n(actual)];
for (let i = 0; i < 3; i++) {
  if (b[i] > a[i]) process.exit(0);
  if (b[i] < a[i]) break;
}
console.error(`La versión ${actual} debe superar la de la rama principal (${base}).`);
process.exit(1);
' "$base" "$actual"
