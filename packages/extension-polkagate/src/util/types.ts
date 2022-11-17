// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable camelcase */

import type { DeriveAccountInfo, DeriveBalancesAll, DeriveCollectiveProposal, DeriveElectionsInfo, DeriveProposal, DeriveReferendumExt, DeriveStakingAccount, DeriveStakingQuery } from '@polkadot/api-derive/types';
import type { StakingLedger } from '@polkadot/types/interfaces';
import type { PalletNominationPoolsBondedPoolInner, PalletNominationPoolsPoolMember, PalletNominationPoolsRewardPool } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { ApiPromise } from '@polkadot/api';
import { AccountJson } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';

export interface TransactionStatus {
  blockNumber: string | null;
  success: boolean | null;
  text: string | null;
}

export interface LastBalances {
  availableBalance: BN;
  decimals: number[];
  tokens: string[];
  freeBalance: BN;
  reservedBalance: BN;
  frozenMisc: BN;
  frozenFee: BN;
  lockedBalance: BN;
  vestedBalance: BN;
  vestedClaimable: BN;
  votingBalance: BN;
}

export const DEFAULT_ACCOUNT_BALANCE = { address: null, balanceInfo: null, chain: null, name: null };

export interface AccountsBalanceType {
  address: string; // formatted address
  chain: string | null; // chainName actually
  balanceInfo?: LastBalances;
  name: string | null;
  txHistory?: string;
}

export interface StakingConsts {
  existentialDeposit: BN;
  maxNominations: number;
  maxNominatorRewardedPerValidator: number;
  minNominatorBond: BN;
  unbondingDuration: number
}

export interface NominatorInfo {
  minNominated: bigint;
  isInList: boolean // is Nominator in top 22500 elected
}

export interface ValidatorInfo extends DeriveStakingQuery {
  accountInfo?: DeriveAccountInfo;
}

export interface AllValidators {
  current: ValidatorInfo[];
  waiting: ValidatorInfo[];
  currentEraIndex?: number
}

export interface Validators {
  current: DeriveStakingQuery[];
  waiting: DeriveStakingQuery[];
  currentEraIndex?: number
}

export interface AllValidatorsFromSubscan {
  current: ValidatorsFromSubscan[];
  waiting: ValidatorsFromSubscan[]
}

export interface ValidatorsName {
  address: string;
  name: string;
}

export interface SavedMetaData {
  chainName: string;
  metaData: any
}

export interface ValidatorsFromSubscan {
  bonded_nominators: string;
  bonded_owner: string;
  bonded_total?: string;
  controller_account_display?: stashAccountDisplay;
  count_nominators: number;
  grandpa_vote?: number;
  latest_mining?: number;
  node_name: string;
  rank_validator?: number;
  reward_account: string;
  reward_point?: number;
  reward_pot_balance: string;
  session_key?: any;
  stash_account_display: stashAccountDisplay;
  validator_prefs_value: number;
}

interface stashAccountDisplay {
  account_index: string;
  address: string;
  display: string;
  identity: boolean;
  judgements: any;
  parent: any;
}

export interface TransactionDetail {
  action?: string; // send, bond, bond_extra, unbound, nominate ...
  block?: number;
  from: NameAddress;
  amount?: string;
  date: number;
  txHash?: string;
  fee?: string;
  to?: string;
  status: 'fail' | 'success',
  failureText?: string;
  throughProxy?: NameAddress;
}

export interface TxInfo extends TransactionDetail {
  api: ApiPromise;
  chain: Chain;
  token?: string;
}

export interface Auction {
  auctionCounter: number;
  auctionInfo: [string, string];
  blockchain: string;
  crowdloans: Crowdloan[];
  currentBlockNumber: number;
  minContribution: string;
  winning: string[];
}

export interface Crowdloan {
  fund: Fund;
  identity: Identity;
}

interface Fund {
  depositor: string;
  verifier: string | null;
  deposit: string;
  raised: string;
  end: number;
  cap: string;
  lastContribution: { ending: bigint };
  firstPeriod: number;
  lastPeriod: number;
  trieIndex: number;
  paraId: string;
  hasLeased: boolean;
}

