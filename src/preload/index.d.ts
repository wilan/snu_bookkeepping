import { ElectronAPI } from '@electron-toolkit/preload';
import { FileResultData } from './types';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      listFiles: (folder: string, extension?: string) => FileResultData[];
      readFile: (path: string) => string;
      writeFile: (path: string, content: string) => void;
      renameFile: (path: string, newPath: string) => void;
      openFile: (path: string) => void;
    };
  }
}
