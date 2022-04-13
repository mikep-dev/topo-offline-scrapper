import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import {Area} from '../models';

const IMAGES_OUTPUT_DIR = './output/images';
const SITE_BASE_URL = 'https://topo.portalgorski.pl';

const areasFilename = './output/merged/areas.json';

if (!fs.existsSync(IMAGES_OUTPUT_DIR)) fs.mkdirSync(IMAGES_OUTPUT_DIR, {recursive: true});

const areas: Area[] = JSON.parse(fs.readFileSync(areasFilename, {encoding: 'utf-8'}));
const imageUrls: string[] = [
  ...areas.flatMap(area => area.sections).map(section => section.imageUrl),
  ...areas.map(area => area.imageUrl),
];

(async function () {
  for (const imageUrl of imageUrls) {
    console.log(await downloadImage(imageUrl));
  }
})();

async function downloadImage(imageUrl: string) {
  const writePath = path.resolve(IMAGES_OUTPUT_DIR, `${path.basename(imageUrl)}.jpg`);

  const writer = fs.createWriteStream(writePath);

  const response = await axios({
    url: imageUrl,
    method: 'GET',
    responseType: 'stream',
    baseURL: SITE_BASE_URL,
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(writePath));
    writer.on('error', reject);
  });
}
