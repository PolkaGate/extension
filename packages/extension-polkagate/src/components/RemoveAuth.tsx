// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

interface Props {
  color?: string;
}

export default function RemoveAuth({ color }: Props): React.ReactElement {
  return (
    <FontAwesomeIcon
      icon={faTrash}
      size='lg'
      style={{
        color,
        cursor: 'pointer'
      }}
    />
  );
}
