// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AuthUrlInfo } from '@polkadot/extension-base/background/types';

import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { ActionContext } from '../../components';
import { DraggableModal } from '../../fullscreen/governance/components/DraggableModal';
import SimpleModalTitle from '../../fullscreen/partials/SimpleModalTitle';
import { useIsExtensionPopup, useTranslation } from '../../hooks';
import { getAuthList } from '../../messaging';
import { HeaderBrand } from '../../partials';
import ManageAuthorizedAccounts from './ManageAuthorizedAccounts';
import ManageAuthorizedDapps from './ManageAuthorizedDapps';

interface Props {
  open?: boolean;
  setDisplayPopup?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ExtensionModeType {
  onBackClick: () => void;
  dappInfo: AuthUrlInfo | undefined;
  setDappInfo: React.Dispatch<React.SetStateAction<AuthUrlInfo | undefined>>;
}

interface FSModeType {
  backToAccountFS: () => void;
  onBackClick: () => void;
  dappInfo: AuthUrlInfo | undefined;
  setDappInfo: React.Dispatch<React.SetStateAction<AuthUrlInfo | undefined>>;
  open: boolean;
}

const ExtensionMode = React.memo(function ExtensionMode({ dappInfo, onBackClick, setDappInfo }: ExtensionModeType) {
  const { t } = useTranslation();

  return (
    <>
      <HeaderBrand
        onBackClick={onBackClick}
        showBackArrow
        text={dappInfo ? t('Connected Accounts') : t('Manage Website Access')}
      />
      {dappInfo
        ? <ManageAuthorizedAccounts info={dappInfo} onBackClick={onBackClick} />
        : <ManageAuthorizedDapps setDappInfo={setDappInfo} />
      }
    </>
  );
});

const FSMode = React.memo(function FSMode({ backToAccountFS, dappInfo, onBackClick, open, setDappInfo }: FSModeType) {
  const { t } = useTranslation();

  return (
    <DraggableModal onClose={backToAccountFS} open={!!open}>
      <Grid container item>
        <SimpleModalTitle
          icon='vaadin:lines-list'
          onClose={backToAccountFS}
          title={t('Manage Website Access')}
        />
        {dappInfo
          ? <ManageAuthorizedAccounts info={dappInfo} onBackClick={onBackClick} />
          : <ManageAuthorizedDapps backToAccountFS={backToAccountFS} setDappInfo={setDappInfo} />
        }
      </Grid>
    </DraggableModal>
  );
});

function AuthManagement({ open, setDisplayPopup }: Props): React.ReactElement {
  const onAction = useContext(ActionContext);
  const isExtensionMode = useIsExtensionPopup();
  const { id: dappId } = useParams<{ id: string | undefined }>();

  const [dappInfo, setDappInfo] = useState<AuthUrlInfo | undefined>();

  useEffect(() => {
    if (dappId) {
      getAuthList()
        .then(({ list: authList }) => {
          if (dappId in authList) {
            setDappInfo(authList[dappId]);
          }
        })
        .catch(console.error);
    }
  }, [dappId]);

  const onBackClick = useCallback(() => {
    dappInfo && !dappId
      ? setDappInfo(undefined)
      : onAction('/');
  }, [dappInfo, dappId, onAction]);

  const backToAccountFS = useCallback(() => setDisplayPopup?.(false), [setDisplayPopup]);

  return (
    <>
      {isExtensionMode
        ? <ExtensionMode dappInfo={dappInfo} onBackClick={onBackClick} setDappInfo={setDappInfo} />
        : <FSMode backToAccountFS={backToAccountFS} dappInfo={dappInfo} onBackClick={onBackClick} open={!!open} setDappInfo={setDappInfo} />
      }
    </>
  );
}

export default React.memo(AuthManagement);
