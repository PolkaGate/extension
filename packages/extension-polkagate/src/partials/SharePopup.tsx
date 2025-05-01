// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupProps } from '../components/ExtensionPopup';

import React, { type JSXElementConstructor, type ReactElement } from 'react';

import { ExtensionPopup } from '../components';
import { DraggableModal, type DraggableModalProps } from '../fullscreen/components/DraggableModal';
import { useIsExtensionPopup } from '../hooks';

interface Props {
  children: ReactElement<unknown, string | JSXElementConstructor<unknown>>;
  modalStyle?: React.CSSProperties;
  open: boolean;
  onClose: () => void;
  popupProps?: Partial<ExtensionPopupProps>;
  modalProps?: Partial<DraggableModalProps>;
  title?: string | undefined;
}

function SharePopup ({ children, modalProps, modalStyle, onClose, open, popupProps, title }: Props): React.ReactElement {
  const isExtension = useIsExtensionPopup();

  return (
    <>  {
      isExtension
        ? <ExtensionPopup
          handleClose={onClose}
          { ...popupProps}
          openMenu={open}
          title={title}
        >
          {children}
        </ExtensionPopup>
        : <DraggableModal
          onClose={onClose}
          open={open}
          {...modalProps}
          style={{ minHeight: '400px', padding: '20px', ...modalStyle }}
          title={title}
        >
          {children}
        </DraggableModal>
    }
    </>
  );
}

export default React.memo(SharePopup);
