import { ConfigObject, DataSources } from './types';
import { getCsv } from './utilities';

const INPUT_WIDTH = '350px';

const Config = ({ datasources, reload }: { datasources: DataSources; reload: () => void }) => {
  const { config, setConfig, clients } = datasources;

  const setConfigWithLambda = (lambda: (cf: ConfigObject) => void) => {
    lambda(config);
    setConfig(config);
  };

  const downloadData = () => {
    const blob = new Blob([getCsv(clients)], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client_backup_${Date.now()}.csv`;
    a.click();
  };
  return (
    <>
      <div>
        <label>Set CSV Data File Path: </label>
        <input
          type="text"
          value={config.dataCsv}
          onChange={(e) => setConfigWithLambda((cf) => (cf.dataCsv = e.target.value))}
          style={{ width: INPUT_WIDTH }}
        />
      </div>
      <div>
        <label>Set Client Data Path: </label>
        <input
          type="text"
          value={config.clientPath}
          onChange={(e) => setConfigWithLambda((cf) => (cf.clientPath = e.target.value))}
          style={{ width: INPUT_WIDTH }}
        />
      </div>

      <div>
        <label>Set Scan Data Path: </label>
        <input
          type="text"
          value={config.scanPath}
          onChange={(e) => setConfigWithLambda((cf) => (cf.scanPath = e.target.value))}
          style={{ width: INPUT_WIDTH }}
        />
      </div>

      <div>
        <label>Set Efile Data Path: </label>
        <input
          type="text"
          value={config.efilePath}
          onChange={(e) => setConfigWithLambda((cf) => (cf.efilePath = e.target.value))}
          style={{ width: INPUT_WIDTH }}
        />
      </div>

      <div>
        <label>Set Tracking Start Time</label>
        <input
          type="text"
          value={config.startTime}
          onChange={(e) =>
            setConfigWithLambda((cf) => (cf.startTime = parseInt(e.target.value) || 0))
          }
        />
        <button onClick={() => setConfigWithLambda((cf) => (cf.startTime = Date.now()))}>
          Set Now
        </button>
      </div>
      <div>
        <button onClick={reload}>Reload and Validate</button>
        <button onClick={downloadData}>Download Backup</button>
      </div>
    </>
  );
};

export default Config;
