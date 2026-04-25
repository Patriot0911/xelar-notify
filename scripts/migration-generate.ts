import { execSync } from 'child_process';

const name = process.argv[2];

if (!name) {
  console.error('Usage: npm run migration:generate <name>');
  process.exit(1);
}

execSync(
  `typeorm-ts-node-commonjs -d libs/database/src/data-source.ts migration:generate libs/database/src/migrations/${name}`,
  { stdio: 'inherit' },
);
