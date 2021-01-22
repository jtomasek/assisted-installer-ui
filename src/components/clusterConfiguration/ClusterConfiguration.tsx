import React from 'react';
import { Cluster } from '../../api/types';
import ClusterConfigurationForm from './ClusterConfigurationForm';

type ClusterConfigurationProps = {
  cluster: Cluster;
};
const ClusterConfiguration: React.FC<ClusterConfigurationProps> = ({ cluster }) => (
  <ClusterConfigurationForm cluster={cluster} />
);

export default ClusterConfiguration;
