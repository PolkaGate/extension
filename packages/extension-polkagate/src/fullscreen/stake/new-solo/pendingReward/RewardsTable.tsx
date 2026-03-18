// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExpandedRewards } from '../../type';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { Fragment, useCallback, useMemo, useRef } from 'react';

import { AssetLogo, DisplayBalance, FadeOnScroll, GlowCheckbox, GradientDivider, Identity, MySkeleton, NoInfoYet } from '../../../../components';
import { useChainInfo, useIsExtensionPopup, useTranslation } from '../../../../hooks';
import getLogo2 from '../../../../util/getLogo2';
import { timeDiffSummary } from './timeDiffSummary';

const SKELETON_HEIGHT = 24;

const COLUMNS_WIDTH = {
  AMOUNT: 4.5,
  EXPIRES: 2,
  VALIDATOR: 4.95
};

interface TableHeaderProp {
  checked: boolean;
  disabled: boolean;
  onSelectAll: (checked: boolean) => void;
}

export const TableHeader = ({ checked, disabled, onSelectAll }: TableHeaderProp) => {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  const handleAllSelect = useCallback(() => onSelectAll(checked), [checked, onSelectAll]);
  const textColor = isExtension ? 'text.highlight' : 'text.secondary';
  const variant = isExtension ? 'S-1' : 'B-1';
  const textTransform = isExtension ? 'uppercase' : 'none';

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', ml: isExtension ? 0 : '7px', width: '100%' }}>
      <Grid alignItems='center' container item sx={{ gap: '6px' }} xs={COLUMNS_WIDTH.AMOUNT}>
        <GlowCheckbox
          changeState={handleAllSelect}
          checked={checked}
          disabled={disabled}
          iconStyle={{ height: '24px', width: '24px' }}
          isBlueish={isExtension}
          style={{ m: 0, width: 'fit-content' }} // here
        />
        <Typography color={textColor} textTransform={textTransform} variant={variant}>
          {t('Amount')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item xs={COLUMNS_WIDTH.VALIDATOR}>
        <Typography color={textColor} textTransform={textTransform} variant={variant}>
          {t('Validator')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item justifyContent='end' xs={COLUMNS_WIDTH.EXPIRES}>
        <Typography color={textColor} textTransform={textTransform} variant={variant}>
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

const StyledSkeleton = ({ isExtension }: { isExtension: boolean }) => {
  return (
    <Grid container item justifyContent='space-evenly' sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'start', m: isExtension ? '4px 0 4px 0' : '4px 0 4px 7px', width: '102%' }}>
      <Grid alignItems='center' container item sx={{ gap: '6px' }} xs={COLUMNS_WIDTH.AMOUNT}>
        <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '6px', width: SKELETON_HEIGHT }} />
        <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '50px', width: '70%' }} />
      </Grid>
      <Grid alignItems='center' container item xs={COLUMNS_WIDTH.VALIDATOR}>
        <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '50px', width: '100%' }} />
      </Grid>
      <Grid alignItems='center' container item xs={COLUMNS_WIDTH.EXPIRES}>
        <MySkeleton height={SKELETON_HEIGHT} style={{ borderRadius: '50px', width: '100%' }} />
      </Grid>
    </Grid>
  );
};

export const RewardsTable = ({ eraToDate, expandedRewards, genesisHash, onSelect, selectedToPayout }: RewardsTableProp) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef(null);
  const { decimal, token } = useChainInfo(genesisHash, true);
  const isExtension = useIsExtensionPopup();

  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  const isIncluded = useCallback((info: ExpandedRewards): boolean => !!selectedToPayout.find((s) => s === info), [selectedToPayout]);

  const handleSelect = useCallback((info: ExpandedRewards, checked: boolean) => () => onSelect(info, checked), [onSelect]);
  const TABLE_HEIGHT = isExtension ? 290 : 260;

  return (
    <Grid container item sx={{ position: 'relative' }}>
      <Stack direction='column' ref={containerRef} sx={{ gap: isExtension ? '2px' : '4px', height: TABLE_HEIGHT, maxHeight: TABLE_HEIGHT, mb: isExtension ? 0 : '8px', overflow: 'hidden', overflowY: 'auto', pb: isExtension ? 0 : '15px', width: '100%' }}>
        {expandedRewards === undefined &&
          Array.from({ length: 7 }).map((_, index) => (
            <StyledSkeleton isExtension={isExtension} key={index} />
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
              <Grid container justifyContent='space-between' key={index} sx={{ alignItems: 'center', bgcolor: isExtension ? 'transparent' : '#05091C', borderRadius: isExtension ? 0 : '14px', display: 'flex', flexDirection: 'row', p: isExtension ? 0 : '5px 8px' }}>
                <Grid container item sx={{ alignItems: 'center', gap: '6px' }} xs={COLUMNS_WIDTH.AMOUNT}>
                  <Grid item>
                    <GlowCheckbox
                      borderStyle={{ border: 0 }}
                      changeState={handleSelect(info, isChecked)}
                      checked={isChecked}
                      iconStyle={{ height: '24px', width: '24px' }}
                      isBlueish={isExtension}
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
                      tokenColor={isExtension ? theme.palette.text.highlight : theme.palette.primary.main}
                      withCurrency={false}
                    />
                    <AssetLogo assetSize='16px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} token={token} />
                  </Grid>
                </Grid>
                <Grid item xs={COLUMNS_WIDTH.VALIDATOR}>
                  <Identity
                    address={validator}
                    genesisHash={genesisHash ?? ''}
                    noIdenticon
                    showShortAddress
                    showSocial={false}
                    style={{
                      height: '38px',
                      maxWidth: '95%',
                      minWidth: '35%',
                      variant: 'B-1',
                      width: 'fit-content'
                    }}
                  />
                </Grid>
                <Grid container item sx={{ alignItems: 'center', justifyContent: 'flex-end', pr: '4px', textAlign: 'right' }} xs={COLUMNS_WIDTH.EXPIRES}>
                  {timeDiffSummary(eraToDate(Number(eraIndex)) ?? '', isExtension)}
                </Grid>
              </Grid>
              {isExtension &&
                <GradientDivider isBlueish />
              }
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
