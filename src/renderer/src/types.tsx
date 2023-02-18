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
export const STATE_INCLUDED = 'TRUE';
export const STATE_EXCLUDED = 'FALSE';
export const YES = 'Yes';
export const NO = 'No';

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
  spouseSsn4: string;
  payment: string;
  notes: string;
  efileStatus: string;
  date: string;
  filename: string;
  scanFilenames: string;
  stateNY: boolean;
  stateNJ: boolean;
  statePA: boolean;
  otherStates: string;
  phone: string;
  eic: boolean;
  preparer: string;
  missingDocs: boolean;
  meta?: {
    clientInode: number;
    scanInodes: [number, string][];
    createTime: number;
    ignore?: boolean;
  };
}
/*
SSN - Spouse,"EIC with 
Children?","Missing 
Documents?",Preparer,"State Filed - 
NY","State Filed - 
NJ","State Filed - 
PA","Other 
States","Telephone 
Number",Fee,Comments,,*/
export const getNewClientObject = (): ClientObject => {
  return {
    date: '',
    lastname: '',
    firstname: '',
    ssn4: '',
    spouseSsn4: '',
    payment: '',
    notes: '',
    efileStatus: EFILE_UNKNOWN,
    filename: '',
    scanFilenames: '',
    stateNY: false,
    stateNJ: false,
    statePA: false,
    otherStates: '',
    phone: '',
    eic: false,
    preparer: '',
    missingDocs: false,
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
