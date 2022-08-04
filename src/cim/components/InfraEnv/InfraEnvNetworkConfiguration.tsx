import React from 'react';
import { Formik, FormikProps } from 'formik';
import { NMStateK8sResource, NMStateNetworkConfiguration } from '../../types';
import { getErrorMessage } from '../../../common/utils';
import InfraEnvNetworkConfigurationForm from './InfraEnvNetworkConfigurationForm';

export type InfraEnvNetworkConfigurationFormValues = {
  networkConfigs: NMStateNetworkConfiguration[];
};

const getInitialValues = (
  nmStateConfigs: NMStateK8sResource[],
): InfraEnvNetworkConfigurationFormValues => ({
  networkConfigs: nmStateConfigs.map(
    (nmStateConfig): NMStateNetworkConfiguration => ({
      config: nmStateConfig.spec?.config || {},
      interfaces: nmStateConfig.spec?.interfaces || [],
    }),
  ),
});

export type InfraEnvNetworkConfigurationProps = {
  updateNMStateConfigs: (networkConfigs: NMStateNetworkConfiguration[]) => Promise<void>;
  infraEnvNMStateConfigs: NMStateK8sResource[];
};

const InfraEnvNetworkConfiguration = ({
  infraEnvNMStateConfigs,
  updateNMStateConfigs,
}: InfraEnvNetworkConfigurationProps) => {
  const [error, setError] = React.useState<string | undefined>();

  const handleSubmit = async ({ networkConfigs }: InfraEnvNetworkConfigurationFormValues) => {
    try {
      await updateNMStateConfigs(networkConfigs);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Formik<InfraEnvNetworkConfigurationFormValues>
      initialValues={getInitialValues(infraEnvNMStateConfigs)}
      // validationSchema={validationSchema}
      onSubmit={handleSubmit}
      validateOnMount
    >
      {(formikProps: FormikProps<InfraEnvNetworkConfigurationFormValues>) => {
        return <InfraEnvNetworkConfigurationForm {...formikProps} error={error} />;
      }}
    </Formik>
  );
};

export default InfraEnvNetworkConfiguration;
