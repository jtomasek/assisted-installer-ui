import React from 'react';
import {
  Alert,
  Button,
  ButtonVariant,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik, FormikProps } from 'formik';
import { NMStateK8sResource } from '../../types';
import { getWarningMessage } from './utils';
import { UploadSSH } from '../../../common';
import EditSSHKeyModal, { EditSSHKeyModalProps } from './EditSSHKeyModal';
import { EditSSHKeyFormikValues } from './types';

export type EditStaticNetworkConfigurationProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  // onSubmit: (values: EditSSHKeyFormikValues, infraEnv: InfraEnvK8sResource) => Promise<unknown>;
  infraEnvNMStateConfigs: NMStateK8sResource[];
  hasAgents: boolean;
  hasBMHs: boolean;
};

const EditStaticNetworkConfigurationDialog = ({
  isOpen,
  onClose,
  infraEnv,
  onSubmit,
  hasAgents,
  hasBMHs,
}: EditStaticNetworkConfigurationProps) => {
  const [error, setError] = React.useState<string | undefined>();
  const warningMsg = getWarningMessage(hasAgents, hasBMHs);
  return (
    <Modal
      aria-label="Edit static network configuration dialog"
      title="Edit static network configuration"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.medium}
      id="edit-static-network-configuration-modal"
      hasNoBodyWrapper
    >
      <Formik<EditSSHKeyFormikValues>
        initialValues={{
          sshPublicKey: infraEnv.spec?.sshAuthorizedKey || '',
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          try {
            await onSubmit(values, infraEnv);
            onClose();
          } catch (err) {
            setError(err?.message || 'An error occured');
          }
        }}
        validateOnMount
      >
        {({ isSubmitting, isValid, submitForm }: FormikProps<EditSSHKeyModalProps>) => (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                <StackItem>
                  <Alert isInline variant="warning" title={warningMsg} />
                </StackItem>
                <StackItem>
                  <UploadSSH />
                </StackItem>
                {error && (
                  <StackItem>
                    <Alert title={error} variant="danger" isInline />
                  </StackItem>
                )}
              </Stack>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button onClick={submitForm} isDisabled={isSubmitting || !isValid}>
                Save
              </Button>
              <Button onClick={onClose} variant={ButtonVariant.secondary}>
                Cancel
              </Button>
            </ModalBoxFooter>
          </>
        )}
      </Formik>
    </Modal>
  );
};

export default EditStaticNetworkConfigurationDialog;
