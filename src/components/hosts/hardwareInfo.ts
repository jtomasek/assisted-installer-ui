import Humanize from 'humanize-plus';
import { Disk, Inventory } from '../../api/types';
import { DASH } from '../constants';
import { HumanizedSortable } from '../ui/table/utils';

export type HostRowHardwareInfo = {
  serialNumber: string;
  cores: HumanizedSortable;
  cpuSpeed: string;
  memory: HumanizedSortable;
  disk: HumanizedSortable;
};

export type SimpleHardwareInfo = {
  cores: number;
  memory: number;
  disks: number;
};

export const getMemoryCapacity = (inventory: Inventory): number =>
  inventory.memory?.physicalBytes || 0;
export const getDiskCapacity = (inventory: Inventory): number =>
  inventory.disks?.reduce((diskSize: number, disk: Disk) => diskSize + (disk.sizeBytes || 0), 0) ||
  0;

export const getHumanizedCpuClockSpeed = (inventory: Inventory) =>
  Humanize.formatNumber(inventory.cpu?.frequency || 0);

export const getSimpleHardwareInfo = (inventory: Inventory): SimpleHardwareInfo => ({
  cores: inventory.cpu?.count || 0,
  memory: getMemoryCapacity(inventory),
  disks: getDiskCapacity(inventory),
});

const EMPTY = {
  title: DASH,
  sortableValue: 0,
};

export const getHostRowHardwareInfo = (inventory: Inventory): HostRowHardwareInfo => {
  let cores = EMPTY;
  let memory = EMPTY;
  let disk = EMPTY;
  let cpuSpeed = DASH;

  if (inventory.cpu?.count) {
    const hyperThreading = inventory.cpu?.flags?.includes('ht') ? ' (hyper-threaded)' : '';
    cpuSpeed = `${inventory.cpu?.count} cores${hyperThreading} at ${getHumanizedCpuClockSpeed(
      inventory,
    )} MHz`;
    cores = {
      title: inventory.cpu?.count.toString(),
      sortableValue: inventory.cpu?.count,
    };
  }

  const memCapacity = getMemoryCapacity(inventory);
  if (memCapacity) {
    memory = {
      title: Humanize.fileSize(memCapacity),
      sortableValue: memCapacity,
    };
  }

  const disksCapacity = getDiskCapacity(inventory);
  if (disksCapacity) {
    disk = {
      title: Humanize.fileSize(disksCapacity),
      sortableValue: disksCapacity,
    };
  }

  return {
    serialNumber: inventory.systemVendor?.serialNumber || DASH,
    cores,
    cpuSpeed,
    memory,
    disk,
  };
};
