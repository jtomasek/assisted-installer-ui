import React from 'react';
import { FieldArray, FormikProps } from 'formik';
import { Alert, Button, ExpandableSection, Grid, GridItem } from '@patternfly/react-core';
import { InfraEnvNetworkConfigurationFormValues } from './InfraEnvNetworkConfiguration';
import { NMStateNetworkConfiguration } from '../../types/k8s/nm-state';
import Yaml from 'js-yaml';
import { CodeEditor, Language } from '@patternfly/react-code-editor';

const emptyNetworkConfig: NMStateNetworkConfiguration = {
  config: { interfaces: [] },
  interfaces: [],
};

const parseNetworkConfigsToYaml = (networkConfigs: NMStateNetworkConfiguration[]) => {
  return networkConfigs.reduce(
    (allConfigsYaml: string, networkConfig: NMStateNetworkConfiguration) => {
      return allConfigsYaml.concat('---\n', Yaml.dump(networkConfig));
    },
    '',
  );
};

const InfraEnvNetworkConfigurationForm = ({
  isSubmitting,
  isValid,
  submitForm,
  setFieldValue,
  values,
  error,
}: FormikProps<InfraEnvNetworkConfigurationFormValues> & { error?: string }) => {
  const [expandedHost, setExpandedHost] = React.useState<string>();

  const handleCodeChange = (value: string) => {
    console.log(value);
    try {
      const networkConfigs = Yaml.loadAll(value) as NMStateNetworkConfiguration[];
      setFieldValue('networkConfigs', networkConfigs);
      console.log(networkConfigs);
    } catch (e) {
      console.log(e);
    }
  };

  console.log('values', values);
  const code = parseNetworkConfigsToYaml(values.networkConfigs);
  console.log('code', code);
  return (
    <Grid hasGutter>
      <GridItem span={6}>
        <FieldArray name="networkConfigs">
          {(arrayHelpers) => (
            <>
              {values.networkConfigs.map((networkConfig, index) => {
                const name = `Host ${index}`;
                const isExpanded = name === expandedHost;
                return (
                  <ExpandableSection
                    key={name}
                    toggleText={name}
                    onToggle={() => {
                      if (name === expandedHost) {
                        setExpandedHost(undefined);
                      } else {
                        setExpandedHost(name);
                      }
                    }}
                    isExpanded={isExpanded}
                  >
                    This content is visible only when the component is expanded.
                  </ExpandableSection>
                );
              })}
              <Button onClick={() => arrayHelpers.push(emptyNetworkConfig)}>Add</Button>
              <Button
                onClick={() =>
                  arrayHelpers.push(values.networkConfigs[values.networkConfigs.length - 1])
                }
              >
                Copy from previous
              </Button>
            </>
          )}
        </FieldArray>
      </GridItem>
      <GridItem span={6}>
        <CodeEditor
          isDarkTheme
          isLineNumbersVisible
          isUploadEnabled
          // isReadOnly={isReadOnly}
          isMinimapVisible
          // isLanguageLabelVisible
          code={code}
          // height={`${contentRect.bounds?.height}px`}
          height="800px"
          // onChange={onChange}
          onCodeChange={handleCodeChange}
          language={Language.yaml}
          // onEditorDidMount={onEditorDidMount}
        />
      </GridItem>
      {error && (
        <GridItem>
          <Alert title="An error occured" variant="danger" isInline>
            {error}
          </Alert>
        </GridItem>
      )}
      <GridItem>
        <Button onClick={submitForm} isDisabled={isSubmitting || !isValid}>
          Save changes
        </Button>
      </GridItem>
    </Grid>
  );
};

export default InfraEnvNetworkConfigurationForm;
