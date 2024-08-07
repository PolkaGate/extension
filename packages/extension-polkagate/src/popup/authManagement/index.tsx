// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AuthUrlInfo } from '@polkadot/extension-base/background/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { ActionContext, VaadinIcon } from '../../components';
import { DraggableModal } from '../../fullscreen/governance/components/DraggableModal';
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

const ExtensionMode = ({ dappInfo, onBackClick, setDappInfo }: ExtensionModeType) => {
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
};

const FSMode = ({ backToAccountFS, dappInfo, onBackClick, open, setDappInfo }: FSModeType) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <DraggableModal onClose={backToAccountFS} open={!!open}>
      <Grid container item>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid alignItems='flex-start' container justifyContent='flex-start' sx={{ width: 'fit-content' }}>
            <Grid item>
              <VaadinIcon icon='vaadin:lines-list' style={{ color: `${theme.palette.text.primary}`, height: '25px', width: '25px' }} />
            </Grid>
            <Grid item sx={{ pl: '10px' }}>
              <Typography fontSize='22px' fontWeight={700}>
                {t('Manage Website Access')}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <CloseIcon onClick={backToAccountFS} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        {dappInfo
          ? <ManageAuthorizedAccounts info={dappInfo} onBackClick={onBackClick} />
          : <ManageAuthorizedDapps backToAccountFS={backToAccountFS} setDappInfo={setDappInfo} />
        }
      </Grid>
    </DraggableModal>
  );
};

export default function AuthManagement ({ open, setDisplayPopup }: Props): React.ReactElement {
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
      {
        isExtensionMode
          ? <ExtensionMode dappInfo={dappInfo} onBackClick={onBackClick} setDappInfo={setDappInfo} />
          : <FSMode backToAccountFS={backToAccountFS} dappInfo={dappInfo} onBackClick={onBackClick} open={!!open} setDappInfo={setDappInfo} />
      }
    </>
  );
}
