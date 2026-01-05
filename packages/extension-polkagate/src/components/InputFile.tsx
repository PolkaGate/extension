// Copyright 2017-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropzoneRef } from 'react-dropzone';

import { Box, Grid, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import { DocumentText, FolderOpen, Import, Refresh2 } from 'iconsax-react';
import React, { createRef, useCallback, useState } from 'react';
import Dropzone from 'react-dropzone';

import { hexToU8a, isHex, noop, u8aToString } from '@polkadot/util';

import { useIsDark } from '../hooks';
import useTranslation from '../hooks/useTranslation';
import ActionButton from './ActionButton';

function formatBytes (bytes?: number, decimals = 2): string {
  if (!bytes || bytes === 0) {
    return '0 B';
  }

  const units: string[] = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i: number = Math.floor(Math.log(bytes) / Math.log(1024));
  const value: number = bytes / Math.pow(1024, i);

  return `${value.toFixed(decimals)} ${units[i]}`;
}

function classes (...classNames: (boolean | null | string | undefined)[]): string {
  return classNames
    .filter((className): boolean => !!className)
    .join(' ');
}

export interface InputFileProps {
  accept?: string;
  convertHex?: boolean;
  isDisabled?: boolean;
  isError?: boolean;
  onBack: () => void;
  onChange?: (contents: Uint8Array, name: string) => void;
  reset?: boolean;
  style?: SxProps<Theme>;
}

interface FileState {
  name: string;
  size: number;
}

const BYTE_STR_0 = '0'.charCodeAt(0);
const BYTE_STR_X = 'x'.charCodeAt(0);

function convertResult (result: ArrayBuffer, convertHex?: boolean): Uint8Array {
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

function FileInfo ({ file, onBack }: { file: FileState | undefined, onBack: () => void }): React.ReactElement<InputFileProps> {
  const isDark = useIsDark();
  const { t } = useTranslation();
  const truncate = (str: string, max = 40): string =>
    str.length > max ? str.slice(0, max - 1) + '…' : str;

  return (
    <Stack alignItems='start' direction='column' justifyContent='start' mt='10px'>
      <Typography sx={{ mb: '5px' }} variant='B-1'>
        {t('File name')}
      </Typography>
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ bgcolor: '#1B133CB2', border: '1px solid #1B133CB2', borderRadius: '12px', height: '56px', px: '5px', width: '100%' }}>
        <Stack alignItems='center' columnGap='10px' direction='row'>
          <DocumentText color='#AA83DC' size='18' variant='Bulk' />
          <Stack alignItems='start' direction='column'>
            <Typography color='#BEAAD8' sx={{ textAlign: 'left' }} variant='B-4'>
              {truncate(file?.name || '')}
            </Typography>
            <Typography color='#AA83DC' variant='B-4'>
              {formatBytes(file?.size)}
            </Typography>
          </Stack>
        </Stack>
        <ActionButton
          StartIcon={Refresh2}
          contentPlacement='start'
          iconSize={18}
          iconVariant='Outline'
          iconVariantOnHover='Bold'
          onClick={onBack}
          style={{
            '& .MuiButton-startIcon': {
              marginLeft: '9px',
              marginRight: '0px'
            },
            '&:hover': {
              background: isDark ? '#674394' : '#EFF1F9',
              transition: 'all 250ms ease-out'
            },
            background: isDark ? '#BFA1FF26' : '#FFFFFF',
            borderRadius: '10px',
            height: '36px',
            minWidth: '0px',
            padding: 0,
            width: '36px'
          }}
          variant='contained'
        />
      </Stack>
    </Stack>
  );
}

