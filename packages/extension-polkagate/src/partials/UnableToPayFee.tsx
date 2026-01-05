// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { keyframes, styled } from '@mui/system';
import { Warning2 } from 'iconsax-react';
import React from 'react';

import { MyTooltip } from '../components';

export const BEAT_ANIMATION = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
`;

const BeatWarning = styled(Warning2)`
  display: inline-block;
  transform-origin: center;
  animation: ${BEAT_ANIMATION} 0.8s infinite;
`;

function UnableToPayFee({ warningText }: { warningText: string | undefined }) {
  return (
    <MyTooltip
      content={warningText}
    >
      <BeatWarning color='#FFCE4F' size='18' style={{ animation: `${BEAT_ANIMATION} 0.8s infinite`, display: 'inline-block' }} variant='Bold' />
    </MyTooltip>
  );
}

export default UnableToPayFee;
