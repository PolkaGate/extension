// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Grid, Stack, Typography, useTheme } from '@mui/material';
import { AddCircle, ClipboardText, CloseCircle, Link2, Trash } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';

import { ActionButton, MyTextField, MyTooltip } from '../../../components';
import { useCustomEndpoint, useTranslation } from '../../../hooks';
import { isWss } from '../../../util';

const ENDPOINT_CHECK_TIMEOUT = 15_000;

function cleanEndpointInput(input: string): string {
  const trimmed = input.trim();

  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

function endpointAlreadyExists(endpoint: string, existingEndpoints: string[], customEndpoint: string | undefined): boolean {
  const cleanedEndpoint = cleanEndpointInput(endpoint);
  const cleanedCustomEndpoint = customEndpoint ? cleanEndpointInput(customEndpoint) : undefined;

  return existingEndpoints.some((existingEndpoint) =>
    cleanEndpointInput(existingEndpoint) === cleanedEndpoint &&
    cleanEndpointInput(existingEndpoint) !== cleanedCustomEndpoint
  );
}

function withTimeout<T>(promise: Promise<T>, timeoutMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(timeoutMessage)), ENDPOINT_CHECK_TIMEOUT);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}

interface Props {
  disabled?: boolean;
  existingEndpoints: string[];
  genesisHash: string | undefined;
  onCustomEndpointChange?: (previousEndpoint: string, nextEndpoint: string | undefined) => void;
  onSelectAuto: () => void;
  onSelectEndpoint: (endpoint: string) => void;
  onScrollToEnd?: () => void;
  selectedEndpoint: string | undefined;
}

