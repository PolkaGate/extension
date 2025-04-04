// Copyright 2019-2025 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDef } from '@polkadot/extension-inject/types';
import type { KeyringPair, KeyringPair$Json, KeyringPair$Meta } from '@polkadot/keyring/types';
import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import type { SubjectInfo } from '@polkadot/ui-keyring/observable/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
// added for plus to import RequestUpdateMeta
import type { AccountJson, AllowedPath, ApplyAddedTime, AuthorizeRequest, AuthUrls, MessageTypes, MetadataRequest, RequestAccountBatchExport, RequestAccountChangePassword, RequestAccountCreateExternal, RequestAccountCreateHardware, RequestAccountCreateSuri, RequestAccountEdit, RequestAccountExport, RequestAccountForget, RequestAccountShow, RequestAccountTie, RequestAccountValidate, RequestAuthorizeApprove, RequestBatchRestore, RequestDeriveCreate, RequestDeriveValidate, RequestJsonRestore, RequestMetadataApprove, RequestMetadataReject, RequestSeedCreate, RequestSeedValidate, RequestSigningApprovePassword, RequestSigningApproveSignature, RequestSigningCancel, RequestSigningIsLocked, RequestTypes, RequestUpdateAuthorizedAccounts, RequestUpdateMeta, ResponseAccountExport, ResponseAccountsExport, ResponseAuthorizeList, ResponseDeriveValidate, ResponseJsonGetAccountInfo, ResponseSeedCreate, ResponseSeedValidate, ResponseSigningIsLocked, ResponseType, SigningRequest } from '../types';
import type State from './State';

import { ALLOWED_PATH, PASSWORD_EXPIRY_MS, START_WITH_PATH } from '@polkadot/extension-base/defaults';
import { TypeRegistry } from '@polkadot/types';
import keyring from '@polkadot/ui-keyring';
import { accounts as accountsObservable } from '@polkadot/ui-keyring/observable/accounts';
import { assert, isHex } from '@polkadot/util';
import { keyExtractSuri, mnemonicGenerate, mnemonicValidate } from '@polkadot/util-crypto';

import { withErrorLog } from './helpers';
import { createSubscription, unsubscribe } from './subscriptions';

type CachedUnlocks = Record<string, number>;

const SEED_DEFAULT_LENGTH = 12;
const SEED_LENGTHS = [12, 15, 18, 21, 24];
const ETH_DERIVE_DEFAULT = "/m/44'/60'/0'/0/0";

// a global registry to use internally
const registry = new TypeRegistry();

function getSuri(seed: string, type?: KeypairType): string {
  return type === 'ethereum'
    ? `${seed}${ETH_DERIVE_DEFAULT}`
    : seed;
}

function transformAccounts(accounts: SubjectInfo): AccountJson[] {
  return Object.values(accounts).map(({ json: { address, meta }, type }): AccountJson => ({
    address,
    ...meta,
    type
  }));
}

function isJsonPayload(value: SignerPayloadJSON | SignerPayloadRaw): value is SignerPayloadJSON {
  return (value as SignerPayloadJSON).genesisHash !== undefined;
}

export default class Extension {
  readonly #cachedUnlocks: CachedUnlocks;

  readonly #state: State;

  constructor(state: State) {
    this.#cachedUnlocks = {};
    this.#state = state;
  }

  private applyAddedTime({ pair }: ApplyAddedTime): void {
    assert(pair, 'Unable to find pair');

    const addedTime = Date.now();

    keyring.saveAccountMeta(pair, { ...pair.meta, addedTime });
  }

  private accountsCreateExternal({ address, genesisHash, name }: RequestAccountCreateExternal): boolean {
    const { pair } = keyring.addExternal(address, { genesisHash, name });

    this.applyAddedTime({ pair });

    return true;
  }

  private accountsCreateHardware({ accountIndex, address, addressOffset, genesisHash, hardwareType, name }: RequestAccountCreateHardware): boolean {
    const { pair } = keyring.addHardware(address, hardwareType, { accountIndex, addressOffset, genesisHash, name });

    this.applyAddedTime({ pair });

    return true;
  }

  private accountsCreateSuri({ genesisHash, name, password, suri, type }: RequestAccountCreateSuri): boolean {
    const { pair } = keyring.addUri(getSuri(suri, type), password, { genesisHash, name }, type);

    this.applyAddedTime({ pair });

    return true;
  }

