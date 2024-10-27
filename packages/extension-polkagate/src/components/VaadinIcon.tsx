// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import React, { useEffect } from 'react';

interface VaadinIconProps extends React.HTMLAttributes<HTMLElement> {
  icon: string;
  spin?: boolean;
  float?: boolean;
}

const VaadinIcon: React.FC<VaadinIconProps> = ({ float = false, icon, spin = false, style, ...props }) => {
  useEffect(() => {
    // Check if the animations are already injected
    if (!document.getElementById('vaadin-icon-animation-keyframes')) {
      const styleSheet = document.createElement('style');

      styleSheet.id = 'vaadin-icon-animation-keyframes';
      styleSheet.innerText = `
        @keyframes vaadinSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  // Combine inline styles with the animations if enabled
  const combinedStyles: React.CSSProperties = {
    animation: `${spin ? 'vaadinSpin 3s linear infinite' : ''} ${float ? 'float 2s ease-in-out infinite' : ''}`,
    ...style
  };

//@ts-ignore
return <vaadin-icon icon={icon} style={combinedStyles} {...props} />;
};

export default VaadinIcon;
