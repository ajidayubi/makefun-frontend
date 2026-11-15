import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const source = fileURLToPath(new URL('.', import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');
if (output === resolve(source) || output.startsWith(join(source, 'app') + '/')) throw new Error('Choose a separate output directory.');
mkdirSync(output, { recursive:true });
for (const folder of ['app','screenshots']) cpSync(join(source,folder), join(output,folder), { recursive:true });
const dossier = buildDossier(output, { text_max_bytes:163840, screenshots:{max:3,max_bytes:262144}, app_max_files:993, app_max_bytes:16777216 });
writeFileSync(join(output,'dossier.json'), dossier);
console.log(`Wrote ${Buffer.byteLength(dossier)} bytes to ${join(output,'dossier.json')}`);
