import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const IMAGES_OUTPUT_DIR = './output/images';
const SITE_BASE_URL = 'https://topo.portalgorski.pl';

const filename = process.argv[2];
if (!filename) {
  console.log('Provide climbing holds filename');
  process.exit();
}

if (!fs.existsSync(IMAGES_OUTPUT_DIR)) fs.mkdirSync(IMAGES_OUTPUT_DIR, {recursive: true});

const imageUrls = Object.keys(JSON.parse(fs.readFileSync(filename, {encoding: 'utf-8'})));
downloadImages(imageUrls);

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

async function downloadImages(imageUrls: string[]) {
  for (const imageUrl of imageUrls) {
    console.log(await downloadImage(imageUrl));
  }

  console.log('finished downloading');
}
