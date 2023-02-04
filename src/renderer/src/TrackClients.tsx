import { useEffect, useMemo, useState } from 'react';
import { ClientObject, DataSources } from './types';
import { CLIENT_SORT_FN, updateClientsFromFiles, validate } from './utilities';
import { CsvConfigs } from './useCsvHandler';

const UPDATE_INTERVAL_SEC = 10;

const TrackClients = ({
  datasources,
  unsavedChanges,
  setError,
}: {
  datasources: DataSources;
  unsavedChanges: boolean;
  setError: (errorMessage: string) => void;
}) => {
  const { config, clients, updateClients } = datasources;
  const [hideValid, setHideValid] = useState(false);
  const [searchStr, setSearchStr] = useState('');
  const displayClients = useMemo(() => {
    const filter = (client: ClientObject) => {
      const validFilter = hideValid ? !validate(client) : true;
      const searchFilter = searchStr
        ? [client.filename, client.lastname, client.firstname, client.ssn4].some((field) =>
            field.toLowerCase().includes(searchStr.toLowerCase()),
          )
        : true;
      return searchFilter && validFilter;
    };
    return clients.sort(CLIENT_SORT_FN).filter(filter);
  }, [clients, hideValid, searchStr]);
  useEffect(() => {
    const interval = setInterval(() => {
      const hasChanges = updateClientsFromFiles(clients, config);
      if (hasChanges) {
        try {
          updateClients(clients);
        } catch (err: any) {
          setError(err.message);
        }
      }
    }, UPDATE_INTERVAL_SEC * 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <span style={{ color: unsavedChanges ? 'red' : 'green' }}>
        {unsavedChanges ? 'There are unsaved changes, do not close the app' : 'All changes saved.'}
      </span>
      <div>
        <input
          type="text"
          value={searchStr}
          onChange={(e) => setSearchStr(e.target.value)}
          placeholder="search"
        />
        Hide Valid/Ignored:{' '}
        <input type="checkbox" checked={hideValid} onChange={() => setHideValid(!hideValid)} />
      </div>
      <table className="client-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            {CsvConfigs.map(
              (config, idx) =>
                (config.render || config.auxRender) && <th key={idx}>{config.header}</th>,
            )}
          </tr>
        </thead>
        <tbody>
          {displayClients.map((client, clientIdx) => (
            <tr
              key={client.meta ? client.meta.clientInode : clientIdx}
              style={{ ...(validate(client) ? { backgroundColor: 'lightgreen' } : {}) }}
            >
              {CsvConfigs.map((colConfig, idx) => {
                const renderFn = colConfig.render || colConfig.auxRender;
                return renderFn && <td key={idx}>{renderFn(client, datasources)}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default TrackClients;
