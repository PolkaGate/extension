// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '@polkadot/extension-polkagate/src/util/types';

import { Grid, Popover, Stack, styled, Typography } from '@mui/material';
import React, { type CSSProperties, useCallback, useMemo, useRef } from 'react';

import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';

import { AssetLogo } from '../../../components';
import { useIsHovered } from '../../../hooks';

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
  assets: Partial<FetchedBalance>[]
  containerRef: React.RefObject<HTMLDivElement | null>;
  contentDropWidth?: number | undefined;
  open: boolean;
  setSelectedAsset: React.Dispatch<React.SetStateAction<string | undefined>>;
  style?: CSSProperties;
}

export default function CustomizedDropDown ({ assets, containerRef, contentDropWidth, open, setSelectedAsset, style = {} }: DropContentProps) {
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
      sx={{ ...style }}
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
              genesisHash={genesisHash ?? ''}
              key={index}
              setSelectedAsset={setSelectedAsset}
              token={token ?? ''}
            />
          );
        })}
      </DropContentContainer>
    </Popover>
  );
}