function DropZoneContent (): React.ReactElement<InputFileProps> {
  const { t } = useTranslation();

  return (
    <Stack alignItems='center' direction='column' justifyContent='center' rowGap='20px' sx={{ m: '30px 0 20px' }}>
      <FolderOpen color='#AA83DC' size='36' variant='Bulk' />
      <Typography color='#BEAAD8' variant='B-1'>
        {t('Drag and drop the file here')}
      </Typography>
      <Typography color='#674394' variant='B-1' width='60%'>
        {t('Only JSON files are accepted here; DOC, JPEG, and other formats are not accepted.')}
      </Typography>
      <ActionButton
        StartIcon={Import}
        contentPlacement='center'
        style={{
          '& .MuiButton-startIcon': {
            marginRight: '3px'
          },
          borderRadius: '8px',
          height: '32px',
          marginTop: '5px',
          minWidth: '100px',
          width: 'fit-content'
        }}
        text={t('Browse')}
        variant='contained'
      />
    </Stack>
  );
}

/**
 * InputFile
 *
 * A file upload component with drag-and-drop functionality, built on `react-dropzone`.
 * Allows users to upload a file (e.g., JSON), view its name and size after selection,
 * and optionally convert hex-encoded files to `Uint8Array`. Includes a refresh button
 * that lets users return to the initial file selection state.
 *
 * @component
 *
 * @param {string} [props.accept] - Comma-separated list of accepted MIME types (e.g., "application/json").
 * @param {boolean} [props.convertHex] - If true, attempts to decode hex-encoded file contents.
 * @param {boolean} [props.isDisabled] - If true, disables the dropzone functionality.
 * @param {boolean} [props.isError] - If true, applies error styling to the dropzone container.
 * @param {() => void} props.onBack - Callback fired when the user clicks the refresh icon to re-select a file.
 * @param {(contents: Uint8Array, name: string) => void} [props.onChange] - Callback fired after successful file read, providing the file contents and name.
 * @param {boolean} [props.reset] - If true, shows the dropzone view; otherwise, shows the file info view.
 * @param {SxProps<Theme>} [props.style] - Optional MUI `sx` prop to customize the styling of the dropzone container.
 *
 * @returns {React.ReactElement} A file upload UI component with support for file selection, preview, and reset.
 *
 * @example
 * <InputFile
 *   accept="application/json"
 *   convertHex
 *   reset={true}
 *   onBack={() => console.log('Back to file selection')}
 *   onChange={(data, name) => console.log('File loaded:', name, data)}
 * />
 */
function InputFile ({ accept, convertHex, isDisabled, isError = false, onBack, onChange, reset, style }: InputFileProps): React.ReactElement<InputFileProps> {
  const dropRef = createRef<DropzoneRef>();

  const [file, setFile] = useState<FileState | undefined>();
  const [hovered, setHovered] = useState(false);

  const toggleHovered = useCallback(() => setHovered((isHovered) => !isHovered), []);

  const onDrop = useCallback(
    (files: File[]): void => {
      files.forEach((file): void => {
        const reader = new FileReader();

        reader.onabort = noop;
        reader.onerror = noop;

        reader.onload = ({ target }: ProgressEvent<FileReader>): void => {
          if (target?.result) {
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

  return (
    <Dropzone
      accept={accept}
      disabled={isDisabled}
      multiple={false}
      onDrop={onDrop}
      ref={dropRef}
    >
      {({ getInputProps, getRootProps }): React.JSX.Element => (
        <>
          <Box
            border={hovered ? '1px dashed #AA83DC' : '1px solid #2D1E4A'}
            borderRadius='18px'
            boxSizing='border-box'
            display={reset ? 'inherit' : 'none'}
            fontSize='16px'
            m='10px 15px'
            maxHeight='255px'
            onDragEnter={toggleHovered}
            onDragLeave={toggleHovered}
            onMouseEnter={toggleHovered}
            onMouseLeave={toggleHovered}
            sx={{ cursor: 'pointer', width: '100%', ...style }}
          >
            <div {...getRootProps({ className: classes('ui--InputFile', isError ? 'error' : '') })}>
              <Grid alignItems='center' container direction='column' justifyContent='center'>
                {reset &&
                  <DropZoneContent />
                }
                <input {...getInputProps()} />
              </Grid>
            </div>
          </Box>
          {!reset &&
            <FileInfo
              file={file}
              onBack={onBack}
            />
          }
        </>
      )}
    </Dropzone>
  );
}

export default React.memo(InputFile);
