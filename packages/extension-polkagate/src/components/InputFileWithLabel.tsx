// Copyright 2017-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid, SxProps, Theme, Typography } from '@mui/material';
import React, { createRef, useCallback, useState } from 'react';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import styled from 'styled-components';

import { formatNumber, hexToU8a, isHex, u8aToString } from '@polkadot/util';

import { upload } from '../assets/icons';
import useTranslation from '../hooks/useTranslation';
import PButton from './PButton';
import Label from './Label';

function classes(...classNames: (boolean | null | string | undefined)[]): string {
  return classNames
    .filter((className): boolean => !!className)
    .join(' ');
}

export interface InputFileProps {
  className?: string;
  accept?: string;
  clearContent?: boolean;
  convertHex?: boolean;
  help?: React.ReactNode;
  isDisabled?: boolean;
  isError?: boolean;
  label: string;
  onChange?: (contents: Uint8Array, name: string) => void;
  placeholder?: React.ReactNode | null;
  withEllipsis?: boolean;
  reset?: boolean;
  style?: SxProps<Theme>;
  labelStyle?: React.CSSProperties;
}

interface FileState {
  name: string;
  size: number;
}

const BYTE_STR_0 = '0'.charCodeAt(0);
const BYTE_STR_X = 'x'.charCodeAt(0);
const NOOP = (): void => undefined;

function convertResult(result: ArrayBuffer, convertHex?: boolean): Uint8Array {
  const data = new Uint8Array(result);

  // this converts the input (if detected as hex), vai the hex conversion route
  if (convertHex && data[0] === BYTE_STR_0 && data[1] === BYTE_STR_X) {
    const hex = u8aToString(data);

    if (isHex(hex)) {
      return hexToU8a(hex);
    }
  }

  return data;
}

function InputFile({ accept, className = '', clearContent, convertHex, isDisabled, isError = false, label, labelStyle, onChange, placeholder, reset, style }: InputFileProps): React.ReactElement<InputFileProps> {
  const { t } = useTranslation();
  const dropRef = createRef<DropzoneRef>();
  const [file, setFile] = useState<FileState | undefined>();

  const _onDrop = useCallback(
    (files: File[]): void => {
      files.forEach((file): void => {
        const reader = new FileReader();

        reader.onabort = NOOP;
        reader.onerror = NOOP;

        reader.onload = ({ target }: ProgressEvent<FileReader>): void => {
          if (target && target.result) {
            const name = file.name;
            const data = convertResult(target.result as ArrayBuffer, convertHex);

            onChange && onChange(data, name);
            dropRef && setFile({
              name,
              size: data.length
            });
          }
        };

        reader.readAsArrayBuffer(file);
      });
    },
    [convertHex, dropRef, onChange]

  );

  const nullFunction = useCallback(() => null, []);

  const dropZone = (
    <Dropzone
      accept={accept}
      disabled={isDisabled}
      multiple={false}
      onDrop={_onDrop}
      ref={dropRef}
    >
      {({ getInputProps, getRootProps }): JSX.Element => (
        <Box
          border={file ? '1px solid' : '1px dashed'}
          borderColor='secondary.light'
          borderRadius='5px'
          boxSizing='border-box'
          fontSize='16px'
          m='10px 15px'
          maxHeight='200px'
          sx={{ backgroundColor: 'background.paper', cursor: 'pointer', ...style }}
        >
          <div {...getRootProps({ className: classes('ui--InputFile', isError ? 'error' : '', className) })}>
            <Grid alignItems='center' container direction='column' justifyContent='center'>
              {(reset) &&
                <Grid item sx={{ width: '60%' }}>
                  <PButton
                    _fontSize='18px'
                    _mt='21px'
                    _onClick={nullFunction}
                    _variant='outlined'
                    text={t<string>('Browse file')}
                  />
                </Grid>
              }
              {(reset) &&
                <Grid item mt='20px'>
                  {t('Or')}
                </Grid>
              }
              {(reset) &&
                <Grid item mt='13px'>
                  <Box
                    component='img'
                    src={upload as string}
                    sx={{ height: '35.5px', width: '51px' }}
                  />
                </Grid>
              }
              <input {...getInputProps()} />
              <Grid item m={file ? 0 : '-7px 0 20px'} p={file ? '10px 15px' : 0} sx={{ fontSize: file ? 16 : 18, fontWeight: file ? 400 : 300 }}>
                {
                  clearContent || reset
                    ? placeholder || t<string>('drag and drop the file here')
                    : placeholder || t<string>('{{name}} ({{size}} bytes)', {
                      replace: {
                        name: file?.name,
                        size: formatNumber(file?.size)
                      }
                    })
                }
              </Grid>
            </Grid>
          </div>
        </Box>
      )
      }
    </Dropzone>
  );

  return (
    <Label
      label={label}
      style={labelStyle}
    >
      {dropZone}
    </Label>
  );
}

export default React.memo(InputFile);
