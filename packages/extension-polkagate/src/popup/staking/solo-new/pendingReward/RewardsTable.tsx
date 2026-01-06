// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExpandedRewards } from '@polkadot/extension-polkagate/src/fullscreen/stake/type';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { Fragment, useCallback, useMemo, useRef } from 'react';

import { timeDiffSummary } from '@polkadot/extension-polkagate/src/fullscreen/stake/new-solo/pendingReward/timeDiffSummary';

import { AssetLogo, DisplayBalance, FadeOnScroll, GradientDivider, Identity2, MySkeleton, NoInfoYet } from '../../../../components';
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
  expandedRewards: ExpandedRewards[] | undefined | null;
  selectedToPayout: ExpandedRewards[];
  onSelect: (info: ExpandedRewards, checked: boolean) => void;
  genesisHash: string | undefined;
  eraToDate: (era: number) => string | undefined;
}

const StyledSkeleton = () => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', my: '4px' }}>
      <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '6px', width: SKELETON_HEIGHT }} />
      <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '50px', width: '65px' }} />
      <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '50px', width: '170px' }} />
      <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '50px', width: '50px' }} />
    </Container>
  );
};

export const RewardsTable = ({ eraToDate, expandedRewards, genesisHash, onSelect, selectedToPayout }: RewardsTableProp) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  const containerRef = useRef(null);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  const isIncluded = useCallback((info: ExpandedRewards): boolean => !!selectedToPayout.find((s) => s === info), [selectedToPayout]);

  const handleSelect = useCallback((info: ExpandedRewards, checked: boolean) => () => onSelect(info, checked), [onSelect]);

  return (
    <Grid container item sx={{ position: 'relative' }}>
      <Stack direction='column' ref={containerRef} sx={{ gap: '2px', height: TABLE_HEIGHT, maxHeight: TABLE_HEIGHT, overflow: 'hidden', overflowY: 'auto', width: '100%' }}>
        {expandedRewards === undefined &&
          Array.from({ length: 8 }).map((_, index) => (
            <StyledSkeleton key={index} />
          ))}
        <NoInfoYet
          show={expandedRewards === null || Boolean(expandedRewards && expandedRewards.length === 0)}
          size={100}
          style={{ justifyContent: 'center', mt: '50px' }}
          text={t('No pending rewards found!')}
        />
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
                    <DisplayBalance
                      balance={value}
                      decimal={decimal}
                      style={{
                        color: theme.palette.text.primary,
                        ...theme.typography['B-2'],
                        textAlign: 'left',
                        width: 'max-content'
                      }}
                      token={token}
                      tokenColor={theme.palette.text.highlight}
                      useAdaptiveDecimalPoint
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
