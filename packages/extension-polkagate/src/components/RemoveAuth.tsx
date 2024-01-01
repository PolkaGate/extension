// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export default function RemoveAuth(): React.ReactElement {
  return (
    <FontAwesomeIcon
      icon={faTrash}
      size='lg'
      style={{
        cursor: 'pointer'
      }}
    />
  );
}
