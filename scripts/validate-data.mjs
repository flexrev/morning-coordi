// npm run validate — docs/architecture/data-schema.md 8절 (V-01 ~ V-22)
// C2가 src/engine/validate.js의 validateData()를 구현하면 이 스크립트는 그대로 동작한다.
import { data } from '../src/data/index.js';
import { validateData } from '../src/engine/validate.js';

let issues;
try {
  issues = validateData(data);
} catch (err) {
  console.error('[validate] validateData()가 아직 구현되지 않았습니다:', err.message);
  process.exit(2);
}

const errors = issues.filter((i) => i.severity === 'error');
const warns = issues.filter((i) => i.severity === 'warn');
for (const i of issues) console.log(`${i.severity.toUpperCase()} ${i.rule} ${i.path}: ${i.message}`);
console.log(`\n${errors.length} error(s), ${warns.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
