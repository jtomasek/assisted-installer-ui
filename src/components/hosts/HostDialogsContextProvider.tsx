import React from 'react';
import { Host, Inventory } from '../../api/types';
import dialogsReducer, {
  openDialog as openDialogAction,
  closeDialog as closeDialogAction,
} from '../../features/dialogs/dialogsSlice';

type HostIdAndHostname = {
  hostId: Host['id'];
  hostname: string;
};

type EditHostProps = {
  host: Host;
  inventory: Inventory;
};

type DialogsDataTypes = {
  eventsDialog: HostIdAndHostname;
  editHostDialog: EditHostProps;
  deleteHostDialog: HostIdAndHostname;
  resetHostDialog: HostIdAndHostname;
  additionalNTPSourcesDialog: void;
};

type DialogId =
  | 'eventsDialog'
  | 'editHostDialog'
  | 'deleteHostDialog'
  | 'resetHostDialog'
  | 'additionalNTPSourcesDialog';

export type HostDialogsContextType = {
  [key in DialogId]: {
    isOpen: boolean;
    open: (data: DialogsDataTypes[key]) => void;
    close: () => void;
    data?: DialogsDataTypes[key];
  };
};

const defaultDialogValue = {
  isOpen: false,
  open: (data: void | HostIdAndHostname | EditHostProps) => {
    console.warn('Trying to open a dialog but HostDialogsContextProvider is not rendered');
  },
  close: () => {
    console.warn('Trying to open a dialog but HostDialogsContextProvider is not rendered');
  },
  data: undefined,
};

const initialState = {
  eventsDialog: defaultDialogValue,
  editHostDialog: defaultDialogValue,
  deleteHostDialog: defaultDialogValue,
  resetHostDialog: defaultDialogValue,
  additionalNTPSourcesDialog: defaultDialogValue,
};

export const HostDialogsContext = React.createContext<HostDialogsContextType>(initialState);

export const HostDialogsContextProvider: React.FC = ({ children }) => {
  const [dialogsState, dispatchDialogsAction] = React.useReducer(dialogsReducer, {});

  function getOpenDialog<DataType>(dialogId: string) {
    return (data: DataType) => dispatchDialogsAction(openDialogAction({ dialogId, data }));
  }

  const getCloseDialog = (dialogId: string) => () =>
    dispatchDialogsAction(closeDialogAction({ dialogId }));

  const dialogIds: DialogId[] = [
    'eventsDialog',
    'editHostDialog',
    'deleteHostDialog',
    'resetHostDialog',
    'additionalNTPSourcesDialog',
  ];

  const context = React.useMemo(
    () =>
      dialogIds.reduce((context, dialogId) => {
        context[dialogId] = {
          isOpen: !!dialogsState[dialogId],
          open: (data: DialogsDataTypes[typeof dialogId]) =>
            getOpenDialog<DialogsDataTypes[typeof dialogId]>(dialogId)(data),
          close: () => getCloseDialog(dialogId)(),
          data: dialogsState[dialogId],
        };
        return context;
      }, initialState),
    [dialogIds, dialogsState],
  );

  return <HostDialogsContext.Provider value={context}>{children}</HostDialogsContext.Provider>;
};
