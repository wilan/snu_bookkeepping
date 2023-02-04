export interface ConfigObject {
  dataCsv: string;
  clientPath: string;
  scanPath: string;
  efilePath: string;
  startTime: number;
}

export interface DataSources {
  config: ConfigObject;
  setConfig: (cf: ConfigObject) => void;
  clients: ClientsObject;
  updateClients: (c: ClientsObject) => void;
}
export const EFILE_UNKNOWN = '';
export const EFILE_MISSING = '0';
export const EFILE_SUCCESS = '1';

export interface ClientObject {
  /*
    name, cost, notes, etc,
  filename, scans, efile,
  meta: {
    clientInode: xxx,
    scanInodes: [xxx, xxx],
  }*/
  lastname: string;
  firstname: string;
  ssn4: string;
  payment: string;
  notes: string;
  efileStatus: string;
  date: string;
  filename: string;
  scanFilenames: string;
  meta?: {
    clientInode: number;
    scanInodes: [number, string][];
    createTime: number;
    ignore?: boolean;
  };
}

export const getNewClientObject = (): ClientObject => {
  return {
    date: '',
    lastname: '',
    firstname: '',
    ssn4: '',
    payment: '',
    notes: '',
    efileStatus: EFILE_UNKNOWN,
    filename: '',
    scanFilenames: '',
  };
};

export type ClientsObject = ClientObject[];

export interface DataColumnConfig {
  header: string;
  parse: (client: ClientObject, cell?: string) => void;
  serialize?: (client: ClientObject) => string;
  render?: (client: ClientObject, datasources: DataSources) => JSX.Element;
  auxRender?: (client: ClientObject, datasources: DataSources) => JSX.Element;
  validate?: (cell: string) => boolean;
}