  private accountsChangePassword({ address, newPass, oldPass }: RequestAccountChangePassword): boolean {
    const pair = keyring.getPair(address);

    assert(pair, 'Unable to find pair');

    try {
      if (!pair.isLocked) {
        pair.lock();
      }

      pair.decodePkcs8(oldPass);
    } catch (error) {
      throw new Error('oldPass is invalid');
    }

    keyring.encryptAccount(pair, newPass);

    return true;
  }

  private accountsEdit({ address, name }: RequestAccountEdit): boolean {
    const pair = keyring.getPair(address);

    assert(pair, 'Unable to find pair');

    keyring.saveAccountMeta(pair, { ...pair.meta, name });

    return true;
  }

  // added for plus to update meta generally
  private accountsUpdateMeta({ address, meta }: RequestUpdateMeta): boolean {
    const pair = keyring.getPair(address);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const metadata = JSON.parse(meta);

    assert(pair, 'Unable to find pair');

    keyring.saveAccountMeta(pair, { ...pair.meta, ...metadata });

    return true;
  }

  private lockExtension(): boolean {
    const currentDomain = chrome.runtime.getURL('/');

    chrome.tabs.query({}, function (tabs) {
      for (let i = 0; i < tabs.length; i++) {
        const tabParsedUrl = new URL(tabs[i].url!);

        const tabDomain = `${tabParsedUrl?.protocol}//${tabParsedUrl?.hostname}/`;

        if (tabDomain === currentDomain) {
          chrome.tabs.reload(tabs[i].id!).catch(console.error);
        }
      }
    });

    return true;
  }

  private accountsExport({ address, password }: RequestAccountExport): ResponseAccountExport {
    return { exportedJson: keyring.backupAccount(keyring.getPair(address), password) };
  }

  private async accountsBatchExport({ addresses, password }: RequestAccountBatchExport): Promise<ResponseAccountsExport> {
    return {
      exportedJson: await keyring.backupAccounts(addresses, password)
    };
  }

  private accountsForget({ address }: RequestAccountForget): boolean {
    keyring.forgetAccount(address);

    return true;
  }

  private refreshAccountPasswordCache(pair: KeyringPair): number {
    const { address } = pair;

    const savedExpiry = this.#cachedUnlocks[address] || 0;
    const remainingTime = savedExpiry - Date.now();

    if (remainingTime < 0) {
      this.#cachedUnlocks[address] = 0;
      pair.lock();

      return 0;
    }

    return remainingTime;
  }

  private accountsShow({ address, isShowing }: RequestAccountShow): boolean {
    const pair = keyring.getPair(address);

    assert(pair, 'Unable to find pair');

    keyring.saveAccountMeta(pair, { ...pair.meta, isHidden: !isShowing });

    return true;
  }

  private accountsTie({ address, genesisHash }: RequestAccountTie): boolean {
    const pair = keyring.getPair(address);

    assert(pair, 'Unable to find pair');

    keyring.saveAccountMeta(pair, { ...pair.meta, genesisHash });

    return true;
  }

  private accountsValidate({ address, password }: RequestAccountValidate): boolean {
    try {
      keyring.backupAccount(keyring.getPair(address), password);

      return true;
    } catch (e) {
      return false;
    }
  }

  // FIXME This looks very much like what we have in Tabs
  private accountsSubscribe(id: string, port: chrome.runtime.Port): boolean {
    const cb = createSubscription<'pri(accounts.subscribe)'>(id, port);
    const subscription = accountsObservable.subject.subscribe((accounts: SubjectInfo): void =>
      cb(transformAccounts(accounts))
    );

    port.onDisconnect.addListener((): void => {
      unsubscribe(id);
      subscription.unsubscribe();
    });

    return true;
  }

  private authorizeApprove({ authorizedAccounts, id }: RequestAuthorizeApprove): boolean {
    const queued = this.#state.getAuthRequest(id);

    assert(queued, 'Unable to find request');

    const { resolve } = queued;

    resolve({ authorizedAccounts, result: true });

    return true;
  }

  private async authorizeUpdate({ authorizedAccounts, url }: RequestUpdateAuthorizedAccounts): Promise<void> {
    return await this.#state.updateAuthorizedAccounts({ authorizedAccounts, url });
  }

