import { useState } from 'react';
import { usePapaParse } from 'react-papaparse';
import ScanDocumentTile from './ScanDocumentTile';
import {
  ClientObject,
  ClientsObject,
  ConfigObject,
  DataColumnConfig,
  EFILE_MISSING,
  EFILE_SUCCESS,
  NO,
  YES,
  getNewClientObject,
} from './types';
import { getCsv } from './utilities';
import { STATE_INCLUDED } from './types';
import { STATE_EXCLUDED } from './types';

const getGenericStringColumn = (
  header: string,
  getter: (client: ClientObject) => string,
  setter: (client: ClientObject, value?: string) => void,
  edittable: boolean,
  bigText = false,
  required = true,
): DataColumnConfig => {
  const config: DataColumnConfig = {
    header,
    parse: setter,
    serialize: getter,
  };
  if (required) {
    config.validate = (value) => Boolean(value);
  }
  if (edittable) {
    config.render = (client, datasources) => {
      return bigText ? (
        <textarea
          defaultValue={getter(client)}
          onBlur={(e) => {
            if (e.target.value !== getter(client)) {
              setter(client, e.target.value);
              datasources.updateClients(datasources.clients);
            }
          }}
          style={{ height: `${((getter(client).match(/\n/g) || '').length + 1) * 15}px` }}
          onFocus={(e) => (e.target.value = getter(client))}
        />
      ) : (
        <input
          type="text"
          defaultValue={getter(client)}
          onBlur={(e) => {
            if (e.target.value !== getter(client)) {
              setter(client, e.target.value);
              datasources.updateClients(datasources.clients);
            }
          }}
          onFocus={(e) => (e.target.value = getter(client))}
        />
      );
    };
  } else {
    config.render = (client) => <span>{getter(client)}</span>;
  }
  return config;
};

const getGenericTrueFalseColumn = (
  header: string,
  trueString: string,
  falseString: string,
  getter: (client: ClientObject) => boolean,
  setter: (client: ClientObject, value: boolean) => void,
  required: false,
): DataColumnConfig => {
  const ret: DataColumnConfig = {
    header: header,
    parse: (client: ClientObject, cell?: string) => {
      setter(client, cell === trueString);
    },
    serialize: (client: ClientObject) => (getter(client) ? trueString : falseString),
    render: (client, datasources) => (
      <input
        type="checkbox"
        checked={getter(client)}
        onChange={() => {
          setter(client, !getter(client));
          datasources.updateClients(datasources.clients);
        }}
      />
    ),
  };
  if (required) {
    ret.validate = (cell) => cell === trueString;
  }
  return ret;
};

