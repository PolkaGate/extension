// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';
import type { Inputs } from '../types';

import { ExpandMore } from '@mui/icons-material';
import { Box, ClickAwayListener, Grid, Popover, Stack, styled, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useUpdateAccountSelectedAsset from '@polkadot/extension-polkagate/src/hooks/useUpdateAccountSelectedAsset';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { noop } from '@polkadot/util';

import { AssetLogo } from '../../../components';
import { useAccountAssets, useChainInfo, useIsHovered, useTranslation } from '../../../hooks';

const DropContentContainer = styled(Grid, { shouldForwardProp: (prop) => prop !== 'preferredWidth' })(({ preferredWidth }: { preferredWidth: number | undefined }) => ({
  background: '#05091C',
  border: '4px solid',
  borderColor: '#1B133C',
  borderRadius: '12px',
  columnGap: '5px',
  flexWrap: 'nowrap',
  margin: 'auto',
  marginTop: '4px',
  maxHeight: '400px',
  minWidth: '197px',
  overflow: 'hidden',
  padding: '6px',
  rowGap: '4px',
  transition: 'all 250ms ease-out',
  width: `${preferredWidth}px`
}));

function Row ({ assetId, genesisHash, setSelectedAsset, token }: { assetId: string, token: string, genesisHash: string, setSelectedAsset: React.Dispatch<React.SetStateAction<string | undefined>> }): React.ReactElement {
  const refContainer = useRef(null);
  const hovered = useIsHovered(refContainer);

  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  const onClick = useCallback(() => {
    setSelectedAsset(assetId);
  }, [assetId, setSelectedAsset]);

  return (
    <Stack
      alignItems='center' columnGap='5px' direction='row' justifyContent='space-between' onClick={onClick} ref={refContainer}
      sx={{ backgroundColor: hovered ? '#6743944D' : 'transparent', borderRadius: '8px', cursor: 'pointer', height: '40px', px: '5px', width: '100%' }}
    >
      <AssetLogo assetSize='28px' genesisHash={genesisHash} logo={logoInfo?.logo} />
      <Typography color={hovered ? '#FF4FB9' : '#EAEBF1'} sx={{ textWrap: 'nowrap', transition: 'all 250ms ease-out' }} variant='B-2'>
        {token}
      </Typography>
    </Stack>
  );
}

interface DropContentProps {
  assets: FetchedBalance[]
  containerRef: React.RefObject<HTMLDivElement | null>;
  contentDropWidth?: number | undefined;
  open: boolean;
  setSelectedAsset: React.Dispatch<React.SetStateAction<string | undefined>>
}

function CustomizedDropDown ({ assets, containerRef, contentDropWidth, open, setSelectedAsset }: DropContentProps) {
  const id = open ? 'dropContent-popover' : undefined;
  const anchorEl = open ? containerRef.current : null;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'top'
      }}
      id={id}
      open={open}
      slotProps={{
        paper: {
          sx: {
            background: 'none',
            backgroundImage: 'none'
          }
        }
      }}
      transformOrigin={{
        horizontal: 'left',
        vertical: 'top'
      }}
    >
      <DropContentContainer container direction='column' item preferredWidth={contentDropWidth}>
        {assets.map(({ assetId, genesisHash, token }, index) => {
          return (
            <Row
              assetId={String(assetId)}
              genesisHash={genesisHash}
              key={index}
              setSelectedAsset={setSelectedAsset}
              token={token}
            />
          );
        })}
      </DropContentContainer>
    </Popover>
  );
}

interface Props {
  address: string | undefined;
  assetId: string | undefined;
  genesisHash: string | undefined;
  inputs: Inputs | undefined;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>
}

export default function SelectToken ({ address, assetId, genesisHash, inputs, setInputs }: Props): React.ReactElement {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const accountAssets = useAccountAssets(address);
  const { chainName } = useChainInfo(genesisHash, true);

  const [openTokenList, setOpenTokenList] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<string>();

  useUpdateAccountSelectedAsset(address, genesisHash, selectedAsset, true);

  const accountAssetsOnCurrentChain = useMemo(() => accountAssets?.filter((asset) => asset.genesisHash === genesisHash), [accountAssets, genesisHash]);

  useEffect(() => {
    if (!chainName) {
      return;
    }

    const asset = accountAssetsOnCurrentChain?.find((asset) => String(asset.assetId) === String(assetId));

    if (asset) {
      const { decimal, token } = asset;

      token && setInputs((prev) => ({
        ...(prev || {}),
        decimal,
        token
      }));
    }
  }, [accountAssetsOnCurrentChain, assetId, chainName, setInputs]);

  const logoInfo = useMemo(() => inputs?.token && getLogo2(genesisHash, inputs.token), [genesisHash, inputs?.token]);

  const onToggleTokenSelection = useCallback(() => {
    setOpenTokenList(!openTokenList);
  }, [openTokenList]);

  const handleClickAway = useCallback(() => {
    setOpenTokenList(false);
  }, []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Stack alignItems='end' direction='row' justifyContent='space-between' mt='15px' onClick={accountAssetsOnCurrentChain?.length ? onToggleTokenSelection : noop} ref={containerRef} sx={{ cursor: accountAssetsOnCurrentChain?.length ? 'pointer' : 'default' }} width='150px'>
          <Stack alignItems='end' direction='row' justifyContent='start'>
            {logoInfo &&
              <AssetLogo assetSize='36px' genesisHash={genesisHash} logo={logoInfo?.logo} />
            }
            <Stack alignItems='center' direction='column' justifyContent='start' ml='7px' width='80%'>
              <Typography color='#AA83DC' sx={{ textAlign: 'left', width: '100%' }} variant='B-4'>
                {t('Token')}
              </Typography>
              <Typography sx={{ textAlign: 'left', width: '100%' }} variant='B-2'>
                {inputs?.token ?? 'Unit'}
              </Typography>
            </Stack>
          </Stack>
          {!!accountAssetsOnCurrentChain?.length &&
            <Box sx={{ '&:hover': { background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', cursor: 'pointer' }, alignItems: 'center', border: '2px solid #1B133C', borderRadius: '10px', transition: 'all 250ms ease-out', display: 'flex', height: '40px', justifyContent: 'center', width: '40px' }}>
              <ExpandMore sx={{ color: '#AA83DC', fontSize: '20px' }} />
            </Box>}
        </Stack>
      </ClickAwayListener>
      {!!accountAssetsOnCurrentChain?.length && openTokenList &&
        <CustomizedDropDown
          assets={accountAssetsOnCurrentChain}
          containerRef={containerRef}
          open={openTokenList}
          setSelectedAsset={setSelectedAsset}
        />
      }
    </>
  );
}