  private getAuthList(): ResponseAuthorizeList {
    return { list: this.#state.authUrls as AuthUrls };
  }

  private ignoreAuthorization(id: string): void {
    return this.#state.ignoreAuthRequest(id);
  }

  // FIXME This looks very much like what we have in accounts
  private authorizeSubscribe(id: string, port: chrome.runtime.Port): boolean {
    const cb = createSubscription<'pri(authorize.requests)'>(id, port);
    const subscription = this.#state.authSubject.subscribe((requests: AuthorizeRequest[]): void =>
      cb(requests)
    );

    port.onDisconnect.addListener((): void => {
      unsubscribe(id);
      subscription.unsubscribe();
    });

    return true;
  }

  private metadataApprove({ id }: RequestMetadataApprove): boolean {
    const queued = this.#state.getMetaRequest(id);

    assert(queued, 'Unable to find request');

    const { request, resolve } = queued;

    this.#state.saveMetadata(request);

    resolve(true);

    return true;
  }

  private metadataGet(genesisHash: string | null): MetadataDef | null {
    return this.#state.knownMetadata.find((result) => result.genesisHash === genesisHash) || null;
  }

  private metadataList(): MetadataDef[] {
    return this.#state.knownMetadata;
  }

  private metadataReject({ id }: RequestMetadataReject): boolean {
    const queued = this.#state.getMetaRequest(id);

    assert(queued, 'Unable to find request');

    const { reject } = queued;

    reject(new Error('Rejected'));

    return true;
  }

  private metadataSubscribe(id: string, port: chrome.runtime.Port): boolean {
    const cb = createSubscription<'pri(metadata.requests)'>(id, port);
    const subscription = this.#state.metaSubject.subscribe((requests: MetadataRequest[]): void =>
      cb(requests)
    );

    port.onDisconnect.addListener((): void => {
      unsubscribe(id);
      subscription.unsubscribe();
    });

