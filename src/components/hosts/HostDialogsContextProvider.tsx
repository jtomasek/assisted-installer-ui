import React from 'react';
import { Host, Inventory } from '../../api/types';

type HostIdAndHostname = {
  hostId: Host['id'];
  hostname: string;
};

type EditHostProps = {
  host: Host;
  inventory: Inventory;
};

export type HostDialogsContextType = {
  eventsDialog: {
    showDialog: HostIdAndHostname | undefined;
    setShowDialog: React.Dispatch<React.SetStateAction<HostIdAndHostname | undefined>>;
  };
  editHostDialog: {
    showDialog: EditHostProps | undefined;
    setShowDialog: React.Dispatch<React.SetStateAction<EditHostProps | undefined>>;
  };
  deleteHostDialog: {
    showDialog: HostIdAndHostname | undefined;
    setShowDialog: React.Dispatch<React.SetStateAction<HostIdAndHostname | undefined>>;
  };
  resetHostDialog: {
    showDialog: HostIdAndHostname | undefined;
    setShowDialog: React.Dispatch<React.SetStateAction<HostIdAndHostname | undefined>>;
  };
  additionalNTPSourcesDialog: {
    showDialog: boolean | undefined;
    setShowDialog: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  };
};

const defaultDialogValue = {
  showDialog: undefined,
  setShowDialog: () => undefined,
};

export const HostDialogsContext = React.createContext<HostDialogsContextType>({
  eventsDialog: defaultDialogValue,
  editHostDialog: defaultDialogValue,
  deleteHostDialog: defaultDialogValue,
  resetHostDialog: defaultDialogValue,
  additionalNTPSourcesDialog: defaultDialogValue,
});

export const HostDialogsContextProvider: React.FC = ({ children }) => {
  const [hostForEvents, setHostForEvents] = React.useState<HostIdAndHostname>();
  const [hostToEdit, setHostToEdit] = React.useState<EditHostProps>();
  const [hostToDelete, setHostToDelete] = React.useState<HostIdAndHostname>();
  const [hostToReset, setHostToReset] = React.useState<HostIdAndHostname>();
  const [showAdditionalNTPSourcesDialog, setShowAdditionalNTPSourcesDialog] = React.useState<
    boolean
  >();

  const context = {
    eventsDialog: { showDialog: hostForEvents, setShowDialog: setHostForEvents },
    editHostDialog: { showDialog: hostToEdit, setShowDialog: setHostToEdit },
    deleteHostDialog: { showDialog: hostToDelete, setShowDialog: setHostToDelete },
    resetHostDialog: { showDialog: hostToReset, setShowDialog: setHostToReset },
    additionalNTPSourcesDialog: {
      showDialog: showAdditionalNTPSourcesDialog,
      setShowDialog: setShowAdditionalNTPSourcesDialog,
    },
  };

  return <HostDialogsContext.Provider value={context}>{children}</HostDialogsContext.Provider>;
};
