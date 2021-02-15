import _ from 'lodash';
import { Cluster, ClusterValidationId, Host, HostValidationId, stringToJSON } from '../../api';
import {
  ValidationGroup as ClusterValidationGroup,
  ValidationsInfo as ClusterValidationsInfo,
} from '../../types/clusters';
import {
  ValidationGroup as HostValidationGroup,
  ValidationsInfo as HostValidationsInfo,
} from '../../types/hosts';

export type ClusterWizardStepsType =
  | 'cluster-details'
  | 'baremetal-discovery'
  | 'networking'
  | 'review';

export type ClusterWizardFlowStateType = {
  wizardFlow?: 'new' | undefined;
};

export const getClusterWizardFirstStep = (
  props?: ClusterWizardFlowStateType,
): ClusterWizardStepsType =>
  props?.wizardFlow === 'new' ? 'baremetal-discovery' : 'cluster-details';

type TransitionProps = { cluster: Cluster };

type WizardStepValidationMap = {
  cluster: {
    groups: ClusterValidationGroup[];
    validationIds: ClusterValidationId[];
  };
  host: {
    groups: HostValidationGroup[];
    validationIds: HostValidationId[];
  };
};

type WizardStepsValidationMap = {
  [key in ClusterWizardStepsType]: WizardStepValidationMap;
};

const clusterDetailsStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: ['pull-secret-set', 'dns-domain-defined'],
  },
  host: {
    groups: [],
    validationIds: [],
  },
};

const baremetalDiscoveryStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    // TODO(jtomasek): enable sufficient-masters-count once https://bugzilla.redhat.com/show_bug.cgi?id=1928086 is fixed
    validationIds: [/*'sufficient-masters-count',*/ 'ocs-requirements-satisfied'],
  },
  host: {
    groups: ['hardware'],
    validationIds: ['connected', 'container-images-available'],
  },
};

const networkingStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: ['network'],
    validationIds: [],
  },
  host: {
    groups: ['network'],
    validationIds: [],
  },
};

const reviewStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: ['all-hosts-are-ready-to-install'],
  },
  host: {
    groups: [],
    validationIds: [],
  },
};

const wizardStepsValidationsMap: WizardStepsValidationMap = {
  'cluster-details': clusterDetailsStepValidationsMap,
  'baremetal-discovery': baremetalDiscoveryStepValidationsMap,
  networking: networkingStepValidationsMap,
  review: reviewStepValidationsMap,
};

const checkClusterValidations = (
  clusterValidationsInfo: ClusterValidationsInfo,
  requiredIds: ClusterValidationId[],
): boolean => {
  const requiredValidations = _.values(clusterValidationsInfo)
    .flat()
    .filter((v) => v && requiredIds.includes(v.id));
  return (
    requiredValidations.length === requiredIds.length &&
    requiredValidations.every((v) => v?.status === 'success')
  );
};

const checkClusterValidationGroups = (
  clusterValidationsInfo: ClusterValidationsInfo,
  groups: ClusterValidationGroup[],
) =>
  groups.every((group) =>
    clusterValidationsInfo[group]?.every((validation) => validation.status === 'success'),
  );

export const checkHostValidations = (
  hostValidationsInfo: HostValidationsInfo,
  requiredIds: HostValidationId[],
): boolean => {
  const requiredValidations = _.values(hostValidationsInfo)
    .flat()
    .filter((v) => v && requiredIds.includes(v.id));

  return (
    requiredValidations.length === requiredIds.length &&
    requiredValidations.every((v) => v?.status === 'success')
  );
};

export const checkHostValidationGroups = (
  hostValidationsInfo: HostValidationsInfo,
  groups: HostValidationGroup[],
) =>
  groups.every((group) =>
    hostValidationsInfo[group]?.every((validation) => validation.status === 'success'),
  );

export const getWizardStepHostValidationsInfo = (
  validationsInfo: HostValidationsInfo,
  wizardStepId: ClusterWizardStepsType,
): HostValidationsInfo => {
  const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].host;
  return _.reduce(
    validationsInfo,
    (result, groupValidations, groupName) => {
      if (groups.includes(groupName as HostValidationGroup)) {
        result[groupName] = groupValidations;
        return result;
      }
      const selectedValidations = (groupValidations || []).filter((validation) =>
        validationIds.includes(validation.id),
      );
      if (selectedValidations.length) {
        result[groupName] = selectedValidations;
        return result;
      }
      return result;
    },
    {},
  );
};

export const getWizardStepHostStatus = (
  host: Host,
  wizardStepId: ClusterWizardStepsType,
): Host['status'] => {
  const { status } = host;
  if (['insufficient', 'pending-for-input'].includes(host.status)) {
    const validationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo) || {};
    const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].host;

    // TODO(jtomasek): alternatively we could getWizardStepValidationsInfo and ensure that all validations are passing
    return checkHostValidationGroups(validationsInfo, groups) &&
      checkHostValidations(validationsInfo, validationIds)
      ? 'known'
      : host.status;
  }
  return status;
};

export const getWizardStepClusterValidationsInfo = (
  validationsInfo: ClusterValidationsInfo,
  wizardStepId: ClusterWizardStepsType,
): ClusterValidationsInfo => {
  const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].cluster;
  return _.reduce(
    validationsInfo,
    (result, groupValidations, groupName) => {
      if (groups.includes(groupName as ClusterValidationGroup)) {
        result[groupName] = groupValidations;
        return result;
      }
      const selectedValidations = (groupValidations || []).filter((validation) =>
        validationIds.includes(validation.id),
      );
      if (selectedValidations.length) {
        result[groupName] = selectedValidations;
        return result;
      }
      return result;
    },
    {},
  );
};

export const getWizardStepClusterStatus = (
  cluster: Cluster,
  wizardStepId: ClusterWizardStepsType,
): Cluster['status'] => {
  const { status } = cluster;
  if (['insufficient', 'pending-for-input'].includes(cluster.status)) {
    const validationsInfo = stringToJSON<ClusterValidationsInfo>(cluster.validationsInfo) || {};
    const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].cluster;
    const allHostsReady = (cluster?.hosts || []).every(
      (host) => getWizardStepHostStatus(host, wizardStepId) === 'known',
    );
    return allHostsReady &&
      checkClusterValidationGroups(validationsInfo, groups) &&
      checkClusterValidations(validationsInfo, validationIds)
      ? 'ready'
      : cluster.status;
  }
  return status;
};

/*
We are colocating all these canNext* functions for easier maintenance.
However they should be independent on each other anyway.
*/
export const canNextClusterDetails = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus(cluster, 'cluster-details') === 'ready';

export const canNextBaremetalDiscovery = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus(cluster, 'baremetal-discovery') === 'ready';

export const canNextNetwork = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus(cluster, 'networking') === 'ready';