function CustomEndpoint({ disabled = false, existingEndpoints, genesisHash, onCustomEndpointChange, onScrollToEnd, onSelectAuto, onSelectEndpoint, selectedEndpoint }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { customEndpoint, removeCustomEndpoint, setCustomEndpoint } = useCustomEndpoint(genesisHash);

  const [endpointInput, setEndpointInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    setEndpointInput(customEndpoint ?? '');
  }, [customEndpoint]);

  const cleanedEndpoint = useMemo(() => cleanEndpointInput(endpointInput), [endpointInput]);
  const isDuplicateEndpoint = useMemo(() =>
    endpointAlreadyExists(cleanedEndpoint, existingEndpoints, customEndpoint),
  [cleanedEndpoint, customEndpoint, existingEndpoints]
  );
  const isEndpointValid = useMemo(() => isWss(cleanedEndpoint), [cleanedEndpoint]);
  const inputErrorMessage = errorMessage ?? (isDuplicateEndpoint ? t('This RPC endpoint already exists.') : undefined);

  const onInputChange = useCallback((value: string) => {
    setEndpointInput(cleanEndpointInput(value));
    setErrorMessage(undefined);
  }, []);

  const onSave = useCallback(async(): Promise<void> => {
    const endpoint = cleanEndpointInput(endpointInput);

    setErrorMessage(undefined);
    setEndpointInput(endpoint);

    if (!genesisHash) {
      setErrorMessage(t('Network information is unavailable.'));
      onScrollToEnd?.();

      return;
    }

    if (!isWss(endpoint)) {
      setErrorMessage(t('Enter a valid wss:// endpoint.'));
      onScrollToEnd?.();

      return;
    }

    if (endpointAlreadyExists(endpoint, existingEndpoints, customEndpoint)) {
      setErrorMessage(t('This RPC endpoint already exists.'));
      onScrollToEnd?.();

      return;
    }

    let api: ApiPromise | undefined;
    let provider: WsProvider | undefined;

    setIsChecking(true);

    try {
      provider = new WsProvider(endpoint);

      api = await withTimeout(ApiPromise.create({ provider }), t('Unable to connect to this endpoint.'));

      if (api.genesisHash.toHex() !== genesisHash) {
        setErrorMessage(t('This endpoint belongs to a different network.'));
        onScrollToEnd?.();

        return;
      }

      const success = await setCustomEndpoint(endpoint);

      if (!success) {
        setErrorMessage(t('Unable to save this endpoint.'));
        onScrollToEnd?.();

        return;
      }

      customEndpoint && customEndpoint !== endpoint && onCustomEndpointChange?.(customEndpoint, endpoint);
      onSelectEndpoint(endpoint);
      setIsFormOpen(false);
      onScrollToEnd?.();
    } catch (error) {
      console.error(error);
      setErrorMessage(t('Unable to connect to this endpoint.'));
      onScrollToEnd?.();
    } finally {
      setIsChecking(false);
      api
        ? api.disconnect().catch(console.error)
        : provider?.disconnect().catch(console.error);
    }
  }, [customEndpoint, endpointInput, existingEndpoints, genesisHash, onCustomEndpointChange, onScrollToEnd, onSelectEndpoint, setCustomEndpoint, t]);

  const onRemove = useCallback(async(): Promise<void> => {
    if (!customEndpoint) {
      return;
    }

    const success = await removeCustomEndpoint();

    if (success) {
      onCustomEndpointChange?.(customEndpoint, undefined);

      if (selectedEndpoint === customEndpoint) {
        onSelectAuto();
      }

      setEndpointInput('');
      setErrorMessage(undefined);
      setIsFormOpen(false);
    }
  }, [customEndpoint, onCustomEndpointChange, onSelectAuto, removeCustomEndpoint, selectedEndpoint]);

  const onOpenForm = useCallback((): void => {
    setEndpointInput(customEndpoint ?? '');
    setErrorMessage(undefined);
    setIsFormOpen(true);
    onScrollToEnd?.();
  }, [customEndpoint, onScrollToEnd]);

  const onCloseForm = useCallback((): void => {
    setEndpointInput(customEndpoint ?? '');
    setErrorMessage(undefined);
    setIsFormOpen(false);
  }, [customEndpoint]);

  const onPaste = useCallback(async(): Promise<void> => {
    const clipText = await navigator.clipboard.readText();

    setEndpointInput(cleanEndpointInput(clipText));
    setErrorMessage(undefined);
    onScrollToEnd?.();
  }, [onScrollToEnd]);

  const onClearInput = useCallback((): void => {
    setEndpointInput('');
    setErrorMessage(undefined);
  }, []);

  const onSaveClick = useCallback((): void => {
    onSave().catch(console.error);
  }, [onSave]);

  const onPasteClick = useCallback((): void => {
    onPaste().catch(console.error);
  }, [onPaste]);

  const onRemoveClick = useCallback((): void => {
    onRemove().catch(console.error);
  }, [onRemove]);

  if (!isFormOpen) {
    return (
      <ActionButton
        StartIcon={AddCircle}
        contentPlacement='center'
        disabled={disabled}
        iconSize={18}
        iconVariant='Bold'
        onClick={onOpenForm}
        style={{ height: '44px', mt: '8px', width: '100%' }}
        text={customEndpoint ? t('Edit Custom RPC') : t('Add Custom RPC')}
        variant='contained'
      />
    );
  }

  return (
    <Grid container item sx={{ bgcolor: isDark ? '#05091C' : 'rgba(255, 255, 255, 0.86)', border: '1px solid', borderColor: isDark ? '#1B133C' : '#E4E9F7', borderRadius: '14px', boxShadow: isDark ? 'none' : 'inset 0 1px 0 rgba(255, 255, 255, 0.72)', mt: '8px', p: '10px', rowGap: '8px' }}>
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ width: '100%' }}>
        <Typography color={isDark ? '#7956A5' : '#4F4779'} variant='B-2'>
          {t('Custom RPC')}
        </Typography>
        {customEndpoint &&
          <Typography color={selectedEndpoint === customEndpoint ? 'success.main' : 'text.secondary'} variant='B-5'>
            {selectedEndpoint === customEndpoint ? t('Active') : t('Saved')}
          </Typography>
        }
      </Stack>
      <MyTextField
        Icon={Link2}
        disabled={disabled || isChecking}
        endAdornment={
          <MyTooltip content={endpointInput ? t('Clear') : t('Paste')}>
            <Button
              disabled={disabled || isChecking}
              onClick={endpointInput ? onClearInput : onPasteClick}
              sx={{
                '&.Mui-disabled svg': {
                  color: theme.palette.text.disabled
                },
                '&:hover': {
                  background: theme.palette.gradient.brand
                },
                '&:hover svg, &:hover svg path': {
                  color: '#FFFFFF',
                  fill: '#FFFFFF',
                  stroke: '#FFFFFF'
                },
                bgcolor: theme.palette.surface.hover,
                border: isDark ? 'none' : `1px solid ${theme.palette.border.strong}`,
                borderRadius: '8px',
                height: '34px',
                minWidth: '44px',
                p: 0
              }}
            >
              {endpointInput
                ? <CloseCircle color={isDark ? theme.palette.primary.main : theme.palette.text.secondary} size='18' variant='Bulk' />
                : <ClipboardText color={isDark ? theme.palette.primary.main : theme.palette.text.secondary} size='18' variant='Bulk' />
              }
            </Button>
          </MyTooltip>
        }
        errorMessage={inputErrorMessage}
        inputValue={endpointInput}
        onEnterPress={onSaveClick}
        onTextChange={onInputChange}
        placeholder='wss://'
        style={{ marginBottom: inputErrorMessage ? '16px' : 0, width: '100%' }}
      />
      <Stack columnGap='8px' direction='row' sx={{ width: '100%' }}>
        <Button
          disabled={disabled || isChecking || !isEndpointValid || isDuplicateEndpoint}
          onClick={onSaveClick}
          sx={{ borderRadius: '10px', height: '32px', textTransform: 'none' }}
          variant='contained'
        >
          {isChecking ? t('Checking') : customEndpoint ? t('Update') : t('Add')}
        </Button>
        {customEndpoint &&
          <Button
            color='error'
            disabled={disabled || isChecking}
            onClick={onRemoveClick}
            startIcon={<Trash size='16' variant='Bulk' />}
            sx={{ borderRadius: '10px', height: '32px', textTransform: 'none' }}
            variant='text'
          >
            {t('Remove')}
          </Button>
        }
        <Button
          disabled={isChecking}
          onClick={onCloseForm}
          sx={{ borderRadius: '10px', height: '32px', textTransform: 'none' }}
          variant='text'
        >
          {t('Cancel')}
        </Button>
      </Stack>
    </Grid>
  );
}

export default React.memo(CustomEndpoint);
