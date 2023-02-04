import { useState } from 'react';

const EditableInput = ({
  initialValue,
  editCallback,
  disabled,
  children,
}: {
  initialValue: string;
  editCallback: (newValue: string) => void;
  disabled?: boolean;
  children?: JSX.Element;
}) => {
  const [editing, setEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(initialValue);

  return (
    <>
      {!editing && (
        <>
          {children ? children : <span>{initialValue}</span>}{' '}
          {!disabled && <button onClick={() => setEditing(!editing)}>Edit Name</button>}
        </>
      )}
      {editing && (
        <>
          <input type="text" value={editedValue} onChange={(e) => setEditedValue(e.target.value)} />
          <button onClick={() => setEditing(false)}>Cancel</button>
          <button
            onClick={() => {
              setEditing(false);
              editCallback(editedValue);
            }}
          >
            Ok
          </button>
        </>
      )}
    </>
  );
};

export default EditableInput;
