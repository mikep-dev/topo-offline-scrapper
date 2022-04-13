import * as concurrently from 'concurrently';
import {program} from 'commander';
import {BasicArea} from '../models';
import {CONSOLE_COLORS, OUTPUT_DIR, SLICE_END, SLICE_START} from '../utils';
import * as path from 'path';
import * as child_process from 'child_process';
import * as process from 'process';
import * as fs from 'fs';

const rootDir = path.resolve(__dirname, '../../');
process.chdir(rootDir);

type ArgvTypes = {numberOfProcesses: number; source: string};
program
  .option('-n, --number-of-processes <numberOfProcesses>', 'number of processes', val => parseInt(val, 10), 4)
  .option('-s, --source <source>', 'areas list source', './cypress/fixtures/areas-list.json');
const {numberOfProcesses, source} = program.parse(process.argv).opts<ArgvTypes>();

const numberOfAreas = (JSON.parse(fs.readFileSync(source, 'utf-8')) as BasicArea[]).length;
const sliceSize = Math.round(numberOfAreas / numberOfProcesses);
const listOfHeadlessCommands = Array(Math.min(numberOfProcesses, numberOfAreas))
  .fill(0)
  .map((_, i, arr) => {
    const sliceStart = Math.min(sliceSize * i, numberOfAreas);
    const sliceEnd = i === arr.length - 1 ? numberOfAreas : Math.min(sliceSize * (i + 1));

    return `sleep ${i * 8} && yarn headless --env=${SLICE_START}=${sliceStart},${SLICE_END}=${sliceEnd}`;
  });

(async function () {
  console.log(`Cleaning ${path.resolve(process.cwd(), OUTPUT_DIR)} directory`);
  child_process.execSync(`rm -r ${path.join(OUTPUT_DIR, '*')} ||:`);

  console.log(`Starting ${numberOfProcesses} scraping processes`);
  await concurrently(
    listOfHeadlessCommands.map((command, i) => ({
      command,
      name: String(i + 1),
      prefixColor: CONSOLE_COLORS[i % CONSOLE_COLORS.length],
    })),
  );

  console.log(`Finished scraping, merging...`);
  child_process.execSync(`yarn merge`);

  // console.log(`Downloading images`);
  // child_process.execSync(`yarn getimages`);

  console.log('All done :)');
})();
