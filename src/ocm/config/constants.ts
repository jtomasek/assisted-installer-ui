export const STANDALONE_ASSISTED_UI_MODE = import.meta.env?.REACT_APP_BUILD_MODE || 'multi-cluster';
export const ASSISTED_SERVICE_API_ROOT = import.meta.env?.REACT_APP_API_ROOT || '';

export const isSingleClusterMode = () => STANDALONE_ASSISTED_UI_MODE === 'single-cluster';
export const OCM_CLUSTER_LIST_LINK = '/openshift'; // TODO(mlibra): Tweak it!!!
