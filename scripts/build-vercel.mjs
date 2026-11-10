// Builds the frontends into one folder that Vercel serves:
//   dist-vercel/                    Angular shell
//   dist-vercel/tickets/            React tickets remote (the sidebar's Tickets link)
//   dist-vercel/tickets-angular/    Angular tickets remote (kept for comparison)
//   dist-vercel/settings/           React settings remote
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
run('npm --prefix projects/tickets-react run build');
run('npm --prefix projects/settings run build');

cpSync('dist/helpdesk-pro/browser', OUTPUT, { recursive: true });
cpSync('projects/tickets-react/dist', `${OUTPUT}/tickets`, { recursive: true });
cpSync('dist/tickets/browser', `${OUTPUT}/tickets-angular`, { recursive: true });
cpSync('projects/settings/dist', `${OUTPUT}/settings`, { recursive: true });

// The remotes are on the same domain in production. main.ts turns these paths into full addresses.
const manifest = {
  'tickets-react': '/tickets/remoteEntry.json',
  tickets: '/tickets-angular/remoteEntry.json',
  settings: '/settings/remoteEntry.json',
};
writeFileSync(`${OUTPUT}/federation.manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Built all four frontends into ${OUTPUT}/`);
