import React from 'react';
import * as Yup from 'yup';
import _ from 'lodash';
import { Formik, FormikHelpers } from 'formik';
import { Cluster, ClusterUpdateParams } from '../../api/types';
import ClusterWizardStep from './ClusterWizardStep';
import { nameValidationSchema, validJSONSchema } from '../ui/formik/validationSchemas';
import { ButtonVariant, Form, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import InputField from '../ui/formik/InputField';
import SelectField from '../ui/formik/SelectField';
import PullSecret from '../clusters/PullSecret';
import { routeBasePath } from '../../config/constants';
import ClusterToolbar from '../clusters/ClusterToolbar';
import ToolbarButton from '../ui/Toolbar/ToolbarButton';
import { useHistory } from 'react-router-dom';
import LoadingState from '../ui/uiState/LoadingState';
import { usePullSecretFetch } from '../fetching/pullSecret';
import { captureException } from '../../sentry';
import { ClusterDetailsValues } from '../../types/clusters';
import { getClusters, patchCluster } from '../../api/clusters';
import { getErrorMessage, handleApiError } from '../../api/utils';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import { useDispatch } from 'react-redux';
import { AlertsContext } from '../AlertsContextProvider';
import ClusterWizardContext from './ClusterWizardContext';

type ClusterDetailsProps = {
  cluster: Cluster;
};

const ClusterDetails: React.FC<ClusterDetailsProps> = ({ cluster }) => {
  const pullSecret = usePullSecretFetch();
  if (pullSecret === undefined) {
    return (
      <ClusterWizardStep>
        <LoadingState />
      </ClusterWizardStep>
    );
  }
  return <ClusterDetailsForm cluster={cluster} pullSecret={pullSecret} />;
};

export default ClusterDetails;

type ClusterDetailsFormProps = {
  cluster: Cluster;
  pullSecret: string;
};

const ClusterDetailsForm: React.FC<ClusterDetailsFormProps> = ({ cluster, pullSecret }) => {
  const { alerts, addAlert, clearAlerts } = React.useContext(AlertsContext);
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const history = useHistory();
  const dispatch = useDispatch();
  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const { name, openshiftVersion = '', pullSecretSet } = cluster;
  const initialValues = {
    name,
    openshiftVersion,
    pullSecret,
    useRedHatDnsService: false,
  };
  const validationSchema = React.useCallback(
    () =>
      Yup.object({
        name: nameValidationSchema,
        openshiftVersion: Yup.string().required('Required'),
        pullSecret: validJSONSchema.required('Pull secret must be provided.'),
      }),
    [],
  );

  const handleSubmit = async (
    values: ClusterDetailsValues,
    formikActions: FormikHelpers<ClusterDetailsValues>,
  ) => {
    clearAlerts();

    // async validation for cluster name - run only on submit
    try {
      const { data: clusters } = await getClusters();
      const names = clusters.map((c) => c.name).filter((n) => n !== cluster.name);
      if (names.includes(values.name)) {
        return formikActions.setFieldError('name', `Name "${values.name}" is already taken.`);
      }
    } catch (e) {
      captureException(e, 'Failed to perform unique cluster name validation.');
    }

    // update the cluster configuration
    try {
      console.log('values', values);
      const params = _.omit(values, ['useRedHatDnsService']);

      const { data } = await patchCluster(cluster.id, params);
      // formikActions.resetForm({
      //   values: getInitialValues(data, managedDomains),
      // });
      dispatch(updateCluster(data));
      setCurrentStepId('cluster-configuration');
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, isValid, dirty }) => {
        const form = (
          <Form
            id="wizard-cluster-details__form"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submitForm();
              }
            }}
          >
            <Grid hasGutter>
              <GridItem span={12} lg={10} xl={9} xl2={7}>
                <Stack hasGutter>
                  <StackItem>
                    <InputField ref={nameInputRef} label="Cluster Name" name="name" isRequired />
                  </StackItem>
                  <StackItem>
                    <SelectField
                      label="OpenShift Version"
                      name="openshiftVersion"
                      options={[{ label: openshiftVersion, value: openshiftVersion }]}
                      // getHelperText={getOpenshiftVersionHelperText}
                      isDisabled
                      isRequired
                    />
                  </StackItem>
                  <StackItem>
                    <PullSecret pullSecret={pullSecret} />
                  </StackItem>
                </Stack>
              </GridItem>
            </Grid>
          </Form>
        );
        const footer = (
          <ClusterToolbar>
            <ToolbarButton
              name="save"
              variant={ButtonVariant.primary}
              isDisabled={isSubmitting || !isValid || !dirty}
              onClick={submitForm}
            >
              Next
            </ToolbarButton>

            <ToolbarButton
              variant={ButtonVariant.link}
              onClick={() => history.push(`${routeBasePath}/clusters`)}
            >
              Cancel
            </ToolbarButton>
          </ClusterToolbar>
        );
        return <ClusterWizardStep footer={footer}>{form}</ClusterWizardStep>;
      }}
    </Formik>
  );
};
