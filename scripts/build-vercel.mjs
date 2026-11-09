// Builds the three frontends into one folder that Vercel serves:
//   dist-vercel/            Angular shell
//   dist-vercel/tickets/    Angular tickets remote
//   dist-vercel/settings/   React settings remote
// It overwrites dist/, so don't run it while ng serve is running.
import { execSync } from 'node:child_process';
import { cpSync, rmSync, writeFileSync } from 'node:fs';

const OUTPUT = 'dist-vercel';

function run(command) {
  execSync(command, { stdio: 'inherit' });
}

rmSync(OUTPUT, { recursive: true, force: true });

run('npx ng build helpdesk-pro --configuration production');
run('npx ng build tickets --configuration production');
run('npm --prefix projects/settings run build');

cpSync('dist/helpdesk-pro/browser', OUTPUT, { recursive: true });
cpSync('dist/tickets/browser', `${OUTPUT}/tickets`, { recursive: true });
cpSync('projects/settings/dist', `${OUTPUT}/settings`, { recursive: true });

// The remotes are on the same domain in production. main.ts turns these paths into full addresses.
writeFileSync(
  `${OUTPUT}/federation.manifest.json`,
  `${JSON.stringify({ tickets: '/tickets/remoteEntry.json', settings: '/settings/remoteEntry.json' }, null, 2)}\n`,
);

console.log(`Built all three frontends into ${OUTPUT}/`);
