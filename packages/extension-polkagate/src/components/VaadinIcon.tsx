// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import React from 'react';
import '@vaadin/icons';

interface VaadinIconProps extends React.HTMLAttributes<HTMLElement> {
  icon: string;
}

const VaadinIcon: React.FC<VaadinIconProps> = ({ icon, ...props }) => {
  return <vaadin-icon icon={icon} {...props} />;
};

export default VaadinIcon;
