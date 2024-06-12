// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import type { Chain } from '@polkadot/extension-chains/types';


import { AccountContext, AddressInput, PButton } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import getAllAddresses from '../../../../util/getAllAddresses';
import { DraggableModal } from '../../../governance/components/DraggableModal';

interface Props {
  address: string;
  chain?: Chain;
  formatted?: string;
  nominatorId: string | undefined;
  bouncerId: string | undefined;
  setNominatorId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setBouncerId: React.Dispatch<React.SetStateAction<string | undefined>>;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UpdateRoles({ address, bouncerId, chain, nominatorId, setBouncerId, setNominatorId, setShow, show }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { hierarchy } = useContext(AccountContext);
  const [updateBtnDisable, setUpdateBtnDisable] = useState<boolean>(false);
  const [newNominatorId, setNewNominatorId] = useState<string | null | undefined>(nominatorId);
  const [newBouncerId, setNewBouncerId] = useState<string | null | undefined>(bouncerId);

  const allAddresses = getAllAddresses(hierarchy, true, true, chain?.ss58Format, address);

  const closeMenu = useCallback(() => {
    setShow(!show);
  }, [setShow, show]);

  const onUpdateRoles = useCallback(() => {
    if (!newNominatorId || !newBouncerId) {
      return;
    }

    setNominatorId(newNominatorId);
    setBouncerId(newBouncerId);
    setShow(!show);
  }, [newNominatorId, newBouncerId, setNominatorId, setShow, setBouncerId, show]);

  useEffect(() => {
    setUpdateBtnDisable(!newNominatorId || !newBouncerId || (newBouncerId === bouncerId && newNominatorId === nominatorId));
  }, [newNominatorId, newBouncerId, nominatorId, bouncerId]);

  return (
    <DraggableModal onClose={closeMenu} open>
      <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item px='10px' sx={{ borderRadius: '10px 10px 0px 0px' }} width='100%'>
        <Grid container justifyContent='center' mb='0' my='25px'>
          <Typography fontSize='20px' fontWeight={400}>
            {t('Update Roles')}
          </Typography>
          <Divider sx={{ bgcolor: 'secondary.light', height: '1px', mt: '15px', width: '100%' }} />
        </Grid>
        <AddressInput
          address={newNominatorId}
          allAddresses={allAddresses}
          chain={chain as any}
          label={t('Nominator')}
          setAddress={setNewNominatorId}
          showIdenticon
          style={{
            m: '15px auto 0',
            width: '92%'
          }}
        />
        <AddressInput
          address={newBouncerId}
          allAddresses={allAddresses}
          chain={chain as any}
          label={t('Bouncer')}
          setAddress={setNewBouncerId}
          showIdenticon
          style={{
            m: '15px auto 0',
            width: '92%'
          }}
        />
        <Grid container item>
          <PButton
            _ml={0}
            _onClick={onUpdateRoles}
            _width={84}
            disabled={updateBtnDisable}
            text={t('Update')}
          />
        </Grid>
        <IconButton
          onClick={closeMenu}
          sx={{
            p: 0,
            position: 'absolute',
            right: '30px',
            top: '35px'
          }}
        >
          <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
        </IconButton>
      </Grid>
    </DraggableModal>
  );
}