interface Identity {
  // 'judgements': [],
  //  'deposit':202580000000,
  'info': {
    // 'additional':[],
    'display'?: string;
    'legal'?: string;
    'web'?: string;
    //  'riot':{'none':null},
    'email'?: string;
    //  'pgpFingerprint':null,
    //  'image':{'none':null},
    'twitter'?: string;
  }
}

export interface TransferRequest {
  code: number;
  data: {
    list: any;
    count: number;
    transfers: Transfers[];
  };
  generated_at: number;
  message: string;
}

export interface TipsRequest {
  code: number;
  data: {
    count: number;
    list: Tip[];
  };
  generated_at: number;
  message: string;
}

export interface Transfers {
  amount: string;
  asset_symbol: string;
  block_num: number;
  block_timestamp: number;
  extrinsic_index: string;
  fee: string;
  from: string;
  from_account_display: AccountDisplay;
  hash: string;
  module: string;
  nonce: number;
  success: boolean
  to: string;
  to_account_display: AccountDisplay;
}

interface AccountDisplay {
  address: string;
  display: string;
  judgements: string;
  account_index: string;
  identity: boolean;
  parent: any;
}

export interface CouncilInfo extends DeriveElectionsInfo {
  accountInfos: DeriveAccountInfo[];
}

export interface PersonsInfo {
  desiredSeats?: number;
  backed?: string[];
  infos: DeriveAccountInfo[]
}

export interface MotionsInfo {
  proposals: DeriveCollectiveProposal[];
  proposalInfo: any[];
  accountInfo: DeriveAccountInfo[]
}

export interface ChainInfo {
  api: ApiPromise;
  coin: string;
  decimals: number;
  url: string;
  genesisHash: string;
  chainName?: string;
}

export interface ProposalsInfo {
  proposals: DeriveProposal[];
  accountsInfo: DeriveAccountInfo[];
  minimumDeposit?: string;
}

export interface Conviction {
  text: string;
  value: number
}

type TransactionType = 'chill' | 'bond' | 'unbond' | 'nominate' | 'bondExtra' | 'slashingSpans' | 'withdrawUnbonded';

export interface TransactionFee {
  transactionType: TransactionType;
  estimatedFee: Balance;
}

export interface Referendum extends DeriveReferendumExt {
  proposerInfo: DeriveAccountInfo;
}

export interface RebagInfo {
  shouldRebag?: boolean;
  currentBagThreshold?: string;
}

export interface PutInFrontInfo {
  shouldPutInFront?: boolean;
  lighter?: string;
}

export interface AddressState {
  genesisHash: string;
  address: string;
}
export interface FormattedAddressState {
  genesisHash: string;
  address: string;
  formatted: string;
}

export interface nameAddress {
  name?: string;
  address: string;
}
export interface NameAddress {
  name?: string;
  address: string;
}

interface Judgment {
  index: number;
  judgement: string;
}

interface AccountInfo {
  address: string;
  display: string;
  judgements: Judgment[] | null;
  account_index: string;
  identity: boolean;
  parent: string | null
}

export interface Tip {
  block_num: number;
  reason: string;
  hash: string;
  extrinsic_index: string;
  status: string;
  amount: string;
  close_block_num: number;
  tipper_num: number;
  finder: AccountInfo;
  beneficiary: AccountInfo;
}

export interface Option {
  text: string;
  value: string;
}

export interface PoolStakingConsts {
  lastPoolId: BN;
  maxPoolMembers: number;
  maxPoolMembersPerPool: number;
  maxPools: number;
  minCreateBond: BN;
  minCreationBond: BN
  minJoinBond: BN;
  minNominatorBond: BN;
}

export interface PoolInfo {
  poolId: BN;
  bondedPool: PalletNominationPoolsBondedPoolInner | null;
  metadata: string | null;
  rewardPool: PalletNominationPoolsRewardPool | null
}

