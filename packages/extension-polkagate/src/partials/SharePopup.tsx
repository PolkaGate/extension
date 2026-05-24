// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
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
  RightItem?: React.ReactNode;

}

function SharePopup({ RightItem, children, modalProps, modalStyle, onClose, open, popupProps, title }: Props): React.ReactElement {
  const isExtension = useIsExtensionPopup();

  return (
    <>  {
      isExtension
        ? (
          <ExtensionPopup
            RightItem={RightItem}
            handleClose={onClose}
            openMenu={open}
            title={title}
            {...popupProps}
          >
            {children}
          </ExtensionPopup>)
        : (
          <DraggableModal
            RightItem={RightItem}
            onClose={onClose}
            open={open}
            style={{ minHeight: '400px', padding: '20px', ...modalStyle }}
            title={title}
            {...modalProps}
          >
            {children}
          </DraggableModal>)
    }
    </>
  );
}

export default React.memo(SharePopup);
