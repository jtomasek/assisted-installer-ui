import { K8sResourceCommon } from 'console-sdk-ai-lib';

export type NMStateK8sResource = K8sResourceCommon & {
  spec?: NMStateNetworkConfiguration;
};

export type NMStateNetworkConfiguration = {
  config: Record<string, unknown>;
  interfaces: {
    macAddress: string;
    name: string;
  }[];
};
