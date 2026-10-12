import { access } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const required = [
  'index.html',
  'contact.html',
  'app-ads.txt',
  'apps/habittracker/index.html',
  'apps/habittracker/privacy.html',
  'apps/habittracker/terms.html',
  'apps/habittracker/help.html',
  'apps/habittracker/news.html',
  'apps/studymap/index.html',
  'apps/studymap/privacy.html',
  'apps/studymap/terms.html',
  'apps/studymap/help.html',
  'apps/studymap-flashcards/index.html',
  'apps/studymap-flashcards/privacy.html',
  'apps/studymap-flashcards/terms.html',
  'apps/studymap-flashcards/help.html',
];

let failed = false;
for (const file of required) {
  try {
    await access(path.join(dist, file));
    console.log('ok', file);
  } catch {
    console.error('MISSING', file);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`All ${required.length} legacy paths are in the build output.`);
