import { FileResultData } from 'src/preload/types';
import {
  ClientObject,
  ClientsObject,
  ConfigObject,
  EFILE_MISSING,
  EFILE_SUCCESS,
  EFILE_UNKNOWN,
  getNewClientObject,
} from './types';
import { CsvConfigs } from './useCsvHandler';
import { jsonToCSV } from 'react-papaparse';

const CONFIG_KEY = 'config';

export const readConfigs = (): ConfigObject => {
  const defaultConfig: ConfigObject = {
    clientPath: '',
    scanPath: '',
    efilePath: '',
    startTime: 0,
    dataCsv: '',
  };
  const configJson = localStorage.getItem(CONFIG_KEY);

  return (configJson && JSON.parse(configJson)) || defaultConfig;
};

export const writeConfigs = (config: ConfigObject) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const updateClientsFromFiles = (clients: ClientsObject, config: ConfigObject) => {
  const clientsFiles = window.api
    .listFiles(config.clientPath, 'ta2')
    .filter((x) => x.createTime > config.startTime);
  const efileFiles = window.api
    .listFiles(config.efilePath, 'efr')
    .filter((x) => x.createTime > config.startTime);
  const scanFiles = window.api.listFiles(config.scanPath);

  let hasChanges = false;
  // 1. add new clients to the list
  const clientMap: { [inode: number]: ClientObject } = {};
  clients.forEach((c) => {
    if (c.meta) {
      clientMap[c.meta.clientInode] = c;
    }
  });
  clientsFiles.forEach((clientFile: FileResultData) => {
    if (!clientMap[clientFile.inode]) {
      hasChanges = true;
      const newClient = getNewClientObject();
      newClient.meta = {
        clientInode: clientFile.inode,
        scanInodes: [],
        createTime: clientFile.createTime,
      };
      newClient.date = new Date(clientFile.createTime).toLocaleDateString();
      newClient.filename = clientFile.filename;
      clients.push(newClient);
    }
  });
  // 2. mark existing clients as efile completed
  const timeline = efileFiles
    .map((f) => ({ type: 'ef', file: f }))
    .concat(clientsFiles.map((f) => ({ type: 'c', file: f })))
    .sort((a, b) => a.file.createTime - b.file.createTime);

  timeline.forEach((datapoint, idx) => {
    if (datapoint.type === 'c') {
      const client = clientMap[datapoint.file.inode];
      if (client && client.meta) {
        if (client.efileStatus === EFILE_UNKNOWN) {
          const next = timeline[idx + 1];
          if (next) {
            client.efileStatus = next.type === 'ef' ? EFILE_SUCCESS : EFILE_MISSING;
            hasChanges = true;
          }
        }
        if (datapoint.file.filename !== client.filename) {
          client.filename = datapoint.file.filename;
          hasChanges = true;
        }
      }
    }
  });

  // 3. Reconsile scanfilenames.
  const scanMap: { [inode: number]: FileResultData } = {};
  scanFiles.forEach((file) => {
    scanMap[file.inode] = file;
  });

  clients.forEach((c) => {
    if (c.meta) {
      const meta = c.meta;
      meta.scanInodes.forEach(([inode, filename], index) => {
        if (scanMap[inode] && scanMap[inode].filename !== filename) {
          meta.scanInodes[index] = [inode, scanMap[inode].filename];
        }
      });
      const filenamesString = scanFilesToString(meta.scanInodes.map((x) => x[1]));
      if (filenamesString !== c.scanFilenames) {
        c.scanFilenames = filenamesString;
        hasChanges = true;
      }
    }
  });

  return hasChanges;
};

export const CLIENT_SORT_FN: (c1: ClientObject, c2: ClientObject) => number = (c1, c2) =>
  (c2.meta?.createTime || 0) - (c1.meta?.createTime || 0);

export const scanFilesToString = (filenames: string[]) => {
  return filenames.join('\n');
};

export const validate = (c1: ClientObject) => {
  return (
    !c1.meta ||
    c1.meta.ignore ||
    CsvConfigs.every(
      (column) => !column.validate || (column.serialize && column.validate(column.serialize(c1))),
    )
  );
};

export const getCsv = (clients: ClientsObject) => {
  const rows: string[][] = [];
  const serializedConfigs = CsvConfigs.filter((x) => x.serialize);
  rows.push(serializedConfigs.map((x) => x.header));
  clients.forEach((client) => {
    rows.push(serializedConfigs.map((x) => (x.serialize ? x.serialize(client) : '')));
  });
  return jsonToCSV(rows);
};
