import { useState } from 'react';
import ScanDocumentModal from './ScanDocumentModal';
import { ClientObject, DataSources } from './types';

const ScanDocumentTile = ({
  client,
  datasources,
}: {
  client: ClientObject;
  datasources: DataSources;
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && (
        <ScanDocumentModal client={client} datasources={datasources} setShowModal={setShowModal} />
      )}
      <div>
        <textarea disabled={true} value={client.scanFilenames} />
      </div>
      <button onClick={() => setShowModal(true)}>Select</button>
    </>
  );
};

export default ScanDocumentTile;