export interface MyPoolInfo extends PoolInfo {
  member?: PalletNominationPoolsPoolMember;
  accounts?: PoolAccounts;
  nominators?: string[];
  myClaimable?: BN;
  redeemable?: BN;
  rewardClaimable?: BN;
  ledger?: StakingLedger | null;
  rewardIdBalance?: DeriveStakingAccount;
  stashIdAccount?: DeriveStakingAccount;
}

export interface PoolAccounts {
  rewardId: string;
  stashId: string;
}

export interface MembersMapEntry {
  accountId: string;
  member: PalletNominationPoolsPoolMember;
}

export interface RecoveryConsts {
  configDepositBase: BN;
  friendDepositFactor: BN;
  maxFriends: number;
  recoveryDeposit: BN
}

export interface Rescuer extends DeriveAccountInfo {
  option?: {
    created: BN,
    deposit: BN,
    friends: string[]
  }
}

export interface Voucher {
  blockNumber: string;
  friend: string;
  id: string;
  lost: string;
  rescuer: string;
}

export interface Initiation {
  blockNumber: string;
  id: string;
  lost: string;
  rescuer: string;
}

export type Close = Initiation;

interface Reward {
  era: number,
  stash: string,
  amount: string,
  eventIdx: number,
  isReward: boolean,
  validator: string
}

interface Transfer {
  to: string,
  fee: string,
  from: string,
  amount: string,
  success: boolean,
  eventIdx: number
}

interface extrinsic {
  fee: string,
  call: string,
  hash: string,
  module: string,
  success: boolean
}
export interface SubQueryRewardInfo {
  blockNumber: number,
  timestamp: string,
  extrinsicHash: string,
  address: string,
  reward: Reward
}
export interface SubQueryHistory {
  id: string,
  blockNumber: number,
  extrinsicIdx: number,
  extrinsicHash: string,
  timestamp: string,
  address: string,
  reward: Reward,
  extrinsic: extrinsic,
  transfer: Transfer,
  assetTransfer: JSON,
}

export interface SubscanRewardInfo {
  era: number,
  stash: string,
  account: string,
  validator_stash: string,
  amount: string,
  block_timestamp: number,
  event_index: string,
  module_id: string,
  event_id: string,
  slash_kton: string,
  extrinsic_index: string
}

export interface RewardInfo {
  era: number;
  amount: BN;
  timeStamp: number;
  event: string;
  validator: string;
  stash: string
}

export interface AlertType {
  text: string;
  severity: 'error' | 'warning' | 'info' | 'success'
}

export type ProxyTypes = 'Any' | 'Auction' | 'CancelProxy' | 'IdentityJudgement' | 'Governance' | 'NonTransfer' | 'Staking' | 'SudoBalances' | 'SudoBalances' | 'Society';

export interface Proxy {
  delay: number;
  delegate: string;
  proxyType: ProxyTypes;
  isAvailable?: boolean;
}

export interface ProxyItem {
  proxy: Proxy;
  status: 'current' | 'new' | 'remove';
}

export interface PriceAll {
  balances: DeriveBalancesAll;
  decimals: number;
  price: number;
}

export interface AddressPriceAll {
  [k: string]: PriceAll;
}

export interface RenameAcc {
  address: string;
  name: string;
  genesisHash: string;
}

export interface AccountMenuInfo {
  account: AccountJson | null;
  chain: Chain | null;
  formatted: string;
  type: KeypairType;
}

export interface Recoded {
  account: AccountJson | null;
  formatted: string | null;
  genesisHash?: string | null;
  prefix?: number;
  type: KeypairType;
}

export interface TransferTxInfo {
  amount: string;
  api: ApiPromise;
  block: number;
  chain: Chain;
  from: NameAddress;
  txHash: string;
  to: NameAddress;
  throughProxy: NameAddress | null;
  failureText: string;
  fee: Balance;
  status: string;
  token: string;
}

export interface Step { current: string | number, total: string | number }
export interface TokenPrice {
  [chainName: string]: Price;
}
export interface Price {
  amount: number;
  date?: number;
  token: string;
}

export interface SavedBalances {
  [chainName: string]: {
    balances: Record<string, string>;
    decimal: number;
    token: string;
    date: number;
  }
}
