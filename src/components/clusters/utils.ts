import {
  Cluster,
  LogsState,
  MonitoredOperator,
  MonitoredOperatorsList,
  OperatorCreateParams,
} from '../../api/types';

export const isSingleNodeCluster = (cluster: Cluster) => cluster.highAvailabilityMode === 'None';

export const filterHostsByLogStates = (cluster: Cluster, logStates: LogsState[]) =>
  cluster.hosts?.filter(({ logsInfo }) => logsInfo && logStates.includes(logsInfo)) || [];

export const calculateCollectedLogsCount = (cluster: Cluster) => {
  const collectedLogStates: LogsState[] = ['completed', 'timeout'];
  const clusterHasCollectedLogs = cluster.logsInfo && collectedLogStates.includes(cluster.logsInfo);
  const hostsWithCollectedLogsCount = filterHostsByLogStates(cluster, collectedLogStates).length;

  return (clusterHasCollectedLogs ? 1 : 0) + hostsWithCollectedLogsCount;
};

export const getBuiltInOperators = (monitoredOperators: MonitoredOperatorsList = []) =>
  monitoredOperators.filter((operator: MonitoredOperator) => operator.operatorType === 'builtin');

export const getOlmOperators = (monitoredOperators: MonitoredOperatorsList = []) =>
  monitoredOperators.filter((operator) => operator.operatorType === 'olm');

export const getOlmOperatorCreateParams = (
  monitoredOperators: MonitoredOperatorsList = [],
): OperatorCreateParams[] =>
  getOlmOperators(monitoredOperators).map((operator) => ({
    name: operator.name,
    properties: operator.properties,
  }));

export const getOlmOperatorCreateParamsByName = (monitoredOperators: MonitoredOperatorsList = []) =>
  getOlmOperatorCreateParams(monitoredOperators).reduce(
    (result: { [key: string]: OperatorCreateParams }, operator) => {
      if (operator.name) {
        result[operator.name] = operator;
      }
      return result;
    },
    {},
  );
