import { initFederation } from '@angular-architects/native-federation';

// In development the manifest has full addresses on other ports. On Vercel it has paths like
// /tickets/remoteEntry.json, which are turned into full addresses on whatever domain the site is on.
fetch('federation.manifest.json')
  .then((response) => response.json() as Promise<Record<string, string>>)
  .then((manifest) =>
    Object.fromEntries(
      Object.entries(manifest).map(([name, url]) => [name, new URL(url, document.baseURI).href]),
    ),
  )
  .then((remotes) =>
    initFederation(remotes, {
      hostRemoteEntry: { url: './remoteEntry.json' },
    }),
  )
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
