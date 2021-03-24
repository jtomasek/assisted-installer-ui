import React from 'react';
import { Button, ButtonVariant } from '@patternfly/react-core';
import EditHostModal from './EditHostModal';
import { Host, Inventory, Cluster } from '../../api/types';
import { getHostname } from './utils';
import { DASH } from '../constants';

type HostnameProps = {
  host: Host;
  cluster: Cluster;
  className?: string;
  onToggle?: (isOpen: boolean) => void;
  // Provide either inventory or title
  inventory?: Inventory;
  title?: string;
  testId?: string;
};

const Hostname: React.FC<HostnameProps> = ({
  host,
  inventory = {},
  cluster,
  title,
  className,
  onToggle,
  testId = 'host-name',
}) => {
  const [isOpen, _setOpen] = React.useState(false);

  const setOpen = (isOpen: boolean) => {
    onToggle && onToggle(isOpen);
    _setOpen(isOpen);
  };

  const hostname = title || getHostname(host, inventory) || DASH;
  const isHostnameChangeRequested = !title && host.requestedHostname !== inventory.hostname;

  return (
    <>
      <Button
        data-testid={testId}
        variant={ButtonVariant.link}
        isInline
        onClick={() => setOpen(true)}
        className={className}
      >
        {hostname}
        {isHostnameChangeRequested && ' *'}
      </Button>
      <EditHostModal
        host={host}
        inventory={inventory}
        cluster={cluster}
        onClose={() => setOpen(false)}
        isOpen={isOpen}
        onSave={() => setOpen(false)}
      />
    </>
  );
};
export default Hostname;
