// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { useAnimateOnce, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useIsHovered from '@polkadot/extension-polkagate/src/hooks/useIsHovered2';

interface WordProps {
  word: string;
  index: number;
}

const Word = ({ index, word }: WordProps) => {
  const { isHovered, ref } = useIsHovered();

  return (
    <Stack
      alignItems='center'
      direction='row'
      key={word}
      ref={ref}
      sx={{
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(-10px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        animation: `fadeIn 0.5s ease-in-out ${index * 0.2}s forwards`,
        background: isHovered ? '#2D1E4A' : '#2D1E4A8C',
        borderRadius: '18px',
        margin: '5px',
        minWidth: '100px',
        opacity: 0,
        padding: '1px',
        transform: 'translateY(-10px)',
        width: 'fit-content'
      }}
    >
      <Box
        alignContent='center'
        justifyItems='center'
        sx={{
          bgcolor: isHovered ? 'label.primary' : '#2D1E4A',
          borderRadius: '14px',
          height: '36px',
          m: '2px',
          width: '31px'
        }}
      >
        <Typography alignSelf='center' color='text.secondary'>
          {index + 1}
        </Typography>
      </Box>
      <Typography color='text.secondary' sx={{ px: '10px' }} variant='B-2'>
        {word}
      </Typography>
    </Stack>
  );
};

const TIME_OUT = 300;

const SecretPhraseGuard = ({ revealed, setRevealed }: { revealed: boolean; setRevealed: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { t } = useTranslation();

  const [removeGlass, setRemoveGlass] = useState<boolean>(false);

  const invisible = useCallback(() => setRemoveGlass(true), []);

  useAnimateOnce(revealed, { delay: TIME_OUT, onStart: invisible });

  const reveal = useCallback(() => setRevealed(true), [setRevealed]);
  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setRevealed(true);
    }
  }, [setRevealed]);

  return (
    <Box
      onClick={reveal}
      onKeyDown={onKeyDown}
      role='button'
      sx={{
        alignItems: 'center',
        animation: 'fadeIn 0.5s',
        backdropFilter: 'blur(6px)',
        bgcolor: 'rgba(20, 15, 30, 0.4)',
        borderRadius: '14px',
        boxShadow: 'inset 0 0 0 1000px rgba(255, 255, 255, 0.03), 0 0 14px rgba(255, 255, 255, 0.08)',
        cursor: 'pointer',
        display: removeGlass ? 'none' : 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        left: 0,
        opacity: revealed ? 0 : 1,
        position: 'absolute',
        top: 0,
        transition: `opacity ${TIME_OUT}ms ease-in-out`,
        width: '100%',
        zIndex: 10
      }}
      tabIndex={0}
    >
      <Typography color='primary.main' sx={{ mb: 2 }} variant='B-2'>
        {t('Click to reveal — make sure no one is watching!')}
      </Typography>
    </Box>
  );
};

const IllustrateSeed = ({ seed, style }: { style?: SxProps<Theme>, seed: null | string }) => {
  const wordsArray = seed?.split(' ');
  const [revealed, setRevealed] = useState<boolean>(false);

  return (
    <Box position='relative' sx={style}>
      <Grid aria-hidden={!revealed} container id='seed-words' item>
        {wordsArray?.map((word, index) => (
          <Word
            index={index}
            key={`${index} + ${word}`}
            word={word}
          />
        ))}
      </Grid>
      <SecretPhraseGuard
        revealed={revealed}
        setRevealed={setRevealed}
      />
    </Box>
  );
};

export default React.memo(IllustrateSeed);
