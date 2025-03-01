// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { ValidatorInfo } from '../../../../../util/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';

import { SlidePopUp } from '../../../../../components';
import { useInfo, useIsExtensionPopup, useTranslation } from '../../../../../hooks';
import ValidatorsTable from '../../../partial/ValidatorsTable';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  selectedValidators: ValidatorInfo[];
  showSelectedValidators: boolean;
  setShowSelectedValidators: React.Dispatch<React.SetStateAction<boolean>>;
  staked?: BN;
}

const MODAL_HEIGHT = 650;

export default function ShowValidators({ address, api, chain, selectedValidators, setShowSelectedValidators, showSelectedValidators, staked }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { decimal, token } = useInfo(address);
  const isExtensionPopup = useIsExtensionPopup();

  const tableHeight = useMemo(() => (selectedValidators.length > 7 ? window.innerHeight - 180 : selectedValidators.length * 60), [selectedValidators.length]);

  const onClose = useCallback(() => setShowSelectedValidators(false), [setShowSelectedValidators]);

  const page = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item ml={isExtensionPopup ? '-15px' : 0} mt={isExtensionPopup ? '46px' : 0} sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' mb='20px' mt={isExtensionPopup ? '40px' : '20px'}>
        <Typography fontSize='20px' fontWeight={400} sx={{ textAlign: 'center', width: '100%' }}>
          {t('Selected Validators ({{length}})', { replace: { length: selectedValidators.length } })}
        </Typography>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
      </Grid>
      <ValidatorsTable
        api={api}
        chain={chain}
        decimal={decimal}
        height={isExtensionPopup ? tableHeight : MODAL_HEIGHT - 50}
        staked={staked}
        style={{ m: '15px auto', width: '92%' }}
        token={token}
        validatorsToList={selectedValidators}
      />
      <IconButton
        onClick={onClose}
        sx={{
          left: isExtensionPopup ? '15px' : undefined,
          p: 0,
          position: 'absolute',
          right: isExtensionPopup ? undefined : '30px',
          top: isExtensionPopup ? '65px' : '35px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <>
      {isExtensionPopup
        ? <SlidePopUp show={showSelectedValidators}>
          {page}
        </SlidePopUp>
        : <DraggableModal minHeight={MODAL_HEIGHT} onClose={onClose} open={showSelectedValidators}>
          {page}
        </DraggableModal>
      }
    </>
  );
}
