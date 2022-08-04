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
import { EditSSHKeyModalProps } from './EditSSHKeyModal';
import Yaml from 'js-yaml';
import { CodeEditor, Language } from '@patternfly/react-code-editor';

const parseNMStateConfigsToYaml = (nmStateConfigs: NMStateK8sResource[]) => {
  return nmStateConfigs.reduce((configsYaml: string, nmStateConfig: NMStateK8sResource) => {
    const config = nmStateConfig.spec?.config;
    return configsYaml.concat('\n---\n', Yaml.dump(config));
  }, '');
};

export type EditStaticNetworkConfigurationProps = {
  isOpen: boolean;
  onClose: VoidFunction;
  onSubmit: (values: unknown) => void;
  infraEnvNMStateConfigs: NMStateK8sResource[];
  hasAgents: boolean;
  hasBMHs: boolean;
};

const EditStaticNetworkConfigurationDialog = ({
  isOpen,
  onClose,
  infraEnvNMStateConfigs,
  onSubmit,
}: EditStaticNetworkConfigurationProps) => {
  const [error, setError] = React.useState<string | undefined>();
  const code = parseNMStateConfigsToYaml(infraEnvNMStateConfigs);
  console.log('code', code);
  return (
    <Modal
      aria-label="Edit static network configuration dialog"
      title="Edit static network configuration"
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.large}
      id="edit-static-network-configuration-modal"
      hasNoBodyWrapper
    >
      <Formik<Record<string, unknown>>
        initialValues={
          {
            // nmStateConfig: '',
          }
        }
        // validationSchema={validationSchema}
        onSubmit={(values) => {
          try {
            onSubmit(values);
            console.log(values);
            onClose();
          } catch (err) {
            // setError(err?.message || 'An error occured');
          }
        }}
        validateOnMount
      >
        {({ isSubmitting, isValid, submitForm }: FormikProps<EditSSHKeyModalProps>) => (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                <StackItem>
                  <CodeEditor
                    isDarkTheme
                    isLineNumbersVisible
                    // isReadOnly={isReadOnly}
                    isMinimapVisible
                    isLanguageLabelVisible
                    code={code}
                    // onChange={onChange}
                    language={Language.yaml}
                    // onEditorDidMount={onEditorDidMount}
                    height="400px"
                  />
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
