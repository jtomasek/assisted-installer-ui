import React from 'react';
import * as Yup from 'yup';
import _ from 'lodash';
import { Formik, FormikHelpers } from 'formik';
import { Cluster, ClusterCreateParams, ClusterUpdateParams, ManagedDomain } from '../../api/types';
import ClusterWizardStep from './ClusterWizardStep';
import {
  dnsNameValidationSchema,
  nameValidationSchema,
  validJSONSchema,
} from '../ui/formik/validationSchemas';
import { Form, Grid, GridItem, Text, TextContent } from '@patternfly/react-core';
import InputField from '../ui/formik/InputField';
import SelectField from '../ui/formik/SelectField';
import PullSecret from '../clusters/PullSecret';
import { routeBasePath } from '../../config/constants';
import { useHistory } from 'react-router-dom';
import LoadingState from '../ui/uiState/LoadingState';
import { usePullSecretFetch } from '../fetching/pullSecret';
import { captureException } from '../../sentry';
import { getClusters, patchCluster, postCluster } from '../../api/clusters';
import { getErrorMessage, handleApiError } from '../../api/utils';
import { updateCluster } from '../../features/clusters/currentClusterSlice';
import { useDispatch } from 'react-redux';
import { AlertsContext } from '../AlertsContextProvider';
import ClusterWizardContext from './ClusterWizardContext';
import CheckboxField from '../ui/formik/CheckboxField';
import { getManagedDomains } from '../../api/domains';
import { canNextClusterDetails, ClusterWizardFlowStateType } from './wizardTransition';
import { OpenshiftVersionOptionType } from '../../types/versions';
import SingleNodeCheckbox from '../ui/formik/SingleNodeCheckbox';
import OpenShiftVersionSelect from '../clusterConfiguration/OpenShiftVersionSelect';
import ClusterWizardToolbar from './ClusterWizardToolbar';
import { useOpenShiftVersions } from '../fetching/OpenShiftVersions';
import { getDefaultOpenShiftVersion } from '../clusters/utils';

type ClusterDetailsFormProps = {
  cluster?: Cluster;
  pullSecret: string;
  managedDomains: ManagedDomain[];
  versions: OpenshiftVersionOptionType[];
};

type ClusterDetailsValues = {
  name: string;
  highAvailabilityMode: 'Full' | 'None';
  openshiftVersion: string;
  pullSecret: string;
  baseDnsDomain: string;
  useRedHatDnsService: boolean;
};

const getInitialValues = (props: ClusterDetailsFormProps): ClusterDetailsValues => {
  const { cluster, pullSecret, managedDomains, versions } = props;
  const {
    name = '',
    highAvailabilityMode = 'Full',
    baseDnsDomain = '',
    openshiftVersion = getDefaultOpenShiftVersion(versions),
  } = cluster || {};
  return {
    name,
    highAvailabilityMode,
    openshiftVersion,
    pullSecret,
    baseDnsDomain,
    useRedHatDnsService:
      !!baseDnsDomain && managedDomains.map((d) => d.domain).includes(baseDnsDomain),
  };
};

const getValidationSchema = (cluster?: Cluster) => {
  if (cluster?.pullSecretSet) {
    return Yup.object({
      name: nameValidationSchema,
      baseDnsDomain: dnsNameValidationSchema.required('Base Domain is required.'),
    });
  }
  return Yup.object({
    name: nameValidationSchema,
    pullSecret: validJSONSchema.required('Pull secret must be provided.'),
    baseDnsDomain: dnsNameValidationSchema.required('Base Domain is required.'),
  });
};

// For performance reasons, this is validated on submit only
const validateClusterName = async (newFullName: string, existingClusterFullName?: string) => {
  try {
    const { data: clusters } = await getClusters();
    const names = clusters
      .map((c) => `${c.name}.${c.baseDnsDomain}`)
      .filter((n) => n !== existingClusterFullName);
    if (names.includes(newFullName)) {
      return `Name "${newFullName}" is already taken.`;
    }
  } catch (e) {
    captureException(e, 'Failed to perform unique cluster name validation.');
  }
};

