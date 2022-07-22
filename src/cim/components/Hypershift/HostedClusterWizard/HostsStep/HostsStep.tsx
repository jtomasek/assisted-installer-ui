import * as React from 'react';
import * as Yup from 'yup';
import { Formik } from 'formik';
import noop from 'lodash/noop';
import { Stack, StackItem } from '@patternfly/react-core';
import HostsForm from './HostsForm';
import { HostsStepProps, HostsFormValues } from './types';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { HostsStepProps, HostsFormValues } from './types';
import { getAgentsForSelection } from '../../../helpers';
import { INFRAENV_AGENTINSTALL_LABEL_KEY } from '../../../common';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { Stack, StackItem } from '@patternfly/react-core';

const validationSchema = Yup.object<HostsFormValues>().shape({
  agentNamespace: Yup.string().required(),
  nodePools: Yup.array().of(
    Yup.object()
      .shape({
        name: Yup.string().required(),
        clusterName: Yup.string().required(),
        count: Yup.number(),
        releaseImage: Yup.string().required(),
      })
      .required(),
  ),
});

const HostsStep: React.FC<HostsStepProps> = ({
  formRef,
  onValuesChanged,
  infraEnvs,
  agents,
  clusterName,
  initInfraEnv,
  initNodePools,
  initReleaseImage,
}) => {
  const { t } = useTranslation();
  const availableAgents = getAgentsForSelection(agents);

  const infraEnvsWithAgents = infraEnvs.filter((ie) =>
    availableAgents.some(
      (a) =>
        a.metadata?.labels?.[INFRAENV_AGENTINSTALL_LABEL_KEY] === ie.metadata?.name &&
        a.metadata?.namespace === ie.metadata?.namespace &&
        !a.spec.clusterDeploymentName,
    ),
  );
  return (
    <Stack hasGutter>
      <StackItem>
        {t(
          'ai:Define the quantity of worker nodes and nodepools to create for your cluster. Additional worker nodes and nodepools can be added after the cluster is created.',
        )}
      </StackItem>
      <StackItem>
        <Formik<HostsFormValues>
          initialValues={{
            agentNamespace: initInfraEnv || infraEnvsWithAgents[0]?.metadata?.namespace || '',
            nodePools: initNodePools || [
              {
                name: `nodepool-${clusterName}-1`,
                count: 1,
                agentLabels: [],
                releaseImage: initReleaseImage,
                clusterName,
              },
            ],
          }}
          validationSchema={validationSchema}
          innerRef={formRef}
          onSubmit={noop}
        >
          <HostsForm
            onValuesChanged={onValuesChanged}
            infraEnvs={infraEnvsWithAgents}
            agents={agents}
            clusterName={clusterName}
            initReleaseImage={initReleaseImage}
          />
        </Formik>
      </StackItem>
    </Stack>
  );
};

export default HostsStep;