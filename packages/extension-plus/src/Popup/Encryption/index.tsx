// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable new-cap */

import type { ThemeProps } from '../../../../extension-ui/src/types';

import { CheckRounded as CheckRoundedIcon, ContentCopy as ContentCopyIcon, Clear as ClearIcon, Lock as LockIcon, LockOpen as LockOpenIcon } from '@mui/icons-material';
import { Alert, Button, Container, Divider, Grid, IconButton, InputAdornment, Link, Tab, Tabs, TextField, Tooltip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import styled from 'styled-components';

import { AccountsStore } from '@polkadot/extension-base/stores';
import { createPair } from '@polkadot/keyring';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady, decodeAddress, encodeAddress as toSS58 } from '@polkadot/util-crypto';

import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import { Header } from '../../../../extension-ui/src/partials';
import { Password } from '../../components';
import { PASS_MAP } from '../../util/constants';
import { toShortAddress } from '../../util/plusUtils';
import isValidAddress from '../../util/validateAddress';
import CopyToClipboard from 'react-copy-to-clipboard';

interface Props extends ThemeProps {
  className?: string;
}

interface AddressState {
  address: string;
}

function EnDecrypt({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [enPlainText, setEnPlainText] = useState<string>('');
  const [enCipherText, setEnCipherText] = useState<string>('');
  const [dePlainText, setDePlainText] = useState<string>('');
  const [deCipherText, setDeCipherText] = useState<string>('');

  const [recipient, setRecipient] = useState<string>('');
  const [sender, setSender] = useState<string>('');
  const [senderAddressIsValid, setSenderAddressIsValid] = useState(false);
  const [recepientAddressIsValid, setRecipientAddressIsValid] = useState(false);

  const [password, setPassword] = useState<string>('');
  const [passwordStatus, setPasswordStatus] = useState<number>(PASS_MAP.EMPTY);
  const [tabValue, setTabValue] = useState('encrypt');

  const { address } = useParams<AddressState>();

  useEffect(() => {
    // eslint-disable-next-line no-void
    void cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    });
  }, []);

  useEffect(() => {
    // if (!recipient) return;
    setRecipientAddressIsValid(isValidAddress(recipient));
  }, [recipient]);

  useEffect(() => {
    // if (!sender) return;
    setSenderAddressIsValid(isValidAddress(sender));
  }, [sender]);

  const handleEncrypt = useCallback((): void => {
    try {
      const sender = keyring.getPair(address);

      console.log('sender:', sender)
      // sender.unlock(password);
      const encodedSender = sender.encodePkcs8(password);
      setPasswordStatus(PASS_MAP.CORRECT);

      const receiverPublicKey = decodeAddress(recipient);
      console.log('sender.publicKey', sender.publicKey.toString())
      const senderPair = createPair({ toSS58, type: 'sr25519' }, { publicKey: sender.publicKey });

      senderPair.decodePkcs8(password, encodedSender);
      console.log('senderPair', senderPair)

      const encryptedMessage = senderPair.encryptMessage(enPlainText, receiverPublicKey);

      setEnCipherText(encryptedMessage.toString());
    } catch (e) {
      console.log(e);
      setPasswordStatus(PASS_MAP.INCORRECT);
    }
  }, [address, password, recipient, enPlainText]);


  const handleDecrypt = useCallback((): void => {
    try {
      const senderPublicKey = decodeAddress(sender);
      const receiver = keyring.getPair(address);
      const encodedReceiver = receiver.encodePkcs8(password);

      const senderPair = createPair({ toSS58, type: 'sr25519' }, { publicKey: senderPublicKey });
      const receiverPair = createPair({ toSS58, type: 'sr25519' }, { publicKey: receiver.publicKey });

      receiver.unlock(password);
      receiverPair.decodePkcs8(password, encodedReceiver);
      console.log('pass ok')
      setPasswordStatus(PASS_MAP.CORRECT);
      const temp = deCipherText.split(',').map((c) => parseInt(c, 10));
      const unit8ofcipherText = new Uint8Array(temp);
      console.log('unit8ofcipherText', unit8ofcipherText);

      const decryptedMessage = receiver.decryptMessage(unit8ofcipherText, senderPair.publicKey);

      const decrypteText = Array.from(decryptedMessage).map((val) => String.fromCharCode(val)).join('');

      setDePlainText(decrypteText);
    } catch (e) {
      console.log(e);
      setPasswordStatus(PASS_MAP.INCORRECT);
    }
  }, [address, deCipherText, password, sender]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    // setSender('');
    // setRecipient('');
  };

  const handleClearAddress = useCallback((): void => {
    setRecipient('');
    setSender('');
    setSenderAddressIsValid(false);
    setRecipientAddressIsValid(false);
  }, []);

  return (
    <>
      <Header showAdd showBackArrow showSettings smallMargin text={
        <Grid container spacing={4}>
          <Grid item sx={{ fontSize: 15, fontWeight: '500' }}>
            {t<string>('En/Decrypt')}
          </Grid>
          <Grid item sx={{ fontSize: 12 }}>
            {t('Account')}: {' '}{toShortAddress(address)}
          </Grid>
        </Grid>
      } />
      <Container>
        <Grid item sx={{ margin: '0px 30px' }} xs={12}>
          <Tabs indicatorColor='secondary' onChange={handleTabChange} textColor='secondary' value={tabValue} variant='fullWidth'>
            <Tab icon={<LockIcon fontSize='small' />} iconPosition='start' label='Encryption' sx={{ fontSize: 11 }} value='encrypt' />
            <Tab icon={<LockOpenIcon fontSize='small' />} iconPosition='start' label='Decryption' sx={{ fontSize: 11 }} value='decrypt' />
          </Tabs>
        </Grid>
        {tabValue === 'encrypt' &&
          <>
            <Grid item sx={{ p: '15px 10px' }} xs={12}>
              <TextField
                autoFocus
                id='enPlainText'
                label='Plain text'
                multiline
                onChange={(event) => setEnPlainText(event.target.value)}
                placeholder='Enter plain text here'
                rows={4}
                sx={{ flexShrink: 0, width: '100%' }}
                value={enPlainText}
              />
            </Grid>
            <Grid item sx={{ p: '5px 10px' }} xs={12}>
              <TextField
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={handleClearAddress}>
                        {recipient !== null ? <ClearIcon /> : ''}
                      </IconButton>
                    </InputAdornment>
                  ),
                  startAdornment: (
                    <InputAdornment position='start'>
                      {recepientAddressIsValid ? <CheckRoundedIcon color='success' /> : ''}
                    </InputAdornment>
                  ),

                  style: { fontSize: 14 }
                }}
                error={!recepientAddressIsValid && !!recipient}
                // helperText={t('Reciever and sender must be on the same network')}
                fullWidth
                // eslint-disable-next-line react/jsx-no-bind
                label={t('Recipient')}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder={t('enter recipient address')}
                size='medium'
                type='string'
                value={recipient}
                variant='outlined'
              />
            </Grid>
            <Grid alignItems='center' container item justifyContent='space-between' sx={{ pt: '5px' }} xs={12}>
              <Grid item xs={9}>
                <Password
                  // handleClearPassword={handleClearPassword}
                  handleIt={handleEncrypt}
                  helper={''}
                  password={password}
                  passwordStatus={passwordStatus}
                  setPassword={setPassword}
                  setPasswordStatus={setPasswordStatus}
                  showHelper={false}
                />
              </Grid>
              <Grid item xs={3}>
                <Button
                  color='warning'
                  onClick={handleEncrypt}
                  size='large'
                  sx={{ p: '13px' }}
                  variant='contained'
                >
                  {t('Encrypt')}
                </Button>
              </Grid>
            </Grid>
            <Grid item sx={{ p: '30px 10px' }} xs={12}>
              <TextField
                InputProps={{
                  endAdornment: <InputAdornment position='end'>
                    <Tooltip id='onlyReciient' placement='left' title={'Only the recipient can decrypt this text'}>
                      <CopyToClipboard text={enCipherText}>
                        <ContentCopyIcon color='action' sx={{ cursor: 'pointer' }}
                        // onClick={_onCopy}
                        />
                      </CopyToClipboard>
                    </Tooltip>
                  </InputAdornment>
                }}
                id='enCipherText'
                label='Cipher text'
                multiline
                rows={3}
                sx={{ flexShrink: 0, width: '100%' }}
                // placeholder='Enter cipher text here'
                value={enCipherText}
              />
            </Grid>
          </>}
        {tabValue === 'decrypt' &&
          <>
            <Grid item sx={{ p: '15px 10px' }} xs={12}>
              <TextField
                autoFocus
                id='deCipherText'
                label='Cipher text'
                multiline
                onChange={(event) => setDeCipherText(event.target.value)}
                placeholder='Enter cipher text here to decrypt'
                rows={3}
                sx={{ flexShrink: 0, width: '100%' }}
                value={deCipherText}
              />
            </Grid>
            <Grid item sx={{ p: '5px 10px' }} xs={12}>
              <TextField
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={handleClearAddress}>
                        {sender !== null ? <ClearIcon /> : ''}
                      </IconButton>
                    </InputAdornment>
                  ),
                  startAdornment: (
                    <InputAdornment position='start'>
                      {senderAddressIsValid ? <CheckRoundedIcon color='success' /> : ''}
                    </InputAdornment>
                  ),
                  style: { fontSize: 14 }
                }}
                error={!senderAddressIsValid && !!sender}
                // helperText={t('Reciever and sender must be on the same network')}
                fullWidth
                // eslint-disable-next-line react/jsx-no-bind
                label={t('Sender')}
                onChange={(event) => setSender(event.target.value)}
                placeholder={t('enter sender address')}
                size='medium'
                type='string'
                value={sender}
                variant='outlined'
              />
            </Grid>
            <Grid alignItems='center' container item justifyContent='space-between' sx={{ pt: '5px' }} xs={12}>
              <Grid item xs={9}>
                <Password
                  // handleClearPassword={handleClearPassword}
                  handleIt={handleDecrypt}
                  helper={''}
                  password={password}
                  passwordStatus={passwordStatus}
                  setPassword={setPassword}
                  setPasswordStatus={setPasswordStatus}
                  showHelper={false}
                />
              </Grid>
              <Grid item xs={3}>
                <Button
                  color='warning'
                  onClick={handleDecrypt}
                  size='large'
                  sx={{ p: '13px' }}
                  variant='outlined'
                >
                  {t('Decrypt')}
                </Button>
              </Grid>
            </Grid>
            <Grid item sx={{ p: '30px 10px' }} xs={12}>
              <TextField
                id='dePlainText'
                label='Plain text'
                multiline
                rows={4}
                sx={{ flexShrink: 0, width: '100%' }}
                value={dePlainText}
              // placeholder='Enter cipher text here'
              />
            </Grid>
          </>
        }
      </Container>
    </>
  );
}

export default styled(EnDecrypt)`
      height: calc(100vh - 2px);
      overflow: auto;
      scrollbar - width: none;

      &:: -webkit - scrollbar {
        display: none;
      width:0,
  }
      .empty-list {
        text - align: center;
  }
      `;