const ClusterDetailsForm: React.FC<ClusterDetailsFormProps> = (props) => {
  const { cluster, pullSecret, managedDomains, versions } = props;
  const { addAlert, clearAlerts } = React.useContext(AlertsContext);
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
  const history = useHistory();
  const dispatch = useDispatch();
  const nameInputRef = React.useRef<HTMLInputElement>();
  React.useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleClusterUpdate = async (clusterId: Cluster['id'], values: ClusterDetailsValues) => {
    const params: ClusterUpdateParams = _.omit(values, [
      'highAvailabilityMode',
      'pullSecret',
      'openshiftVersion',
      'useRedHatDnsService',
    ]);

    try {
      const { data } = await patchCluster(clusterId, params);
      dispatch(updateCluster(data));

      canNextClusterDetails({ cluster: data }) && setCurrentStepId('baremetal-discovery');
    } catch (e) {
      handleApiError<ClusterUpdateParams>(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
      );
    }
  };

  const handleClusterCreate = async (values: ClusterDetailsValues) => {
    const params: ClusterCreateParams = _.omit(values, ['useRedHatDnsService']);

    try {
      const { data } = await postCluster(params);
      const locationState: ClusterWizardFlowStateType = { wizardFlow: 'new' };
      history.push(`${routeBasePath}/clusters/${data.id}`, locationState);
    } catch (e) {
      handleApiError<ClusterCreateParams>(e, () =>
        addAlert({ title: 'Failed to create new cluster', message: getErrorMessage(e) }),
      );
    }
  };

  const handleSubmit = async (
    values: ClusterDetailsValues,
    formikActions: FormikHelpers<ClusterDetailsValues>,
  ) => {
    clearAlerts();

    const newClusterFullName = `${values.name}.${values.baseDnsDomain}`;
    if (cluster) {
      const clusterNameError = await validateClusterName(
        newClusterFullName,
        `${cluster.name}.${cluster.baseDnsDomain}`,
      );
      if (clusterNameError) {
        return formikActions.setFieldError('name', clusterNameError);
      }
      await handleClusterUpdate(cluster.id, values);
    } else {
      const clusterNameError = await validateClusterName(newClusterFullName);
      if (clusterNameError) {
        return formikActions.setFieldError('name', clusterNameError);
      }
      await handleClusterCreate(values);
    }
  };

  const initialValues = getInitialValues(props);
  const validationSchema = getValidationSchema(cluster);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ submitForm, isSubmitting, isValid, dirty, values, setFieldValue, errors }) => {
        const { name: clusterName, baseDnsDomain, useRedHatDnsService } = values;

        const baseDnsHelperText = (
          <>
            All DNS records must be subdomains of this base and include the cluster name. This
            cannot be changed after cluster installation. The full cluster address will be: <br />
            <strong>
              {clusterName || '[Cluster Name]'}.{baseDnsDomain || '[example.com]'}
            </strong>
          </>
        );

        const toggleRedHatDnsService = (checked: boolean) =>
          setFieldValue('baseDnsDomain', checked ? managedDomains.map((d) => d.domain)[0] : '');

        const form = (
          <>
            <Grid hasGutter>
              <GridItem>
                <TextContent>
                  <Text component="h2">Cluster Details</Text>
                </TextContent>
              </GridItem>
              <GridItem span={12} lg={10} xl={9} xl2={7}>
                <Form id="wizard-cluster-details__form">
                  <InputField ref={nameInputRef} label="Cluster Name" name="name" isRequired />
                  {!!managedDomains.length && (
                    <CheckboxField
                      name="useRedHatDnsService"
                      label="Use a temporary 60-day domain"
                      helperText="A base domain will be provided for temporary, non-production clusters."
                      onChange={toggleRedHatDnsService}
                    />
                  )}
                  {values.useRedHatDnsService ? (
                    <SelectField
                      label="Base Domain"
                      name="baseDnsDomain"
                      helperText={baseDnsHelperText}
                      options={managedDomains.map((d) => ({
                        label: `${d.domain} (${d.provider})`,
                        value: d.domain,
                      }))}
                      isRequired
                    />
                  ) : (
                    <InputField
                      label="Base Domain"
                      name="baseDnsDomain"
                      helperText={baseDnsHelperText}
                      placeholder="example.com"
                      isDisabled={useRedHatDnsService}
                      isRequired
                    />
                  )}
                  <SingleNodeCheckbox
                    name="highAvailabilityMode"
                    versions={versions}
                    isDisabled={!!cluster}
                  />
                  <OpenShiftVersionSelect versions={versions} isDisabled={!!cluster} />
                  {!cluster?.pullSecretSet && <PullSecret pullSecret={pullSecret} />}
                </Form>
              </GridItem>
            </Grid>
          </>
        );
        const footer = (
          <ClusterWizardToolbar
            cluster={cluster}
            formErrors={errors}
            dirty={dirty}
            isSubmitting={isSubmitting}
            isNextDisabled={
              !(isValid && (dirty || (cluster && canNextClusterDetails({ cluster }))))
            }
            onNext={submitForm}
          />
        );
        return (
          <ClusterWizardStep cluster={cluster} footer={footer}>
            {form}
          </ClusterWizardStep>
        );
      }}
    </Formik>
  );
};

type ClusterDetailsProps = {
  cluster?: Cluster;
};

const ClusterDetails: React.FC<ClusterDetailsProps> = ({ cluster }) => {
  const [managedDomains, setManagedDomains] = React.useState<ManagedDomain[]>();
  const { addAlert } = React.useContext(AlertsContext);

  React.useEffect(() => {
    const fetchManagedDomains = async () => {
      try {
        const { data } = await getManagedDomains();
        setManagedDomains(data);
      } catch (e) {
        setManagedDomains([]);
        handleApiError(e, () =>
          addAlert({ title: 'Failed to retrieve managed domains', message: getErrorMessage(e) }),
        );
      }
    };
    fetchManagedDomains();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pullSecret = usePullSecretFetch();

  const { openShiftVersions } = useOpenShiftVersions();

  if (pullSecret === undefined || !managedDomains) {
    return (
      <ClusterWizardStep cluster={cluster}>
        <LoadingState />
      </ClusterWizardStep>
    );
  }
  return (
    <ClusterDetailsForm
      cluster={cluster}
      pullSecret={pullSecret}
      managedDomains={managedDomains}
      versions={openShiftVersions}
    />
  );
};

export default ClusterDetails;
