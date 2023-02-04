import { contextBridge, shell } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import fs from 'fs';
import { FileResultData } from './types';
// Custom APIs for renderer
const api = {
  listFiles: (path: string, extension?: string) => {
    const result: FileResultData[] = [];
    fs.readdirSync(path).forEach((file) => {
      if (!extension || file.endsWith(extension)) {
        const fullPath = path + '/' + file;
        const stats = fs.statSync(fullPath);
        result.push({
          inode: stats.ino,
          filename: file,
          createTime: stats.birthtimeMs,
        });
      }
    });
    return result;
  },
  readFile: (path: string) => {
    try {
      return fs.readFileSync(path, 'utf8');
    } catch (err) {
      throw new Error(`${path} does not exist.`);
    }
  },
  writeFile: (path: string, content: string) => {
    fs.writeFileSync(path, content);
  },
  renameFile: (path: string, newPath: string) => {
    fs.renameSync(path, newPath);
  },
  openFile: (path: string) => {
    shell.openPath(path);
  },
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
