// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { ClipboardText } from 'iconsax-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { ActionButton } from '@polkadot/extension-polkagate/src/components/index';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks/index';

export interface Props {
  label: string;
  setSeed: React.Dispatch<React.SetStateAction<string>>;
  isCorrect: boolean;
  seed: string;
}

export default function MyPhraseArea ({ isCorrect, label, seed, setSeed }: Props): React.ReactElement {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); // Ref for textarea

  const [isEditing, setIsEditing] = useState<boolean>(true);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSeed(e.target.value);
  }, [setSeed]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  useEffect(() => {
    isCorrect && handleBlur();
  }, [handleBlur, isCorrect]);

  const handleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const pasteSeed = useCallback(() => {
    navigator.clipboard.readText().then((clipText) => {
      setSeed(clipText);
      setIsEditing(false);
    }).catch(console.error);
  }, [setSeed]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus(); // Ensure focus when switching to textarea mode
    }
  }, [isEditing]);

  return (
    <>
      <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start' mt='15px'>
        <Typography color='#EAEBF1' sx={{ my: '15px', textAlign: 'left' }} variant='B-1'>
          {label}
        </Typography>
        <ActionButton
          StartIcon={ClipboardText}
          contentPlacement='start'
          iconSize={14}
          onClick={pasteSeed}
          style={{
            '& .MuiButton-startIcon': {
              marginRight: '5px'
            },
            borderRadius: '8px',
            height: '32px',
            padding: '5px 10px'
          }}
          text={{
            firstPart: t('Paste')
          }}
          variant='contained'
        />
      </Stack>
      <div style={{ position: 'relative', width: '370px' }}>
        {isEditing
          ? (
            <textarea
              onBlur={handleBlur}
              onChange={handleChange}
              ref={textareaRef}
              style={{
                backgroundColor: '#1B133CB2',
                border: '1px solid transparent',
                borderColor: '#BEAAD833',
                borderRadius: '12px',
                color: '#BEAAD8',
                fontFamily: 'Inter',
                fontSize: '12px',
                fontWeight: 500,
                height: '100px',
                letterSpacing: '-0.19px',
                overflowY: 'auto',
                padding: '10px',
                resize: 'none',
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                width: '100%',
                wordBreak: 'break-word'
              }}
              value={seed}
            />
          )
          : (
            <div
              onClick={handleClick}
              style={{
                backgroundColor: '#1B133CB2',
                border: '1px solid transparent',
                borderColor: '#BEAAD833',
                borderRadius: '12px',
                color: '#BEAAD8',
                cursor: 'pointer',
                display: 'inline-block',
                flexWrap: 'wrap',
                fontFamily: 'Inter',
                fontSize: '12px',
                fontWeight: 500,
                gap: '4px',
                height: '100px',
                letterSpacing: '-0.19px',
                overflowY: 'auto',
                padding: '10px',
                textAlign: 'left',
                width: '100%'
              }}
            >
              {seed.split(/\s+/).map((item, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: '#2D1E4A',
                    borderRadius: '8px',
                    display: 'inline-block',
                    margin: '2px',
                    padding: '2px 5px'
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          )}
      </div>
    </>
  );
}
