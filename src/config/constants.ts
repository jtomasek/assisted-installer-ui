import * as packageJson from '../../package.json';
import { ClusterCreateParams, Cluster, Host, Event } from '../api/types';
import { ValidationsInfo, Validation, HostRole } from '../types/hosts';

export let routeBasePath = '';
export const setRouteBasePath = (basePath: string) => {
  routeBasePath = basePath;
};

type OpenshiftVersionOptionType = {
  label: string;
  value: ClusterCreateParams['openshiftVersion'];
};

export const OPENSHIFT_VERSION_OPTIONS: OpenshiftVersionOptionType[] = [
  { label: 'OpenShift 4.6 Nightly', value: '4.6' },
];
export const DEFAULT_OPENSHIFT_VERSION: OpenshiftVersionOptionType['value'] =
  OPENSHIFT_VERSION_OPTIONS[0].value;

export const CLUSTER_MANAGER_SITE_LINK = 'https://cloud.redhat.com/openshift/install/pull-secret';
export const PULL_SECRET_INFO_LINK = CLUSTER_MANAGER_SITE_LINK;

export const FEEDBACK_FORM_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSfg9M8wRW4m_HkWeAl6KpB5dTcMu8iI3iJ29GlLfZpF2hnjng/viewform';

export const getBugzillaLink = (
  version: OpenshiftVersionOptionType['value'] = DEFAULT_OPENSHIFT_VERSION,
) =>
  `https://bugzilla.redhat.com/enter_bug.cgi?product=OpenShift%20Container%20Platform&Component=OpenShift%20Container%20Platform&component=assisted-installer&version=${version}`;

// TODO(mlibra): Retrieve branding dynamically, if needed, i.e. via injecting to the "window" object
export const getProductBrandingCode = () => 'redhat';

export const POLLING_INTERVAL = 10 * 1000;
export const EVENTS_POLLING_INTERVAL = 10 * 1000;

export const HOST_ROLES: HostRole[] = [
  {
    value: 'auto-assign',
    label: 'Automatic',
    description:
      'A role will be chosen automatically based on detected hardware and network latency.',
  },
  {
    value: 'master',
    label: 'Master',
    description: 'Runs the control plane components of OpenShift, including the API server.',
  },
  {
    value: 'worker',
    label: 'Worker',
    description:
      'Runs application workloads. Connect at least 5 hosts to enable dedicated workers.',
  },
];

export const CLUSTER_STATUS_LABELS: { [key in Cluster['status']]: string } = {
  'pending-for-input': 'Pending input',
  insufficient: 'Draft',
  ready: 'Ready',
  'preparing-for-installation': 'Preparing for installation',
  installing: 'Installing',
  finalizing: 'Finalizing',
  cancelled: 'Installation cancelled',
  error: 'Error',
  installed: 'Installed',
  'adding-hosts': 'Adding hosts',
};

export const HOST_STATUS_LABELS: { [key in Host['status']]: string } = {
  discovering: 'Discovering',
  'pending-for-input': 'Pending input',
  known: 'Known',
  disconnected: 'Disconnected',
  insufficient: 'Insufficient',
  disabled: 'Disabled',
  'preparing-for-installation': 'Preparing for installation',
  installing: 'Starting installation',
  'installing-in-progress': 'Installing',
  'installing-pending-user-action': 'Incorrect boot order',
  installed: 'Installed',
  cancelled: 'Installation cancelled',
  error: 'Error',
  resetting: 'Resetting',
  'resetting-pending-user-action': 'Reboot required',
  'added-to-existing-cluster': 'Added to existing cluster',
};

export const CLUSTER_FIELD_LABELS: { [key in string]: string } = {
  name: 'Cluster Name',
  baseDnsDomain: 'Base DNS Domain',
  clusterNetworkCidr: 'Cluster Network CIDR',
  clusterNetworkHostPrefix: 'Cluster Network Host Prefix',
  serviceNetworkCidr: 'Service Network CIDR',
  apiVip: 'API Virtual IP',
  ingressVip: 'Ingress Virtual IP',
  pullSecret: 'Pull Secret',
  sshPublicKey: 'SSH Public Key',
};

export const HOST_STATUS_DETAILS: { [key in Host['status']]: string } = {
  discovering:
    'This host is transmitting its hardware and networking information to the installer. Please wait while this information is received.',
  'pending-for-input': '',
  known:
    'This host meets the minimum hardware and networking requirements and will be included in the cluster.',
  disconnected:
    'This host has lost its connection to the installer and will not be included in the cluster unless connectivity is restored.',
  insufficient:
    'This host does not meet the minimum hardware or networking requirements and will not be included in the cluster.',
  disabled:
    'This host was manually disabled and will not be included in the cluster. Enable this host to include it again.',
  'preparing-for-installation': '',
  installing: '', // not rendered
  'installing-in-progress': '', // not rendered
  'installing-pending-user-action':
    "Please reconfigure this host's BIOS to boot from the disk where OpenShift was installed instead of the Discovery ISO.",
  installed: 'This host completed its installation successfully.',
  cancelled: 'This host installation has been cancelled.',
  error: 'This host failed its installation.',
  resetting: 'This host is resetting the installation.',
  'resetting-pending-user-action':
    'Host already booted from disk during previous installation. To finish resetting the installation please boot the host into Discovery ISO.',
  'added-to-existing-cluster': 'This host is being added to an existing cluster.',
};

export const HOST_HARDWARE_STATUS_DETAILS = {
  known: 'This host meets the minimum hardware requirements and will be included in the cluster.',
  insufficient:
    'This host does not meet the minimum hardware requirements and will not be included in the cluster.',
  disabled: HOST_STATUS_DETAILS['disabled'],
  disconnected: HOST_STATUS_DETAILS['disconnected'],
  discovering: HOST_STATUS_DETAILS['discovering'],
};

export const HOST_VALIDATION_GROUP_LABELS: { [key in keyof ValidationsInfo]: string } = {
  hardware: 'Hardware',
  network: 'Network',
  role: 'Roles',
};

export const HOST_VALIDATION_LABELS: { [key in Validation['id']]: string } = {
  'has-inventory': 'Hardware information',
  'has-min-cpu-cores': 'Minimum CPU cores',
  'has-min-memory': 'Minimum Memory',
  'has-min-valid-disks': 'Minimum disks of required size',
  'has-cpu-cores-for-role': 'Min. CPU cores required for selected role',
  'has-memory-for-role': 'Min. memory required for selected role',
  'hostname-unique': 'Unique hostname',
  'hostname-valid': 'Valid hostname',
  connected: 'Connected',
  'machine-cidr-defined': 'Machine CIDR',
  'belongs-to-machine-cidr': 'Belongs to machine CIDR',
  'role-defined': 'Role',
};

export const getFacetLibVersion = () => packageJson.version;

export const EVENT_SEVERITIES: Event['severity'][] = ['info', 'warning', 'error', 'critical'];

export const TIME_ZERO = '0001-01-01T00:00:00.000Z';
