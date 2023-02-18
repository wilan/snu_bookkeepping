import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { FileResultData } from 'src/preload/types';
import { ClientObject, ConfigObject, DataSources } from './types';
import EditableInput from './EditableInput';
import { scanFilesToString } from './utilities';

const MAX_ROWS = 30;

const ClickableScanFile = ({ config, filename }: { config: ConfigObject; filename: string }) => {
  return (
    <a
      href="#"
      onClick={(e) => {
        window.api.openFile(`${config.scanPath}/${filename}`);
        e.preventDefault();
      }}
    >
      {filename}
    </a>
  );
};

const ScanDocumentModal = ({
  client,
  datasources,
  setShowModal,
}: {
  client: ClientObject;
  datasources: DataSources;
  setShowModal: (show: boolean) => void;
}) => {
  const { config, updateClients, clients } = datasources;
  const [scans, setScans] = useState<FileResultData[] | null>(null);
  const [currTime] = useState(Date.now());
  const [filter, setFilter] = useState('');
  useEffect(() => {
    setScans(window.api.listFiles(config.scanPath).sort((s1, s2) => s2.createTime - s1.createTime));
  }, []);
  const [clientInodes, setClientInodes] = useState(
    (client.meta?.scanInodes || []).map((x) => x[0]),
  );

  const legacyMapping: { [x: number]: string } = {};
  (client.meta?.scanInodes || []).forEach(([inode, name]) => {
    legacyMapping[inode] = name;
  });

  if (!scans) {
    return <></>;
  }

  const scanMap: { [inode: number]: FileResultData } = {};
  scans.forEach((scan) => {
    scanMap[scan.inode] = scan;
  });

  const clientInodesSet = new Set(clientInodes);

  const getFilename = (inode: number) => {
    return scanMap[inode]?.filename || legacyMapping[inode];
  };

  const fieldValue = scanFilesToString(clientInodes.map((inode: number) => getFilename(inode)));

  const edit = (inode: number, add: boolean) => {
    let newClientInodes: number[] = [];
    if (add) {
      newClientInodes = [...clientInodes, inode];
    } else {
      newClientInodes = clientInodes.filter((x) => x !== inode);
    }
    setClientInodes(newClientInodes);
  };

  const calculateDurationMinutes = (inode: number) => {
    return (scanMap[inode] ? (currTime - scanMap[inode].createTime) / 60000 : 0).toFixed(2);
  };

  let filteredScans = scans;
  if (filter) {
    filteredScans = filteredScans.filter((x) =>
      x.filename.toLowerCase().includes(filter.toLowerCase()),
    );
  }
  filteredScans = filteredScans.slice(0, MAX_ROWS);

  const renameFileCallback = (scanFile: FileResultData, newName: string) => {
    try {
      window.api.renameFile(
        `${config.scanPath}\\${scanFile.filename}`,
        `${config.scanPath}\\${newName}`,
      );
      scanFile.filename = newName;
      setScans([...scans]);
    } catch (err: any) {
      console.log(err.message);
      // show a warning.
    }
  };

  const getInitialModifiedFilename = () => {
    const suffix = (new Date().getFullYear() - 1) % 10;
    if (!client.lastname || !client.ssn4) {
      console.log(client);
      return null;
    }
    const tokens = [
      client.lastname,
      client.ssn4 + suffix,
      client.spouseSsn4 ? client.spouseSsn4 + suffix : null,
    ].filter(Boolean);
    return tokens.join(' ');
  };

  return (
    <Modal isOpen={true} onRequestClose={() => setShowModal(false)} ariaHideApp={false}>
      <h2>Filenames text value:</h2>
      <textarea value={fieldValue} disabled={true} style={{ width: '400px' }} />
      <div>
        <button
          onClick={() => {
            client.scanFilenames = fieldValue;
            if (client.meta) {
              client.meta.scanInodes = clientInodes.map((inode) => [inode, getFilename(inode)]);
            }
            updateClients(clients);
            setShowModal(false);
          }}
        >
          Ok
        </button>
        <button onClick={() => setShowModal(false)}>Cancel</button>
      </div>
      <h2>Select scanned document(s):</h2>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search by filename"
      />
      {clientInodes.map((inode) => (
        <div key={inode}>
          <input type="checkbox" checked={true} onChange={() => edit(inode, false)} />
          <EditableInput
            initialValue={getInitialModifiedFilename() || getFilename(inode)}
            editCallback={(newName) => renameFileCallback(scanMap[inode], newName)}
            disabled={!scanMap[inode]}
          >
            <ClickableScanFile filename={getFilename(inode)} config={config} />
          </EditableInput>
          {scanMap[inode] && <span>({calculateDurationMinutes(inode)} Minutes ago)</span>}
        </div>
      ))}
      {filteredScans.map(
        (scanFile) =>
          !clientInodesSet.has(scanFile.inode) && (
            <div key={scanFile.inode}>
              <input type="checkbox" checked={false} onChange={() => edit(scanFile.inode, true)} />
              <EditableInput
                initialValue={getInitialModifiedFilename() || scanFile.filename}
                editCallback={(newName) => renameFileCallback(scanFile, newName)}
              >
                <ClickableScanFile filename={scanFile.filename} config={config} />
              </EditableInput>
              {<span>({calculateDurationMinutes(scanFile.inode)} Minutes ago)</span>}
            </div>
          ),
      )}
    </Modal>
  );
};

export default ScanDocumentModal;
