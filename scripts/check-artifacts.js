const { execSync } = require('child_process');
const forbidden = [
  '.next',
  '.vercel',
  'node_modules/@prisma/client',
  '.prisma',
  'build',
  'dist'
];

try {
  const output = execSync('git ls-files', { encoding: 'utf8' });
  const files = output.split('\n').filter(Boolean);
  const matches = [];
  for (const f of files) {
    for (const bad of forbidden) {
      if (f === bad || f.startsWith(bad + '/') || f.includes('/' + bad + '/')) {
        matches.push(f);
      }
    }
  }
  if (matches.length) {
    console.error('Forbidden build artifacts are tracked in this repo:');
    matches.slice(0, 20).forEach(m => console.error('  ' + m));
    if (matches.length > 20) console.error('  ... and more');
    process.exit(1);
  }
  console.log('No forbidden artifacts tracked.');
} catch (err) {
  console.error(err.message);
  process.exit(2);
}
