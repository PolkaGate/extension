// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowCircleLeft, Repeat } from 'iconsax-react';
import React, { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIsHovered, useTranslation } from '../../../hooks';
import { windowOpen } from '../../../messaging';

interface SettingButtonProps {
  text?: string;
  Icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const SettingButton = ({ Icon, disabled = false, onClick, text }: SettingButtonProps) => {
  const onClickHandle = useCallback(() => {
    if (disabled) {
      return;
    }

    onClick();
  }, [disabled, onClick]);

  return (
    <Grid container item justifyContent='center' onClick={onClickHandle} sx={{ alignItems: 'center', bgcolor: '#809ACB26', borderRadius: '12px', columnGap: '4px', cursor: disabled ? 'default' : 'pointer', p: '3px 6px', width: 'fit-content' }}>
      {Icon}
      {text && <Typography color='text.highlight' variant='B-2' width='max-content'>
        {text}
      </Typography>}
    </Grid>
  );
};

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  style?: SxProps<Theme>;
}

export default function NominationsBackButton({ address, genesisHash, style }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);
  const navigate = useNavigate();

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const onChange = useCallback(() => windowOpen('/fullscreen-stake/solo/manage-validator/' + address + '/' + genesisHash) as unknown as void, [address, genesisHash]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', px: '15px', width: '100%', ...style }}>
      <Container disableGutters onClick={onBack} ref={containerRef} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '6px', ml: 0, width: 'max-content' }}>
        <ArrowCircleLeft color='#809ACB' size='24' variant={hovered ? 'Bold' : 'Bulk'} />
        <Typography sx={{ fontFamily: 'OdibeeSans', fontSize: '24px', fontWeight: '400', lineHeight: '26px', textTransform: 'uppercase' }}>
          {t('Nominations')}
        </Typography>
      </Container>
      <SettingButton
        Icon={<Repeat color={theme.palette.text.highlight} size='18' variant='Bulk' />}
        disabled={false}
        onClick={onChange}
        text={t('Change')}
      />
    </Container>
  );
}
