// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AuthUrlInfo } from '@polkadot/extension-base/background/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { ActionContext, VaadinIcon } from '../../components';
import { DraggableModal } from '../../fullscreen/governance/components/DraggableModal';
import { useIsExtensionPopup, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import ManageAuthorizedAccounts from './ManageAuthorizedAccounts';
import ManageAuthorizedDapps from './ManageAuthorizedDapps';

interface Props {
  open?: boolean;
  setDisplayPopup?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AuthManagement ({ open, setDisplayPopup }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const isExtensionMode = useIsExtensionPopup();

  const [dappInfo, setDappInfo] = useState<AuthUrlInfo | undefined>();

  const onBackClick = useCallback(() => {
    dappInfo
      ? setDappInfo(undefined)
      : onAction('/');
  }, [dappInfo, onAction]);

  const backToAccount = useCallback(() => setDisplayPopup?.(false), [setDisplayPopup]);

  const ExtensionMode = () => (
    <>
      <HeaderBrand
        onBackClick={onBackClick}
        showBackArrow
        text={dappInfo ? t('Connected Accounts') : t('Manage Website Access')}
      />
      {dappInfo
        ? <ManageAuthorizedAccounts info={dappInfo} setDappInfo={setDappInfo} />
        : <ManageAuthorizedDapps setDappInfo={setDappInfo} />
      }
    </>
  );

  const FSMode = () => (
    <DraggableModal onClose={backToAccount} open={!!open}>
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
            <CloseIcon onClick={backToAccount} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        {dappInfo
          ? <ManageAuthorizedAccounts info={dappInfo} setDappInfo={setDappInfo} />
          : <ManageAuthorizedDapps setDappInfo={setDappInfo} />
        }
      </Grid>
    </DraggableModal>
  );

  return (
    <>
      {
        isExtensionMode
          ? <ExtensionMode />
          : <FSMode />
      }
    </>
  );
}
