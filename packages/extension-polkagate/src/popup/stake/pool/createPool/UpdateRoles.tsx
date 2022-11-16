// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Slide, Typography, useTheme } from '@mui/material';
import { Chain } from '@substrate/connect';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { AccountContext, InputWithLabelAndIdenticon, PButton } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import getAllAddressess from '../../../../util/getAllAddresses';

interface Props {
  address: string;
  chain?: Chain;
  formatted?: string;
  nominatorId: string;
  stateTogglerId: string;
  setNominatorId: React.Dispatch<React.SetStateAction<string>>;
  setStateTogglerId: React.Dispatch<React.SetStateAction<string>>;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function UpdateRoles({ address, chain, formatted, nominatorId, setNominatorId, setShow, setStateTogglerId, show, stateTogglerId }: Props): React.ReactElement {
  const containerRef = useRef(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const { accounts, hierarchy } = useContext(AccountContext);
  const [updateBtnDisable, setUpdateBtnDisable] = useState<boolean>(false);

  const allAddresses = getAllAddressess(hierarchy, true, true, chain?.ss58Format, address);

  const closeMenu = useCallback(() => {
    if (!formatted) {
      return;
    }

    !nominatorId && setNominatorId(formatted);
    !stateTogglerId && setStateTogglerId(formatted);
    setShow(!show);
  }, [formatted, nominatorId, setNominatorId, setShow, setStateTogglerId, show, stateTogglerId]);

  const onUpdateRoles = useCallback(() => {
    nominatorId && stateTogglerId && setShow(!show);
  }, [nominatorId, setShow, show, stateTogglerId]);

  useEffect(() => {
    setUpdateBtnDisable(!(stateTogglerId && nominatorId));
  }, [nominatorId, stateTogglerId]);

  const movingParts = (
    <Grid
      alignItems='flex-start'
      bgcolor='background.default'
      container
      display='block'
      item
      mt='46px'
      px='10px'
      sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }}
      width='100%'
    >
      <Grid
        container
        justifyContent='center'
        my='20px'
        mb='0'
      >
        <Typography
          fontSize='20px'
          fontWeight={400}
        >
          {t<string>('Update Roles')}
        </Typography>
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px', m: '30px auto 5px', width: '80%' }} />
      </Grid>
      <InputWithLabelAndIdenticon
        address={nominatorId}
        allAddresses={allAddresses}
        chain={chain}
        label={'Nominator'}
        setAddress={setNominatorId}
        showIdenticon
        style={{
          m: '15px auto 0',
          width: '92%'
        }}
      />
      <InputWithLabelAndIdenticon
        address={stateTogglerId}
        allAddresses={allAddresses}
        chain={chain}
        label={'State toggler'}
        setAddress={setStateTogglerId}
        showIdenticon
        style={{
          m: '15px auto 0',
          width: '92%'
        }}
      />
      <PButton
        _ml={3}
        _onClick={onUpdateRoles}
        disabled={updateBtnDisable}
        text={t<string>('Update')}
      />
      <IconButton
        onClick={closeMenu}
        sx={{
          left: '15px',
          p: 0,
          position: 'absolute',
          top: '65px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <Grid
      bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'}
      container
      height='100%'
      justifyContent='end'
      ref={containerRef}
      sx={[{
        '&::-webkit-scrollbar': {
          display: 'none',
          width: 0
        },
        mixBlendMode: 'normal',
        overflowY: 'scroll',
        position: 'fixed',
        scrollbarWidth: 'none',
        top: 0
      }]}
      width='357px'
      zIndex={10}
    >
      <Slide
        container={containerRef.current}
        direction='up'
        in={show}
        mountOnEnter
        unmountOnExit
      >
        {movingParts}
      </Slide>
    </Grid>
  );
}