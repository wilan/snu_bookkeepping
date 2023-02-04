import { useCallback, useEffect, useState } from 'react';
import Config from './Config';
import { ClientsObject, ConfigObject, DataSources } from './types';
import { readConfigs, writeConfigs } from './utilities';
import TrackClients from './TrackClients';
import useCsvHandler from './useCsvHandler';
import _ from 'lodash';
const CONFIG_TAB = 'Config';
const TRACK_TAB = 'Track Clients';
type Tab = typeof CONFIG_TAB | typeof TRACK_TAB;
const TABS: Tab[] = [TRACK_TAB, CONFIG_TAB];

const App = () => {
  const [tab, setTab] = useState<Tab>(CONFIG_TAB);
  const [config, setConfig_] = useState<ConfigObject>(readConfigs());
  const {
    getClientsObjectFromCSV,
    clientsObject: initialClients,
    updateCsv,
    parseError,
  } = useCsvHandler();
  const [clients, setClients] = useState<ClientsObject | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  /*
    any of the folders doesn't exist.
  */
  const [validationError, setValidationError] = useState('loading');
  const errorMsg = validationError || parseError;
  const validateFolders = () => {
    window.api.listFiles(config.clientPath);
    window.api.listFiles(config.efilePath);
    window.api.listFiles(config.scanPath);
  };
  const loadData = () => {
    try {
      getClientsObjectFromCSV(config.dataCsv);
      validateFolders();
      setValidationError('');
    } catch (err: any) {
      setValidationError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (errorMsg) {
      setTab(CONFIG_TAB);
    }
  }, [errorMsg]);

  const setConfig = (cf: ConfigObject) => {
    writeConfigs(cf);
    setConfig_(readConfigs());
  };

  const debounceUpdateCsv = useCallback(
    _.debounce((c: ClientsObject) => {
      setUnsavedChanges(false);
      updateCsv(c, config);
    }, 2000),
    [config],
  );

  const updateClients = (c: ClientsObject) => {
    setUnsavedChanges(true);
    debounceUpdateCsv.cancel();
    debounceUpdateCsv(c);
    // The performance of this is not ideal.  Consider refactoring to using immer if app starts lagging
    // We will leave as is to avoid introducing unnecessary complexity.
    setClients(Object.assign([], c));
  };

  const datasources: DataSources = {
    config,
    setConfig,
    clients: clients || initialClients || [],
    updateClients: updateClients,
  };
  return (
    <div>
      <div>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            disabled={tab === TRACK_TAB && Boolean(errorMsg)}
          >
            {tab}
          </button>
        ))}
      </div>
      {errorMsg && <span style={{ color: 'red' }}>{errorMsg}</span>}
      {tab === CONFIG_TAB && <Config datasources={datasources} reload={loadData} />}
      {updateClients !== null && tab === TRACK_TAB && (
        <TrackClients
          datasources={datasources}
          unsavedChanges={unsavedChanges}
          setError={(msg) => {
            setValidationError(msg);
          }}
        />
      )}
    </div>
  );
};

export default App;
