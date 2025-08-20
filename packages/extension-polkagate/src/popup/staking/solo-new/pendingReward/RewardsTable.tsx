// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExpandedRewards } from '@polkadot/extension-polkagate/src/fullscreen/stake/type';

import { Container, Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import React, { Fragment, useCallback, useMemo, useRef } from 'react';

import { timeDiffSummary } from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo/pendingReward/timeDiffSummary';

import { AssetLogo, FadeOnScroll, FormatBalance2, GradientDivider, Identity2 } from '../../../../components';
import { useChainInfo, useIsExtensionPopup, useTranslation } from '../../../../hooks';
import getLogo2 from '../../../../util/getLogo2';
import CheckBox from '../../components/CheckBox';

const TABLE_HEIGHT = 290;
const SKELETON_HEIGHT = 24;

interface TableHeaderProp {
  checked: boolean;
  onSelectAll: (checked: boolean) => void;
}

export const TableHeader = ({ checked, onSelectAll }: TableHeaderProp) => {
  const { t } = useTranslation();

  const handleAllSelect = useCallback(() => onSelectAll(checked), [checked, onSelectAll]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', width: '100%' }}>
      <Grid alignItems='center' container item sx={{ gap: '6px' }} xs={4}>
        <CheckBox
          checked={checked}
          onChange={handleAllSelect}
        />
        <Typography color='text.highlight' textTransform='uppercase' variant='S-1'>
          {t('Amount')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item xs>
        <Typography color='text.highlight' textTransform='uppercase' variant='S-1'>
          {t('Validator')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item xs={2}>
        <Typography color='text.highlight' textTransform='uppercase' variant='S-1'>
          {t('Expires')}
        </Typography>
      </Grid>
    </Container>
  );
};

interface RewardsTableProp {
  adaptiveDecimalPoint: number | undefined;
  expandedRewards: ExpandedRewards[] | undefined;
  selectedToPayout: ExpandedRewards[];
  onSelect: (info: ExpandedRewards, checked: boolean) => void;
  genesisHash: string | undefined;
  eraToDate: (era: number) => string | undefined;
}

const StyledSkeleton = () => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', my: '4px' }}>
      <Skeleton animation='wave' height={SKELETON_HEIGHT} sx={{ borderRadius: '6px', display: 'inline-block', transform: 'none', width: SKELETON_HEIGHT }} />
      <Skeleton animation='wave' height={SKELETON_HEIGHT} sx={{ borderRadius: '50px', display: 'inline-block', transform: 'none', width: '65px' }} />
      <Skeleton animation='wave' height={SKELETON_HEIGHT} sx={{ borderRadius: '50px', display: 'inline-block', transform: 'none', width: '170px' }} />
      <Skeleton animation='wave' height={SKELETON_HEIGHT} sx={{ borderRadius: '50px', display: 'inline-block', transform: 'none', width: '50px' }} />
    </Container>
  );
};

export const RewardsTable = ({ adaptiveDecimalPoint, eraToDate, expandedRewards, genesisHash, onSelect, selectedToPayout }: RewardsTableProp) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension= useIsExtensionPopup();

  const containerRef = useRef(null);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  const isIncluded = useCallback((info: ExpandedRewards): boolean => !!selectedToPayout.find((s) => s === info), [selectedToPayout]);

  const handleSelect = useCallback((info: ExpandedRewards, checked: boolean) => () => onSelect(info, checked), [onSelect]);

  return (
    <Grid container item sx={{ position: 'relative' }}>
      <Stack direction='column' ref={containerRef} sx={{ gap: '2px', height: TABLE_HEIGHT, maxHeight: TABLE_HEIGHT, overflow: 'hidden', overflowY: 'auto', width: '100%' }}>
        {expandedRewards === undefined &&
          Array.from({ length: 5 }).map((_, index) => (
            <StyledSkeleton key={index} />
          ))}
        {expandedRewards && expandedRewards.length === 0 &&
          <Grid container justifyContent='center' sx={{ mt: '70px' }}>
            <Typography color='text.highlight' variant='B-2'>
              {t('No pending rewards found!')}
            </Typography>
          </Grid>
        }
        {expandedRewards?.map((info, index) => {
          const [eraIndex, validator, _page, value] = info;
          const isChecked = isIncluded(info);

          return (
            <Fragment key={index}>
              <Container disableGutters key={index} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
                <Grid container item sx={{ alignItems: 'center', gap: '6px' }} xs={4}>
                  <Grid item>
                    <CheckBox
                      checked={isChecked}
                      onChange={handleSelect(info, isChecked)}
                    />
                  </Grid>
                  <Grid item sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px' }}>
                    <FormatBalance2
                      decimalPoint={adaptiveDecimalPoint}
                      decimals={[decimal ?? 0]}
                      style={{
                        color: theme.palette.text.primary,
                        ...theme.typography['B-2'],
                        textAlign: 'left',
                        width: 'max-content'
                      }}
                      tokenColor={theme.palette.text.highlight}
                      tokens={[token ?? '']}
                      value={value}
                      withCurrency={false}
                    />
                    <AssetLogo assetSize='16px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} token={token} />
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Identity2
                    address={validator}
                    genesisHash={genesisHash ?? ''}
                    identiconSize={18}
                    showShortAddress
                    showSocial={false}
                    style={{
                      height: '38px',
                      maxWidth: '95%',
                      minWidth: '35%',
                      variant: 'B-2',
                      width: 'fit-content'
                    }}
                  />
                </Grid>
                <Grid container item sx={{ alignItems: 'center', justifyContent: 'flex-end', pr: '4px', textAlign: 'right' }} xs={2}>
                  {timeDiffSummary(eraToDate(Number(eraIndex)) ?? '', isExtension)}
                </Grid>
              </Container>
              <GradientDivider isBlueish />
            </Fragment>
          );
        })}
      </Stack>
      <FadeOnScroll containerRef={containerRef} height='30px' ratio={0.3} />
    </Grid>
  );
};
