// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExpandedRewards } from '../../type';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { Fragment, useCallback, useMemo, useRef } from 'react';

import { AssetLogo, DisplayBalance, FadeOnScroll, GlowCheckbox, Identity2, MySkeleton, NoInfoYet } from '../../../../components';
import { useChainInfo, useTranslation } from '../../../../hooks';
import getLogo2 from '../../../../util/getLogo2';
import { timeDiffSummary } from './timeDiffSummary';

const SKELETON_HEIGHT = 24;
const TABLE_HEIGHT = 260;

interface TableHeaderProp {
  checked: boolean;
  disabled: boolean;
  onSelectAll: (checked: boolean) => void;
}

export const TableHeader = ({ checked, disabled, onSelectAll }: TableHeaderProp) => {
  const { t } = useTranslation();

  const handleAllSelect = useCallback(() => onSelectAll(checked), [checked, onSelectAll]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', ml: '7px', width: '100%' }}>
      <Grid alignItems='center' container item sx={{ gap: '6px' }} xs={4}>
        <GlowCheckbox
          changeState={handleAllSelect}
          checked={checked}
          disabled={disabled}
          iconStyle={{ height: '24px', width: '24px' }}
          style={{ m: 0, width: 'fit-content' }}
        />
        <Typography color='text.secondary' variant='B-1'>
          {t('Amount')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item xs>
        <Typography color='text.secondary' variant='B-1'>
          {t('Validator')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item xs={2}>
        <Typography color='text.secondary' variant='B-1'>
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
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'start', m: '4px 0 4px 7px' }}>
      <Grid alignItems='center' container item sx={{ gap: '6px' }} xs={4}>
        <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '6px', width: SKELETON_HEIGHT }} />
        <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '50px', width: '70%' }} />
      </Grid>
      <Grid alignItems='center' container item xs>
        <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '50px', width: '90%' }} />
      </Grid>
      <Grid alignItems='center' container item xs={2}>
        <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '50px', width: '90%' }} />
      </Grid>
    </Container>
  );
};

export const RewardsTable = ({ eraToDate, expandedRewards, genesisHash, onSelect, selectedToPayout }: RewardsTableProp) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef(null);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  const isIncluded = useCallback((info: ExpandedRewards): boolean => !!selectedToPayout.find((s) => s === info), [selectedToPayout]);

  const handleSelect = useCallback((info: ExpandedRewards, checked: boolean) => () => onSelect(info, checked), [onSelect]);

  return (
    <Grid container item sx={{ position: 'relative' }}>
      <Stack direction='column' ref={containerRef} sx={{ gap: '4px', height: TABLE_HEIGHT, maxHeight: TABLE_HEIGHT, mb: '8px', overflow: 'hidden', overflowY: 'auto', pb: '15px', width: '100%' }}>
        {expandedRewards === undefined &&
          Array.from({ length: 7 }).map((_, index) => (
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
              <Container disableGutters key={index} sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', p: '5px 8px' }}>
                <Grid container item sx={{ alignItems: 'center', gap: '6px' }} xs={4}>
                  <Grid item>
                    <GlowCheckbox
                      changeState={handleSelect(info, isChecked)}
                      checked={isChecked}
                      iconStyle={{ height: '24px', width: '24px' }}
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
                      tokenColor='#AA83DC'
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
                      maxWidth: '100%',
                      minWidth: '35%',
                      variant: 'B-2',
                      width: 'fit-content'
                    }}
                  />
                </Grid>
                <Grid container item sx={{ alignItems: 'center', justifyContent: 'flex-end', pr: '4px', textAlign: 'right' }} xs={2}>
                  {timeDiffSummary(eraToDate(Number(eraIndex)) ?? '')}
                </Grid>
              </Container>
            </Fragment>
          );
        })}
      </Stack>
      {expandedRewards &&
        <FadeOnScroll containerRef={containerRef} height='30px' ratio={0.3} style={{ borderRadius: '0 0 14px 14px' }} />
      }
    </Grid>
  );
};