    return true;
  }

  // added for PolkaGate
  private metadataUpdate(metadata: MetadataDef): boolean {
    assert(metadata, 'Unable to update metadata');

    this.#state.saveMetadata(metadata);

    return true;
  }

  private jsonRestore({ file, password }: RequestJsonRestore): void {
    try {
      const pair = keyring.restoreAccount(file, password);

      this.applyAddedTime({ pair });
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  private batchRestore({ file, password }: RequestBatchRestore): void {
    try {
      keyring.restoreAccounts(file, password);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  private jsonGetAccountInfo(json: KeyringPair$Json): ResponseJsonGetAccountInfo {
    try {
      const { address, meta: { genesisHash, name }, type } = keyring.createFromJson(json);

      return {
        address,
        genesisHash,
        name,
        type
      } as ResponseJsonGetAccountInfo;
    } catch (e) {
      console.error(e);
      throw new Error((e as Error).message);
    }
  }

  private seedCreate({ length = SEED_DEFAULT_LENGTH, seed: _seed, type }: RequestSeedCreate): ResponseSeedCreate {
    const seed = _seed || mnemonicGenerate(length);

    return {
      address: keyring.createFromUri(getSuri(seed, type), {}, type).address,
      seed
    };
  }

  private seedValidate({ suri, type }: RequestSeedValidate): ResponseSeedValidate {
    const { phrase } = keyExtractSuri(suri);

    if (isHex(phrase)) {
      assert(isHex(phrase, 256), 'Hex seed needs to be 256-bits');
    } else {
      // sadly isHex detects as string, so we need a cast here
      assert(SEED_LENGTHS.includes((phrase).split(' ').length), `Mnemonic needs to contain ${SEED_LENGTHS.join(', ')} words`);
      assert(mnemonicValidate(phrase), 'Not a valid mnemonic seed');
    }

    return {
      address: keyring.createFromUri(getSuri(suri, type), {}, type).address,
      suri
    };
  }

  private signingApprovePassword({ id, password, savePass }: RequestSigningApprovePassword): boolean {
    const queued = this.#state.getSignRequest(id);

    assert(queued, 'Unable to find request');

    const { reject, request, resolve } = queued;
    const pair = keyring.getPair(queued.account.address);

    // unlike queued.account.address the following
    // address is encoded with the default prefix
    // which what is used for password caching mapping
    const { address } = pair;

    if (!pair) {
      reject(new Error('Unable to find pair'));

      return false;
    }

    this.refreshAccountPasswordCache(pair);

    // if the keyring pair is locked, the password is needed
    if (pair.isLocked && !password) {
      reject(new Error('Password needed to unlock the account'));
    }

    if (pair.isLocked) {
      pair.decodePkcs8(password);
    }

    const { payload } = request;

    if (isJsonPayload(payload)) {
      // Get the metadata for the genesisHash
      const currentMetadata = this.#state.knownMetadata.find((meta: MetadataDef) =>
        meta.genesisHash === payload.genesisHash);

      // set the registry before calling the sign function
      registry.setSignedExtensions(payload.signedExtensions, currentMetadata?.userExtensions);

      if (currentMetadata) {
        registry.register(currentMetadata?.types);
      }
    }

    const result = request.sign(registry, pair);

    if (savePass) {
      this.#cachedUnlocks[address] = Date.now() + PASSWORD_EXPIRY_MS;
    } else {
      pair.lock();
    }

    resolve({
      id,
      ...result
    });

    return true;
  }

  private signingApproveSignature({ id, signature, signedTransaction }: RequestSigningApproveSignature): boolean {
    const queued = this.#state.getSignRequest(id);

    assert(queued, 'Unable to find request');

    const { resolve } = queued;

    resolve({ id, signature, signedTransaction });

    return true;
  }

  private signingCancel({ id }: RequestSigningCancel): boolean {
    const queued = this.#state.getSignRequest(id);

    assert(queued, 'Unable to find request');

    const { reject } = queued;

    reject(new Error('Cancelled'));

    return true;
  }

  private signingIsLocked({ id }: RequestSigningIsLocked): ResponseSigningIsLocked {
    const queued = this.#state.getSignRequest(id);

    assert(queued, 'Unable to find request');

    const address = queued.request.payload.address;
    const pair = keyring.getPair(address);

    assert(pair, 'Unable to find pair');

    const remainingTime = this.refreshAccountPasswordCache(pair);

    return {
      isLocked: pair.isLocked,
      remainingTime
    };
  }

  // FIXME This looks very much like what we have in authorization
  private signingSubscribe(id: string, port: chrome.runtime.Port): boolean {
    const cb = createSubscription<'pri(signing.requests)'>(id, port);
    const subscription = this.#state.signSubject.subscribe((requests: SigningRequest[]): void =>
      cb(requests)
    );

    port.onDisconnect.addListener((): void => {
      unsubscribe(id);
      subscription.unsubscribe();
    });

    return true;
  }

  private windowOpen(path: AllowedPath): boolean {
    const url = `${chrome.runtime.getURL('index.html')}#${path}`;

    if (!ALLOWED_PATH.includes(path as any) && !START_WITH_PATH.find((p) => path.startsWith(p))) { // added for PolkaGate, updated
      console.error('Not allowed to open the url:', url);

      return false;
    }

    withErrorLog(() => chrome.tabs.create({ url }));

    return true;
  }

  private derive(parentAddress: string, suri: string, password: string, metadata: KeyringPair$Meta): KeyringPair {
    const parentPair = keyring.getPair(parentAddress);

    try {
      parentPair.decodePkcs8(password);
    } catch (e) {
      throw new Error('invalid password');
    }

    try {
      return parentPair.derive(suri, metadata);
    } catch (err) {
      throw new Error(`"${suri}" is not a valid derivation path`);
    }
  }

  private derivationValidate({ parentAddress, parentPassword, suri }: RequestDeriveValidate): ResponseDeriveValidate {
    const childPair = this.derive(parentAddress, suri, parentPassword, {});

    return {
      address: childPair.address,
      suri
    };
  }

  private derivationCreate({ genesisHash, name, parentAddress, parentPassword, password, suri }: RequestDeriveCreate): boolean {
    const childPair = this.derive(parentAddress, suri, parentPassword, {
      genesisHash,
      name,
      parentAddress,
      suri
    });

    const { pair } = keyring.addPair(childPair, password);

    this.applyAddedTime({ pair });

    return true;
  }

  private async removeAuthorization(url: string): Promise<ResponseAuthorizeList> {
    const remAuth = await this.#state.removeAuthorization(url);

    return { list: remAuth };
  }

  // Weird thought, the eslint override is not needed in Tabs
  // eslint-disable-next-line @typescript-eslint/require-await
  public async handle<TMessageType extends MessageTypes>(id: string, type: TMessageType, request: RequestTypes[TMessageType], port: chrome.runtime.Port): Promise<ResponseType<TMessageType>> {
    switch (type) {
      case 'pri(authorize.approve)':
        return this.authorizeApprove(request as RequestAuthorizeApprove);

      case 'pri(authorize.list)':
        return this.getAuthList();

      case 'pri(authorize.ignore)':
        return this.ignoreAuthorization(request as string);

      case 'pri(authorize.remove)':
        return this.removeAuthorization(request as string);

      case 'pri(authorize.requests)':
        return this.authorizeSubscribe(id, port);

      case 'pri(authorize.update)':
        return this.authorizeUpdate(request as RequestUpdateAuthorizedAccounts);

      case 'pri(accounts.create.external)':
        return this.accountsCreateExternal(request as RequestAccountCreateExternal);

      case 'pri(accounts.create.hardware)':
        return this.accountsCreateHardware(request as RequestAccountCreateHardware);

      case 'pri(accounts.create.suri)':
        return this.accountsCreateSuri(request as RequestAccountCreateSuri);

      case 'pri(accounts.updateMeta)': // added for polkagate
        return this.accountsUpdateMeta(request as RequestUpdateMeta);

      case 'pri(extension.lock)': // added for polkagate
        return this.lockExtension();

      case 'pri(accounts.changePassword)':
        return this.accountsChangePassword(request as RequestAccountChangePassword);

      case 'pri(accounts.edit)':
        return this.accountsEdit(request as RequestAccountEdit);

      case 'pri(accounts.export)':
        return this.accountsExport(request as RequestAccountExport);

      case 'pri(accounts.batchExport)':
        return this.accountsBatchExport(request as RequestAccountBatchExport);

      case 'pri(accounts.forget)':
        return this.accountsForget(request as RequestAccountForget);

      case 'pri(accounts.show)':
        return this.accountsShow(request as RequestAccountShow);

      case 'pri(accounts.subscribe)':
        return this.accountsSubscribe(id, port);

      case 'pri(accounts.tie)':
        return this.accountsTie(request as RequestAccountTie);

      case 'pri(accounts.validate)':
        return this.accountsValidate(request as RequestAccountValidate);

      case 'pri(metadata.approve)':
        return this.metadataApprove(request as RequestMetadataApprove);

      case 'pri(metadata.get)':
        return this.metadataGet(request as string);

      case 'pri(metadata.list)':
        return this.metadataList();

      case 'pri(metadata.reject)':
        return this.metadataReject(request as RequestMetadataReject);

      case 'pri(metadata.requests)':
        return this.metadataSubscribe(id, port);

      case 'pri(metadata.update)': // added for polkagate
        return this.metadataUpdate(request as MetadataDef);

      case 'pri(derivation.create)':
        return this.derivationCreate(request as RequestDeriveCreate);

      case 'pri(derivation.validate)':
        return this.derivationValidate(request as RequestDeriveValidate);

      case 'pri(json.restore)':
        return this.jsonRestore(request as RequestJsonRestore);

      case 'pri(json.batchRestore)':
        return this.batchRestore(request as RequestBatchRestore);

      case 'pri(json.account.info)':
        return this.jsonGetAccountInfo(request as KeyringPair$Json);

      case 'pri(seed.create)':
        return this.seedCreate(request as RequestSeedCreate);

      case 'pri(seed.validate)':
        return this.seedValidate(request as RequestSeedValidate);

      case 'pri(settings.notification)':
        return this.#state.setNotification(request as string);

      case 'pri(signing.approve.password)':
        return this.signingApprovePassword(request as RequestSigningApprovePassword);

      case 'pri(signing.approve.signature)':
        return this.signingApproveSignature(request as RequestSigningApproveSignature);

      case 'pri(signing.cancel)':
        return this.signingCancel(request as RequestSigningCancel);

      case 'pri(signing.isLocked)':
        return this.signingIsLocked(request as RequestSigningIsLocked);

      case 'pri(signing.requests)':
        return this.signingSubscribe(id, port);

      case 'pri(window.open)':
        return this.windowOpen(request as AllowedPath);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  }
}
