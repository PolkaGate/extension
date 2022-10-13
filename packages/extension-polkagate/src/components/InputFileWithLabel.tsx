// Copyright 2017-2022 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Box, Grid, Typography } from '@mui/material';
import React, { createRef, useCallback, useState } from 'react';
import Dropzone, { DropzoneRef } from 'react-dropzone';
import styled from 'styled-components';

import { formatNumber, hexToU8a, isHex, u8aToString } from '@polkadot/util';

import { upload } from '../assets/icons';
import useTranslation from '../hooks/useTranslation';
import PButton from './PButton';

function classes(...classNames: (boolean | null | string | undefined)[]): string {
  return classNames
    .filter((className): boolean => !!className)
    .join(' ');
}

export interface InputFileProps {
  // Reference Example Usage: https://github.com/react-dropzone/react-dropzone/tree/master/examples/Accept
  // i.e. MIME types: 'application/json, text/plain', or '.json, .txt'
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
  withLabel?: boolean;
  reset?: boolean;
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

function InputFile({ accept, reset, className = '', clearContent, convertHex, isDisabled, isError = false, label, onChange, placeholder }: InputFileProps): React.ReactElement<InputFileProps> {
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
          maxHeight='200px'
          fontSize='16px'
          m='10px 15px'
          sx={{ backgroundColor: 'background.paper' }}
        >
          <div {...getRootProps({ className: classes('ui--InputFile', isError ? 'error' : '', className) })}>
            <Grid container justifyContent='center' direction='column' alignItems='center'>
              {(reset) &&
                <Grid item sx={{ width: '60%' }}>
                  <PButton
                    // _onClick={_onRestore}
                    // isBusy={isBusy}
                    _fontSize='18px'
                    _mt='21px'
                    _variant='outlined'
                    // disabled={isFileError || isPasswordError}
                    text={t<string>('Browse file')}
                  />
                </Grid>
              }
              {(reset) &&
                <Grid item mt='11px'>
                  {t('Or')}
                </Grid>
              }
              {(reset) &&
                <Grid item mt='13px'>
                  <Box
                    component='img'
                    src={upload}
                  sx={{ height: '35.5px', width: '51px' }}
                  />
                </Grid>
              }
              <input {...getInputProps()} />
              <Grid item mt={file ? 0 : '20px'} p={file ? '10px 15px' : 0} sx={{ fontSize: file ? 16 : 18, fontWeight: file ? 400 : 300 }}>
                {
                  clearContent || reset
                    ? placeholder || t<string>('drag and drop the file here')
                    : placeholder || t<string>('{{name}} ({{size}} bytes)', {
                      replace: {
                        name: file.name,
                        size: formatNumber(file.size)
                      }
                    })
                }
              </Grid>
            </Grid>
          </div>
        </Box>
      )
      }
    </Dropzone >
  );

  return label
    ? (
      <>
        <Typography
          fontSize='14px'
          fontWeight={300}
          m='auto'
          pt='20px'
          textAlign={reset ? 'center' : 'left'}
          width='92%'
        >
          {label}
        </Typography>
        {dropZone}
      </>
    )
    : dropZone;
}

export default React.memo(styled(InputFile)(({ isError, theme }: InputFileProps) => `
  overflow-wrap: anywhere;

  &:hover {
    cursor: pointer;
  }
`));
