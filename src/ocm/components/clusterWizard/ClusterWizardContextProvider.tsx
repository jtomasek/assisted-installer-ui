import React, { PropsWithChildren } from 'react';
import ClusterWizardContext, { ClusterWizardContextType } from './ClusterWizardContext';
import {
  ClusterWizardStepsType,
  getClusterWizardFirstStep,
  isStaticIpStep,
} from './wizardTransition';
import { HostsNetworkConfigurationType } from '../../services';
import { defaultWizardSteps, staticIpFormViewSubSteps } from './constants';
import { Cluster, InfraEnv } from '../../../common/api';
import { StaticIpView } from '../clusterConfiguration/staticIp/data/dataTypes';
import { getStaticIpInfo } from '../clusterConfiguration/staticIp/data/fromInfraEnv';
import isEqual from 'lodash/isEqual';

const getWizardStepIds = (staticIpView?: StaticIpView): ClusterWizardStepsType[] => {
  const stepIds: ClusterWizardStepsType[] = [...defaultWizardSteps];
  if (staticIpView === StaticIpView.YAML) {
    stepIds.splice(1, 0, 'static-ip-yaml-view');
  } else if (staticIpView === StaticIpView.FORM) {
    stepIds.splice(1, 0, ...staticIpFormViewSubSteps);
  }
  return stepIds;
};

const ClusterWizardContextProvider: React.FC<
  PropsWithChildren<{
    cluster?: Cluster;
    infraEnv?: InfraEnv;
  }>
> = ({ children, cluster, infraEnv }) => {
  const [currentStepId, setCurrentStepId] = React.useState<ClusterWizardStepsType>();
  const [wizardStepIds, setWizardStepIds] = React.useState<ClusterWizardStepsType[]>();
  React.useEffect(() => {
    const staticIpInfo = infraEnv ? getStaticIpInfo(infraEnv) : undefined;
    const firstStep = getClusterWizardFirstStep(staticIpInfo, cluster?.status);
    const firstStepIds = getWizardStepIds(staticIpInfo?.view);
    setCurrentStepId(firstStep);
    setWizardStepIds(firstStepIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const contextValue = React.useMemo<ClusterWizardContextType | null>(() => {
    if (!wizardStepIds || !currentStepId) {
      return null;
    }

    const onBackFromStaticIp = (nextStepId: ClusterWizardStepsType) => {
      if (nextStepId !== 'cluster-details') {
        return;
      }
      const staticIpInfo = infraEnv ? getStaticIpInfo(infraEnv) : undefined;
      if (!staticIpInfo) {
        throw `Wizard step is currently ${currentStepId}, but no static ip info is defined`;
      }
      //if static ip view change wasn't persisted, moving back should set the wizard steps according to the persisted view
      const newStepIds = getWizardStepIds(staticIpInfo.view);
      if (!isEqual(newStepIds, wizardStepIds)) {
        setWizardStepIds(newStepIds);
      }
    };

    return {
      moveBack(): void {
        const currentStepIdx = wizardStepIds.indexOf(currentStepId);
        let nextStepId = wizardStepIds[currentStepIdx - 1];
        if (isStaticIpStep(currentStepId)) {
          onBackFromStaticIp(nextStepId);
        } else if (nextStepId === 'static-ip-host-configurations') {
          //when moving back to static ip form view, it should go to network wide configurations
          nextStepId = 'static-ip-network-wide-configurations';
        }
        setCurrentStepId(nextStepId);
      },
      moveNext(): void {
        const currentStepIdx = wizardStepIds.indexOf(currentStepId);
        setCurrentStepId(wizardStepIds[currentStepIdx + 1]);
      },
      onUpdateStaticIpView(view: StaticIpView): void {
        setWizardStepIds(getWizardStepIds(view));
        if (view === StaticIpView.YAML) {
          setCurrentStepId('static-ip-yaml-view');
        } else {
          setCurrentStepId('static-ip-network-wide-configurations');
        }
      },
      onUpdateHostNetworkConfigType(type: HostsNetworkConfigurationType): void {
        if (type === HostsNetworkConfigurationType.STATIC) {
          setWizardStepIds(getWizardStepIds(StaticIpView.FORM));
        } else {
          setWizardStepIds(getWizardStepIds());
        }
      },
      wizardStepIds,
      currentStepId,
      setCurrentStepId,
    };
  }, [wizardStepIds, currentStepId, infraEnv]);
  if (!contextValue) {
    return null;
  }
  return (
    <>
      <ClusterWizardContext.Provider value={contextValue}>{children}</ClusterWizardContext.Provider>
    </>
  );
};

export default ClusterWizardContextProvider;