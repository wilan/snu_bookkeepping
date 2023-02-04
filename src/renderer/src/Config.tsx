import { ConfigObject, DataSources } from './types';

const INPUT_WIDTH = '350px';

const Config = ({ datasources, reload }: { datasources: DataSources; reload: () => void }) => {
  const { config, setConfig } = datasources;

  const setConfigWithLambda = (lambda: (cf: ConfigObject) => void) => {
    lambda(config);
    setConfig(config);
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
      </div>
    </>
  );
};

export default Config;