export const CsvConfigs: DataColumnConfig[] = [
  {
    header: 'Ignore Client',
    parse: () => {},
    auxRender: (client, datasource) => (
      <input
        type="checkbox"
        checked={!client.meta || client.meta.ignore}
        onChange={() => {
          if (client.meta) {
            client.meta.ignore = !client.meta.ignore;
          }
          datasource.updateClients(datasource.clients);
        }}
      />
    ),
  },
  getGenericStringColumn(
    'Date',
    (client) => client.date,
    (client, value) => (client.date = value || ''),
    false,
  ),
  getGenericStringColumn(
    'Last Name',
    (client) => client.lastname,
    (client, value) => (client.lastname = value || ''),
    true,
  ),
  getGenericStringColumn(
    'First Name',
    (client) => client.firstname,
    (client, value) => (client.firstname = value || ''),
    true,
  ),
  getGenericStringColumn(
    'SSN - Taxpayer',
    (client) => client.ssn4,
    (client, value) => (client.ssn4 = value || ''),
    true,
  ),
  getGenericStringColumn(
    'SSN - Spouse',
    (client) => client.spouseSsn4,
    (client, value) => (client.spouseSsn4 = value || ''),
    true,
    false,
    false,
  ),
  getGenericTrueFalseColumn(
    'EIC with Children?',
    YES,
    NO,
    (client) => client.eic,
    (client, value) => (client.eic = value),
    false,
  ),
  getGenericTrueFalseColumn(
    'Missing Documents?',
    YES,
    NO,
    (client) => client.missingDocs,
    (client, value) => (client.missingDocs = value),
    false,
  ),
  getGenericStringColumn(
    'Preparer',
    (client) => client.preparer,
    (client, value) => (client.preparer = value || ''),
    true,
    false,
    true,
  ),
  getGenericTrueFalseColumn(
    'State Filed - NY',
    STATE_INCLUDED,
    STATE_EXCLUDED,
    (client) => client.stateNY,
    (client, value) => (client.stateNY = value),
    false,
  ),
  getGenericTrueFalseColumn(
    'State Filed - NJ',
    STATE_INCLUDED,
    STATE_EXCLUDED,
    (client) => client.stateNJ,
    (client, value) => (client.stateNJ = value),
    false,
  ),
  getGenericTrueFalseColumn(
    'State Filed - PA',
    STATE_INCLUDED,
    STATE_EXCLUDED,
    (client) => client.statePA,
    (client, value) => (client.statePA = value),
    false,
  ),
  getGenericStringColumn(
    'Other States',
    (client) => client.otherStates,
    (client, value) => (client.otherStates = value || ''),
    true,
    false,
    false,
  ),
  getGenericStringColumn(
    'Telephone Number',
    (client) => client.phone,
    (client, value) => (client.phone = value || ''),
    true,
    false,
    false,
  ),
  getGenericStringColumn(
    'Fee',
    (client) => client.payment,
    (client, value) => (client.payment = value || ''),
    true,
  ),
  getGenericStringColumn(
    'Comments',
    (client) => client.notes,
    (client, value) => (client.notes = value || ''),
    true,
    true,
    false,
  ),
  {
    header: 'Filename',
    parse: (client: ClientObject, cell?: string) => (client.filename = cell || ''),
    serialize: (client: ClientObject) => client.filename,
    render: (client, datasources) => {
      return (
        <a
          href="#"
          onClick={(e) => {
            window.api.openFile(`${datasources.config.clientPath}/${client.filename}`);
            e.preventDefault();
          }}
        >
          {client.filename}
        </a>
      );
    },
  },
  {
    header: 'Scanned Documents',
    parse: (client: ClientObject, cell?: string) => (client.scanFilenames = cell || ''),
    serialize: (client: ClientObject) => client.scanFilenames,
    render: (client, datasources) => {
      return <ScanDocumentTile client={client} datasources={datasources} />;
    },
    validate: (docs) => Boolean(docs),
  },
  {
    header: 'EFile Status',
    parse: (client: ClientObject, cell?: string) => {
      client.efileStatus = cell || '';
    },
    serialize: (client: ClientObject) => client.efileStatus,
    render: (client, datasources) => (
      <input
        type="checkbox"
        checked={client.efileStatus === EFILE_SUCCESS}
        onChange={() => {
          const success = client.efileStatus === EFILE_SUCCESS;
          client.efileStatus = success ? EFILE_MISSING : EFILE_SUCCESS;
          datasources.updateClients(datasources.clients);
        }}
      />
    ),
    validate: (cell) => cell === EFILE_SUCCESS,
  },
  {
    header: 'Metadata',
    parse: (client: ClientObject, cell?: string) => {
      if (cell) {
        client.meta = JSON.parse(cell);
      }
    },
    serialize: (client: ClientObject) => (client.meta ? JSON.stringify(client.meta) : ''),
  },
];

const EXPECTED_HEADER = CsvConfigs.map((x) => Boolean(x.serialize) && x.header).filter(
  (x): x is string => Boolean(x),
);

const useCsvHandler = () => {
  const { readString } = usePapaParse();
  const [clientsObject, setClientsObject] = useState<ClientsObject | null>(null);
  const [parseError, setParseError] = useState('');

  const getClientsObjectFromCSV = (csvPath: string) => {
    const rawCsv = window.api.readFile(csvPath);
    readString(rawCsv, {
      worker: true,
      complete: (results) => {
        if (
          EXPECTED_HEADER.join(',') !==
          (results.data[0] as string[]).join(',').replaceAll('\r', '').replaceAll('\n', '')
        ) {
          setParseError(`Headers do not match, please set to ${EXPECTED_HEADER}`);
          return;
        }
        try {
          const parsedObject = results.data.slice(1).map((row: any) => {
            const newClient = getNewClientObject();
            let idx = 0;
            CsvConfigs.forEach((config) => {
              try {
                config.parse(newClient, row[idx]);
                if (config.serialize) {
                  idx = idx + 1;
                }
              } catch {
                throw new Error(`Unable to parse ${config.header} from ${row[idx]} on line ${idx}`);
              }
            });
            return newClient;
          });
          setClientsObject(parsedObject);
          setParseError('');
        } catch (err: any) {
          setParseError(err.message);
        }
      },
    });
  };

  const updateCsv = (clients: ClientsObject, config: ConfigObject) => {
    window.api.writeFile(config.dataCsv, getCsv(clients));
  };
  return { getClientsObjectFromCSV, clientsObject, updateCsv, parseError };
};

export default useCsvHandler;
