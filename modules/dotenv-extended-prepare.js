const fs = require('fs');

const currentRelativePath = '../';

const envPath = currentRelativePath + '.env';

const envSchemaPath = currentRelativePath + '.env.schema';
const envDefaultsPath = currentRelativePath + '.env.defaults';

async function upsertFile(name, dataIfNotFound) {
  const nameFromDirname = `${__dirname}/${name}`;

  fs.writeFile(nameFromDirname, dataIfNotFound, { flag: 'wx' }, (err) => {
    if (err) {
      return;
    }
    console.log(`Prepared ${name.substring(currentRelativePath.length)} file`);
  });
}

function envParse(path) {
  const env = fs.readFileSync(`${__dirname}/${path}`, { encoding: 'utf-8' }).trim();
  const envArr = env.split('\n');
  let envObject = {};
  envArr.forEach((el) => {
    const elSplitted = el.split('=');
    const key = elSplitted[0];
    const value = elSplitted[1] ?? '';
    envObject[key] = value;
  });
  return envObject;
}

function envStringifyInit(envObj) {
  let string = '';

  for (const key in envObj) {
    if (envObj[key]) {
      string += '# ';
    }

    string += `${key}=\n`;
  }

  return string.trim();
}

const setAll = (obj, val) => Object.keys(obj).forEach((k) => (obj[k] = val));

const envSchema = envParse(envSchemaPath);
setAll(envSchema, '');

const envDefaults = envParse(envDefaultsPath);

const stringifiedEnv = envStringifyInit({ ...envSchema, ...envDefaults });

upsertFile(envPath, stringifiedEnv);
