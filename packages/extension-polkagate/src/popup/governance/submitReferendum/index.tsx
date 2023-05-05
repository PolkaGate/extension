// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Button, Modal, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { Select } from '../../../components';
import { useChain, usePreImage, usePreImageHashes, useTranslation } from '../../../hooks';
import methodOptions from './addPreimage/options/methods';
import sectionOptions, { DropdownOption } from './addPreimage/options/sections';

interface Props {
  api: ApiPromise;
  address: string | undefined;
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void
}

export function SubmitReferendum({ address, api, open, setOpen }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const preImageHashes = usePreImageHashes(address);
  const preImage = usePreImage(address, preImageHashes?.[1]);
  const [section, setSection] = useState<string>();
  const [method, setMethod] = useState<string>();

  console.log('preImageHashes==', preImageHashes);

  const defaultSection = Object.keys(api.tx)[0];
  const defaultMethod = Object.keys(api.tx[defaultSection])[0];
  const apiDefaultTx = api.tx[defaultSection][defaultMethod];
  const apiDefaultTxSudo = (api.tx.system && api.tx.system.setCode) || apiDefaultTx;

  const onSectionChange = useCallback((item: string | number) => {
    setSection(item);
  }, []);

  const onMethodChange = useCallback((item: string | number) => {
    setMethod(item);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const style = {
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    left: '50%',
    position: 'absolute' as 'absolute',
    pb: 3,
    pt: 2,
    px: 4,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000
  };

  const sections = useMemo((): DropdownOption[] => api && sectionOptions(api), [api]);
  const methods = useMemo((): DropdownOption[] => api && (section || defaultSection) && methodOptions(api, section || defaultSection), [api, defaultSection, section]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
    >
      <Box sx={{ ...style }}>
        <Typography fontSize='18px' fontWeight={600} py={3}>
          {t('Submit Preimage')}
        </Typography>
        <Typography fontSize='16px' fontWeight={500}>
          {t('Before submitting a referendum, you are required to submit a preimage, and the preimage hash will be utilized during the submission of the referendum.')}
        </Typography>
        <Select
          label={t<string>('Section')}
          onChange={onSectionChange}
          options={sections}
          value={section || defaultSection}
        />
        <Select
          label={t<string>('Method')}
          onChange={onMethodChange}
          options={methods || []}
          value={method || methods?.[0]?.value || defaultMethod}
        />
        <Button onClick={handleClose}>
          {t('Submit')}
        </Button>
      </Box>
    </Modal>
  );
}
