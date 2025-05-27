// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import useUpdateAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useUpdateAccountSelectedChain';

import { ChainLogo, FadeOnScroll, GlowCheck, GradientButton, SearchField } from '../../components';
import { useGenesisHashOptions, useSelectedAccount, useSelectedChains, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import { DraggableModal } from './DraggableModal';

interface ChooseAccountMenuProps {
  open: boolean;
  handleClose: () => void;
}

export default function ChainListModal ({ handleClose, open }: ChooseAccountMenuProps): React.ReactElement {
  const { t } = useTranslation();
  const selectedChains = useSelectedChains();
  const allChains = useGenesisHashOptions(false);
  const selectedAccount = useSelectedAccount();
  const selectedAccountChain = useAccountSelectedChain(selectedAccount?.address);
  const refContainer = useRef<HTMLDivElement>(null);

  const [maybeSelected, setMayBeSelected] = useState<string>();
  const [appliedGenesis, setAppliedGenesis] = useState<string>();
  const [searchKeyword, setSearchKeyword] = useState<string>();

  const _handleClose = useCallback(() => {
    setMayBeSelected(undefined);
    setSearchKeyword(undefined);
    setAppliedGenesis(undefined);
    handleClose();
  }, [handleClose]);

  useUpdateAccountSelectedChain(selectedAccount?.address, appliedGenesis, true, _handleClose);

  const onApply = useCallback(() => {
    if (!maybeSelected || !selectedAccount?.address) {
      return _handleClose();
    }

    selectedAccount && setAppliedGenesis(maybeSelected);
  }, [maybeSelected, selectedAccount, _handleClose]);

  const onSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const selectedChainsToList = useMemo(() => {
    if (!selectedChains) {
      return [];
    }

    return allChains.filter(({ value }) => selectedChains.includes(String(value)));
  }, [allChains, selectedChains]);

  const chainsToList = useMemo(() => {
    if (!selectedChainsToList) {
      return [];
    }

    if (!searchKeyword) {
      return selectedChainsToList;
    }

    const keyword = searchKeyword.trim().toLowerCase();

    return selectedChainsToList.filter(({ text }) => text.toLowerCase().includes(keyword));
  }, [searchKeyword, selectedChainsToList]);

  return (
    <DraggableModal
      onClose={_handleClose}
      open={open}
      style={{ backgroundColor: '#1B133C', minHeight: '600px', padding: ' 20px 10px 10px' }}
      title={t('Select chain')}
    >
      <Container disableGutters sx={{ display: 'block', height: '505px', mt: '10px', pb: '50px', position: 'relative', width: 'initial', zIndex: 1 }}>
        <SearchField
          onInputChange={onSearch}
          placeholder='🔍 Search chains'
        />
        <VelvetBox style={{ margin: '5px 0 15px' }}>
          <Stack ref={refContainer} style={{ maxHeight: '388px', minHeight: '88px', overflow: 'hidden', overflowY: 'auto', position: 'relative' }}>
            {chainsToList.map(({ text, value }, index) => (
              <Grid
                alignItems='center' container item justifyContent='space-between' key={value} onClick={() => setMayBeSelected(value)} sx={{
                  '&:hover': { bgcolor: '#6743944D' },
                  borderRadius: '12px',
                  lineHeight: '55px',
                  px: '7px'
                }}
              >
                <Stack alignItems='center' direction='row'>
                  <ChainLogo genesisHash={value as string} size={24} />
                  <Typography color='#EAEBF1' ml='8px' variant='B-1'>
                    {text}
                  </Typography>
                </Stack>
                <GlowCheck
                  show={maybeSelected === value || (!maybeSelected && selectedAccountChain === value)}
                  size='24px'
                  timeout={100}
                />
              </Grid>
            ))}
          </Stack>
          <FadeOnScroll containerRef={refContainer} height='15px' ratio={0.3} />
        </VelvetBox>
        <GradientButton
          contentPlacement='center'
          disabled={!maybeSelected}
          onClick={onApply}
          style={{
            bottom: '10px',
            height: '44px',
            margin: '0 1%',
            position: 'absolute',
            width: '98%'
          }}
          text={t('Apply')}
        />
      </Container>
    </DraggableModal>
  );
}
