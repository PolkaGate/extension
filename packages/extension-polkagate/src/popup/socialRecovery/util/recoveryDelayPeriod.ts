// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export default function recoveryDelayPeriod(blocks: number, dateDetailLength): string {
  const units = ['Year', 'Week', 'Day', 'Hour', 'Minute', 'Second'];
  const secondsPerUnit = [31536000, 604800, 86400, 3600, 60, 1];

  const parts = units.reduce((acc, unit, index) => {
    if (acc.length >= dateDetailLength ?? 2) {
      return acc;
    }

    const count = Math.floor(blocks * 6 / secondsPerUnit[index]);

    blocks -= count * secondsPerUnit[index] / 6;

    if (count > 0) {
      acc.push(`${count} ${unit}${count !== 1 ? 's' : ''}`);
    }

    return acc;
  }, []);

  return parts.length > 0 ? parts.join(', ') : '0 Seconds';
}
