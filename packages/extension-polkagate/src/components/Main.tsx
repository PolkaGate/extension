// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Main ({ children, className }: Props): React.ReactElement<Props> {
  return (
    <main className={className}>
      {children}
    </main>
  );
}

// export default styled(Main)(({ theme }: ThemeProps) => `
//   display: flex;
//   flex-direction: column;
//   height: calc(100vh - 2px);
//   background: ${theme.background};
//   color: ${theme.textColor};
//   font-size: ${theme.fontSize};
//   line-height: ${theme.lineHeight};
//   border: 1px solid ${theme.inputBorderColor};

//   * {
//     font-family: ${theme.fontFamily};
//   }

//   > * {
//     padding-left: 20px;
//     padding-right: 20px;
//   }
// `);
