import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from 'fs';

const OUTPUT_DIRECTORY = './output';
const MERGED_OUTPUT_DIRECTORY = './output/merged';

if (!existsSync(MERGED_OUTPUT_DIRECTORY)) mkdirSync(MERGED_OUTPUT_DIRECTORY, {recursive: true});

const filenames = readdirSync(OUTPUT_DIRECTORY)
  .sort()
  .reduce<{[filenamePrefix: string]: string[]}>((acc, cur) => {
    const [prefix, suffix] = cur.split('_');
    if (!suffix) return acc;
    if (!acc[prefix]) acc[prefix] = [];

    acc[prefix].push(cur);

    return acc;
  }, {});

Object.entries(filenames).map(([prefix, filenames]) => {
  const files = filenames
    .map(filename => readFileSync(`${OUTPUT_DIRECTORY}/${filename}`, {encoding: 'utf8'}))
    .map(rawFile => JSON.parse(rawFile));
  const mergedFiles = Array.isArray(files[0]) ? files.flat() : files.reduce((acc, cur) => ({...acc, ...cur}));

  writeFileSync(`${MERGED_OUTPUT_DIRECTORY}/${prefix}.json`, JSON.stringify(mergedFiles, null, 2), {flag: 'w'});
});
