// Copyright 2019-2026 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable sort-keys */

export default {
  'alliance.abdicateFellowStatus': {
    function: 'abdicateFellowStatus()',
    description: "Abdicate one's position as a voting member and just be an Ally. May be used by Fellows who do not want to leave the Alliance but do not have the capacity to participate operationally for some time."
  },
  'alliance.addUnscrupulousItems': {
    function: 'addUnscrupulousItems(items: `Vec<PalletAllianceUnscrupulousItem>`)',
    description: 'Add accounts or websites to the list of unscrupulous items.'
  },
  'alliance.announce': {
    function: 'announce(announcement: `PalletAllianceCid`)',
    description: 'Make an announcement of a new IPFS CID about alliance issues.'
  },
  'alliance.close': {
    function: 'close(proposal_hash: `H256`, index: `Compact<u32>`, proposal_weight_bound: `SpWeightsWeightV2Weight`, length_bound: `Compact<u32>`)',
    description: 'Close a vote that is either approved, disapproved, or whose voting period has ended.'
  },
  'alliance.disband': {
    function: 'disband(witness: `PalletAllianceDisbandWitness`)',
    description: 'Disband the Alliance, remove all active members and unreserve deposits.'
  },
  'alliance.elevateAlly': {
    function: 'elevateAlly(ally: `MultiAddress`)',
    description: 'Elevate an Ally to Fellow.'
  },
  'alliance.giveRetirementNotice': {
    function: 'giveRetirementNotice()',
    description: 'As a member, give a retirement notice and start a retirement period required to pass in order to retire.'
  },
  'alliance.initMembers': {
    function: 'initMembers(fellows: `Vec<AccountId32>`, allies: `Vec<AccountId32>`)',
    description: 'Initialize the Alliance, onboard fellows and allies.'
  },
  'alliance.joinAlliance': {
    function: 'joinAlliance()',
    description: 'Submit oneself for candidacy. A fixed deposit is reserved.'
  },
  'alliance.kickMember': {
    function: 'kickMember(who: `MultiAddress`)',
    description: 'Kick a member from the Alliance and slash its deposit.'
  },
  'alliance.nominateAlly': {
    function: 'nominateAlly(who: `MultiAddress`)',
    description: 'A Fellow can nominate someone to join the alliance as an Ally. There is no deposit required from the nominator or nominee.'
  },
  'alliance.propose': {
    function: 'propose(threshold: `Compact<u32>`, proposal: `Call`, length_bound: `Compact<u32>`)',
    description: 'Add a new proposal to be voted on.'
  },
  'alliance.removeAnnouncement': {
    function: 'removeAnnouncement(announcement: `PalletAllianceCid`)',
    description: 'Remove an announcement.'
  },
  'alliance.removeUnscrupulousItems': {
    function: 'removeUnscrupulousItems(items: `Vec<PalletAllianceUnscrupulousItem>`)',
    description: 'Deem some items no longer unscrupulous.'
  },
  'alliance.retire': {
    function: 'retire()',
    description: 'As a member, retire from the Alliance and unreserve the deposit.'
  },
  'alliance.setRule': {
    function: 'setRule(rule: `PalletAllianceCid`)',
    description: 'Set a new IPFS CID to the alliance rule.'
  },
  'alliance.vote': {
    function: 'vote(proposal: `H256`, index: `Compact<u32>`, approve: `bool`)',
    description: 'Add an aye or nay vote for the sender to the given proposal.'
  },
  'allianceMotion.close': {
    function: 'close(proposal_hash: `H256`, index: `Compact<u32>`, proposal_weight_bound: `SpWeightsWeightV2Weight`, length_bound: `Compact<u32>`)',
    description: 'Close a vote that is either approved, disapproved or whose voting period has ended. - `O(B + M + P1 + P2)` where: - `B` is `proposal` size in bytes (length-fee-bounded) - `M` is members-count (code- and governance-bounded) - `P1` is the complexity of `proposal` preimage. - `P2` is proposal-count (code-bounded).'
  },
  'allianceMotion.disapproveProposal': {
    function: 'disapproveProposal(proposal_hash: `H256`)',
    description: 'Disapprove a proposal, close, and remove it from the system, regardless of its current state.'
  },
  'allianceMotion.execute': {
    function: 'execute(proposal: `Call`, length_bound: `Compact<u32>`)',
    description: 'Dispatch a proposal from a member using the `Member` origin. - `O(B + M + P)` where: - `B` is `proposal` size in bytes (length-fee-bounded) - `M` members-count (code-bounded) - `P` complexity of dispatching `proposal`.'
  },
  'allianceMotion.kill': {
    function: 'kill(proposal_hash: `H256`)',
    description: 'Disapprove the proposal and burn the cost held for storing this proposal. - `origin`: must be the `KillOrigin`. - `proposal_hash`: The hash of the proposal that should be killed.'
  },
  'allianceMotion.propose': {
    function: 'propose(threshold: `Compact<u32>`, proposal: `Call`, length_bound: `Compact<u32>`)',
    description: 'Add a new proposal to either be voted on or executed directly. - `O(B + M + P1)` or `O(B + M + P2)` where: - `B` is `proposal` size in bytes (length-fee-bounded) - `M` is members-count (code- and governance-bounded) - branching is influenced by `threshold` where: - `P1` is proposal execution complexity (`threshold < 2`) - `P2` is proposals-count (code-bounded) (`threshold >= 2`).'
  },
  'allianceMotion.releaseProposalCost': {
    function: 'releaseProposalCost(proposal_hash: `H256`)',
    description: 'Release the cost held for storing a proposal once the given proposal is completed. - `origin`: must be `Signed` or `Root`. - `proposal_hash`: The hash of the proposal.'
  },
  'allianceMotion.setMembers': {
    function: 'setMembers(new_members: `Vec<AccountId32>`, prime: `Option<AccountId32>`, old_count: `u32`)',
    description: "Set the collective's membership. - `new_members`: The new member list. Be nice to the chain and provide it sorted. - `prime`: The prime member whose vote sets the default. - `old_count`: The upper bound for the previous number of members in storage. Used for weight estimation. - `O(MP + N)` where: - `M` old-members-count (code- and governance-bounded) - `N` new-members-count (code- and governance-bounded) - `P` proposals-count (code-bounded)."
  },
  'allianceMotion.vote': {
    function: 'vote(proposal: `H256`, index: `Compact<u32>`, approve: `bool`)',
    description: 'Add an aye or nay vote for the sender to the given proposal. - `O(M)` where `M` is members-count (code- and governance-bounded).'
  },
  'assetConversion.addLiquidity': {
    function: 'addLiquidity(asset1: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, asset2: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, amount1_desired: `u128`, amount2_desired: `u128`, amount1_min: `u128`, amount2_min: `u128`, mint_to: `AccountId32`)',
    description: "Provide liquidity into the pool of `asset1` and `asset2`. NOTE: an optimal amount of asset1 and asset2 will be calculated and might be different than the provided `amount1_desired`/`amount2_desired` thus you should provide the min amount you're happy to provide. Params `amount1_min`/`amount2_min` represent that. `mint_to` will be sent the liquidity tokens that represent this share of the pool."
  },
  'assetConversion.createPool': {
    function: 'createPool(asset1: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, asset2: `FrameSupportTokensFungibleUnionOfNativeOrWithId`)',
    description: 'Creates an empty liquidity pool and an associated new `lp_token` asset (the id of which is returned in the `Event::PoolCreated` event).'
  },
  'assetConversion.removeLiquidity': {
    function: 'removeLiquidity(asset1: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, asset2: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, lp_token_burn: `u128`, amount1_min_receive: `u128`, amount2_min_receive: `u128`, withdraw_to: `AccountId32`)',
    description: "Allows you to remove liquidity by providing the `lp_token_burn` tokens that will be burned in the process. With the usage of `amount1_min_receive`/`amount2_min_receive` it's possible to control the min amount of returned tokens you're happy with."
  },
  'assetConversion.swapExactTokensForTokens': {
    function: 'swapExactTokensForTokens(path: `Vec<FrameSupportTokensFungibleUnionOfNativeOrWithId>`, amount_in: `u128`, amount_out_min: `u128`, send_to: `AccountId32`, keep_alive: `bool`)',
    description: "Swap the exact amount of `asset1` into `asset2`. `amount_out_min` param allows you to specify the min amount of the `asset2` you're happy to receive."
  },
  'assetConversion.swapTokensForExactTokens': {
    function: 'swapTokensForExactTokens(path: `Vec<FrameSupportTokensFungibleUnionOfNativeOrWithId>`, amount_out: `u128`, amount_in_max: `u128`, send_to: `AccountId32`, keep_alive: `bool`)',
    description: "Swap any amount of `asset1` to get the exact amount of `asset2`. `amount_in_max` param allows to specify the max amount of the `asset1` you're happy to provide."
  },
  'assetConversion.touch': {
    function: 'touch(asset1: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, asset2: `FrameSupportTokensFungibleUnionOfNativeOrWithId`)',
    description: "Touch an existing pool to fulfill prerequisites before providing liquidity, such as ensuring that the pool's accounts are in place. It is typically useful when a pool creator removes the pool's accounts and does not provide a liquidity. This action may involve holding assets from the caller as a deposit for creating the pool's accounts. - `asset1`: The asset ID of an existing pool with a pair (asset1, asset2). - `asset2`: The asset ID of an existing pool with a pair (asset1, asset2)."
  },
  'assetConversionMigration.migrateToNewAccount': {
    function: 'migrateToNewAccount(asset1: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, asset2: `FrameSupportTokensFungibleUnionOfNativeOrWithId`)',
    description: 'Migrates an existing pool to a new account ID derivation method for a given asset pair. If the migration is successful, transaction fees are refunded to the caller.'
  },
  'assetRate.create': {
    function: 'create(asset_kind: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, rate: `u128`)',
    description: 'Initialize a conversion rate to native balance for the given asset. - O(1).'
  },
  'assetRate.remove': {
    function: 'remove(asset_kind: `FrameSupportTokensFungibleUnionOfNativeOrWithId`)',
    description: 'Remove an existing conversion rate to native balance for the given asset. - O(1).'
  },
  'assetRate.update': {
    function: 'update(asset_kind: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, rate: `u128`)',
    description: 'Update the conversion rate to native balance for the given asset. - O(1).'
  },
  'assetRewards.cleanupPool': {
    function: 'cleanupPool(pool_id: `u32`)',
    description: 'Cleanup a pool.'
  },
  'assetRewards.createPool': {
    function: 'createPool(staked_asset_id: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, reward_asset_id: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, reward_rate_per_block: `u128`, expiry: `FrameSupportScheduleDispatchTime`, admin: `Option<AccountId32>`)',
    description: 'Create a new reward pool. - `origin`: must be `Config::CreatePoolOrigin`; - `staked_asset_id`: the asset to be staked in the pool; - `reward_asset_id`: the asset to be distributed as rewards; - `reward_rate_per_block`: the amount of reward tokens distributed per block; - `expiry`: the block number at which the pool will cease to accumulate rewards. The [`DispatchTime::After`] variant evaluated at the execution time. - `admin`: the account allowed to extend the pool expiration, increase the rewards rate and receive the unutilized reward tokens back after the pool completion. If `None`, the caller is set as an admin.'
  },
  'assetRewards.depositRewardTokens': {
    function: 'depositRewardTokens(pool_id: `u32`, amount: `u128`)',
    description: 'Convenience method to deposit reward tokens into a pool.'
  },
  'assetRewards.harvestRewards': {
    function: 'harvestRewards(pool_id: `u32`, staker: `Option<AccountId32>`)',
    description: 'Harvest unclaimed pool rewards. - origin: must be the `staker` if the pool is still active. Otherwise, any account. - pool_id: the pool to harvest from. - staker: the account for which to harvest rewards. If `None`, the caller is used.'
  },
  'assetRewards.setPoolAdmin': {
    function: 'setPoolAdmin(pool_id: `u32`, new_admin: `AccountId32`)',
    description: 'Modify a pool admin.'
  },
  'assetRewards.setPoolExpiryBlock': {
    function: 'setPoolExpiryBlock(pool_id: `u32`, new_expiry: `FrameSupportScheduleDispatchTime`)',
    description: 'Set when the pool should expire.'
  },
  'assetRewards.setPoolRewardRatePerBlock': {
    function: 'setPoolRewardRatePerBlock(pool_id: `u32`, new_reward_rate_per_block: `u128`)',
    description: 'Modify a pool reward rate.'
  },
  'assetRewards.stake': {
    function: 'stake(pool_id: `u32`, amount: `u128`)',
    description: 'Stake additional tokens in a pool.'
  },
  'assetRewards.unstake': {
    function: 'unstake(pool_id: `u32`, amount: `u128`, staker: `Option<AccountId32>`)',
    description: 'Unstake tokens from a pool. - origin: must be the `staker` if the pool is still active. Otherwise, any account. - pool_id: the pool to unstake from. - amount: the amount of tokens to unstake. - staker: the account to unstake from. If `None`, the caller is used.'
  },
  'assets.approveTransfer': {
    function: 'approveTransfer(id: `Compact<u32>`, delegate: `MultiAddress`, amount: `Compact<u128>`)',
    description: 'Approve an amount of asset for transfer by a delegated third-party account. - `id`: The identifier of the asset. - `delegate`: The account to delegate permission to transfer asset. - `amount`: The amount of asset that may be transferred by `delegate`. If there is already an approval in place, then this acts additively.'
  },
  'assets.block': {
    function: 'block(id: `Compact<u32>`, who: `MultiAddress`)',
    description: "Disallow further unprivileged transfers of an asset `id` to and from an account `who`. - `id`: The identifier of the account's asset. - `who`: The account to be unblocked."
  },
  'assets.burn': {
    function: 'burn(id: `Compact<u32>`, who: `MultiAddress`, amount: `Compact<u128>`)',
    description: "Reduce the balance of `who` by as much as possible up to `amount` assets of `id`. - `id`: The identifier of the asset to have some amount burned. - `who`: The account to be debited from. - `amount`: The maximum amount by which `who`'s balance should be reduced."
  },
  'assets.cancelApproval': {
    function: 'cancelApproval(id: `Compact<u32>`, delegate: `MultiAddress`)',
    description: 'Cancel all of some asset approved for delegated transfer by a third-party account. - `id`: The identifier of the asset. - `delegate`: The account delegated permission to transfer asset.'
  },
  'assets.clearMetadata': {
    function: 'clearMetadata(id: `Compact<u32>`)',
    description: 'Clear the metadata for an asset. - `id`: The identifier of the asset to clear.'
  },
  'assets.create': {
    function: 'create(id: `Compact<u32>`, admin: `MultiAddress`, min_balance: `u128`)',
    description: "Issue a new class of fungible assets from a public origin. - `id`: The identifier of the new asset. This must not be currently in use to identify an existing asset. If [`NextAssetId`] is set, then this must be equal to it. - `admin`: The admin of this class of assets. The admin is the initial address of each member of the asset class's admin team. - `min_balance`: The minimum balance of this new asset that any single account must have. If an account's balance is reduced below this, then it collapses to zero."
  },
  'assets.destroyAccounts': {
    function: 'destroyAccounts(id: `Compact<u32>`)',
    description: 'Destroy all accounts associated with a given asset. - `id`: The identifier of the asset to be destroyed. This must identify an existing asset.'
  },
  'assets.destroyApprovals': {
    function: 'destroyApprovals(id: `Compact<u32>`)',
    description: 'Destroy all approvals associated with a given asset up to the max (T::RemoveItemsLimit). - `id`: The identifier of the asset to be destroyed. This must identify an existing asset.'
  },
  'assets.finishDestroy': {
    function: 'finishDestroy(id: `Compact<u32>`)',
    description: 'Complete destroying asset and unreserve currency. - `id`: The identifier of the asset to be destroyed. This must identify an existing asset.'
  },
  'assets.forceAssetStatus': {
    function: 'forceAssetStatus(id: `Compact<u32>`, owner: `MultiAddress`, issuer: `MultiAddress`, admin: `MultiAddress`, freezer: `MultiAddress`, min_balance: `Compact<u128>`, is_sufficient: `bool`, is_frozen: `bool`)',
    description: "Alter the attributes of a given asset. - `id`: The identifier of the asset. - `owner`: The new Owner of this asset. - `issuer`: The new Issuer of this asset. - `admin`: The new Admin of this asset. - `freezer`: The new Freezer of this asset. - `min_balance`: The minimum balance of this new asset that any single account must have. If an account's balance is reduced below this, then it collapses to zero. - `is_sufficient`: Whether a non-zero balance of this asset is deposit of sufficient value to account for the state bloat associated with its balance storage. If set to `true`, then non-zero balances may be stored without a `consumer` reference (and thus an ED in the Balances pallet or whatever else is used to control user-account state growth). - `is_frozen`: Whether this asset class is frozen except for permissioned/admin instructions."
  },
  'assets.forceCancelApproval': {
    function: 'forceCancelApproval(id: `Compact<u32>`, owner: `MultiAddress`, delegate: `MultiAddress`)',
    description: 'Cancel all of some asset approved for delegated transfer by a third-party account. - `id`: The identifier of the asset. - `delegate`: The account delegated permission to transfer asset.'
  },
  'assets.forceClearMetadata': {
    function: 'forceClearMetadata(id: `Compact<u32>`)',
    description: 'Clear the metadata for an asset. - `id`: The identifier of the asset to clear.'
  },
  'assets.forceCreate': {
    function: 'forceCreate(id: `Compact<u32>`, owner: `MultiAddress`, is_sufficient: `bool`, min_balance: `Compact<u128>`)',
    description: "Issue a new class of fungible assets from a privileged origin. - `id`: The identifier of the new asset. This must not be currently in use to identify an existing asset. If [`NextAssetId`] is set, then this must be equal to it. - `owner`: The owner of this class of assets. The owner has full superuser permissions over this asset, but may later change and configure the permissions using `transfer_ownership` and `set_team`. - `min_balance`: The minimum balance of this new asset that any single account must have. If an account's balance is reduced below this, then it collapses to zero."
  },
  'assets.forceSetMetadata': {
    function: 'forceSetMetadata(id: `Compact<u32>`, name: `Bytes`, symbol: `Bytes`, decimals: `u8`, is_frozen: `bool`)',
    description: 'Force the metadata for an asset to some value. - `id`: The identifier of the asset to update. - `name`: The user friendly name of this asset. Limited in length by `StringLimit`. - `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`. - `decimals`: The number of decimals this asset uses to represent one unit.'
  },
  'assets.forceTransfer': {
    function: 'forceTransfer(id: `Compact<u32>`, source: `MultiAddress`, dest: `MultiAddress`, amount: `Compact<u128>`)',
    description: "Move some assets from one account to another. - `id`: The identifier of the asset to have some amount transferred. - `source`: The account to be debited. - `dest`: The account to be credited. - `amount`: The amount by which the `source`'s balance of assets should be reduced and `dest`'s balance increased. The amount actually transferred may be slightly greater in the case that the transfer would otherwise take the `source` balance above zero but below the minimum balance. Must be greater than zero."
  },
  'assets.freeze': {
    function: 'freeze(id: `Compact<u32>`, who: `MultiAddress`)',
    description: 'Disallow further unprivileged transfers of an asset `id` from an account `who`. `who` must already exist as an entry in `Account`s of the asset. If you want to freeze an account that does not have an entry, use `touch_other` first. - `id`: The identifier of the asset to be frozen. - `who`: The account to be frozen.'
  },
  'assets.freezeAsset': {
    function: 'freezeAsset(id: `Compact<u32>`)',
    description: 'Disallow further unprivileged transfers for the asset class. - `id`: The identifier of the asset to be frozen.'
  },
  'assets.mint': {
    function: 'mint(id: `Compact<u32>`, beneficiary: `MultiAddress`, amount: `Compact<u128>`)',
    description: 'Mint assets of a particular class. - `id`: The identifier of the asset to have some amount minted. - `beneficiary`: The account to be credited with the minted assets. - `amount`: The amount of the asset to be minted.'
  },
  'assets.refund': {
    function: 'refund(id: `Compact<u32>`, allow_burn: `bool`)',
    description: 'Return the deposit (if any) of an asset account or a consumer reference (if any) of an account. - `id`: The identifier of the asset for which the caller would like the deposit refunded. - `allow_burn`: If `true` then assets may be destroyed in order to complete the refund.'
  },
  'assets.refundOther': {
    function: 'refundOther(id: `Compact<u32>`, who: `MultiAddress`)',
    description: 'Return the deposit (if any) of a target asset account. Useful if you are the depositor. - `id`: The identifier of the asset for the account holding a deposit. - `who`: The account to refund.'
  },
  'assets.setMetadata': {
    function: 'setMetadata(id: `Compact<u32>`, name: `Bytes`, symbol: `Bytes`, decimals: `u8`)',
    description: 'Set the metadata for an asset. - `id`: The identifier of the asset to update. - `name`: The user friendly name of this asset. Limited in length by `StringLimit`. - `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`. - `decimals`: The number of decimals this asset uses to represent one unit.'
  },
  'assets.setMinBalance': {
    function: 'setMinBalance(id: `Compact<u32>`, min_balance: `u128`)',
    description: 'Sets the minimum balance of an asset. - `id`: The identifier of the asset. - `min_balance`: The new value of `min_balance`.'
  },
  'assets.setTeam': {
    function: 'setTeam(id: `Compact<u32>`, issuer: `MultiAddress`, admin: `MultiAddress`, freezer: `MultiAddress`)',
    description: 'Change the Issuer, Admin and Freezer of an asset. - `id`: The identifier of the asset to be frozen. - `issuer`: The new Issuer of this asset. - `admin`: The new Admin of this asset. - `freezer`: The new Freezer of this asset.'
  },
  'assets.startDestroy': {
    function: 'startDestroy(id: `Compact<u32>`)',
    description: 'Start the process of destroying a fungible asset class. - `id`: The identifier of the asset to be destroyed. This must identify an existing asset.'
  },
  'assets.thaw': {
    function: 'thaw(id: `Compact<u32>`, who: `MultiAddress`)',
    description: 'Allow unprivileged transfers to and from an account again. - `id`: The identifier of the asset to be frozen. - `who`: The account to be unfrozen.'
  },
  'assets.thawAsset': {
    function: 'thawAsset(id: `Compact<u32>`)',
    description: 'Allow unprivileged transfers for the asset again. - `id`: The identifier of the asset to be thawed.'
  },
  'assets.touch': {
    function: 'touch(id: `Compact<u32>`)',
    description: 'Create an asset account for non-provider assets. - `origin`: Must be Signed; the signer account must have sufficient funds for a deposit to be taken. - `id`: The identifier of the asset for the account to be created.'
  },
  'assets.touchOther': {
    function: 'touchOther(id: `Compact<u32>`, who: `MultiAddress`)',
    description: 'Create an asset account for `who`. - `origin`: Must be Signed by `Freezer` or `Admin` of the asset `id`; the signer account must have sufficient funds for a deposit to be taken. - `id`: The identifier of the asset for the account to be created. - `who`: The account to be created.'
  },
  'assets.transfer': {
    function: 'transfer(id: `Compact<u32>`, target: `MultiAddress`, amount: `Compact<u128>`)',
    description: "Move some assets from the sender account to another. - `id`: The identifier of the asset to have some amount transferred. - `target`: The account to be credited. - `amount`: The amount by which the sender's balance of assets should be reduced and `target`'s balance increased. The amount actually transferred may be slightly greater in the case that the transfer would otherwise take the sender balance above zero but below the minimum balance. Must be greater than zero."
  },
  'assets.transferAll': {
    function: 'transferAll(id: `Compact<u32>`, dest: `MultiAddress`, keep_alive: `bool`)',
    description: 'Transfer the entire transferable balance from the caller asset account. - `id`: The identifier of the asset for the account holding a deposit. - `dest`: The recipient of the transfer. - `keep_alive`: A boolean to determine if the `transfer_all` operation should send all of the funds the asset account has, causing the sender asset account to be killed (false), or transfer everything except at least the minimum balance, which will guarantee to keep the sender asset account alive (true).'
  },
  'assets.transferApproved': {
    function: 'transferApproved(id: `Compact<u32>`, owner: `MultiAddress`, destination: `MultiAddress`, amount: `Compact<u128>`)',
    description: 'Transfer some asset balance from a previously delegated account to some third-party account. - `id`: The identifier of the asset. - `owner`: The account which previously approved for a transfer of at least `amount` and from which the asset balance will be withdrawn. - `destination`: The account to which the asset balance of `amount` will be transferred. - `amount`: The amount of assets to transfer.'
  },
  'assets.transferKeepAlive': {
    function: 'transferKeepAlive(id: `Compact<u32>`, target: `MultiAddress`, amount: `Compact<u128>`)',
    description: "Move some assets from the sender account to another, keeping the sender account alive. - `id`: The identifier of the asset to have some amount transferred. - `target`: The account to be credited. - `amount`: The amount by which the sender's balance of assets should be reduced and `target`'s balance increased. The amount actually transferred may be slightly greater in the case that the transfer would otherwise take the sender balance above zero but below the minimum balance. Must be greater than zero."
  },
  'assets.transferOwnership': {
    function: 'transferOwnership(id: `Compact<u32>`, owner: `MultiAddress`)',
    description: 'Change the Owner of an asset. - `id`: The identifier of the asset. - `owner`: The new Owner of this asset.'
  },
  'babe.planConfigChange': {
    function: 'planConfigChange(config: `SpConsensusBabeDigestsNextConfigDescriptor`)',
    description: 'Plan an epoch config change. The epoch config change is recorded and will be enacted on the next call to `enact_epoch_change`. The config will be activated one epoch after. Multiple calls to this method will replace any existing planned config change that had not been enacted yet.'
  },
  'babe.reportEquivocation': {
    function: 'reportEquivocation(equivocation_proof: `SpConsensusSlotsEquivocationProof`, key_owner_proof: `SpSessionMembershipProof`)',
    description: 'Report authority equivocation/misbehavior. This method will verify the equivocation proof and validate the given key ownership proof against the extracted offender. If both are valid, the offence will be reported.'
  },
  'babe.reportEquivocationUnsigned': {
    function: 'reportEquivocationUnsigned(equivocation_proof: `SpConsensusSlotsEquivocationProof`, key_owner_proof: `SpSessionMembershipProof`)',
    description: 'Report authority equivocation/misbehavior. This method will verify the equivocation proof and validate the given key ownership proof against the extracted offender. If both are valid, the offence will be reported. This extrinsic must be called unsigned and it is expected that only block authors will call it (validated in `ValidateUnsigned`), as such if the block author is defined it will be defined as the equivocation reporter.'
  },
  'balances.burn': {
    function: 'burn(value: `Compact<u128>`, keep_alive: `bool`)',
    description: 'Burn the specified liquid free balance from the origin account.'
  },
  'balances.forceAdjustTotalIssuance': {
    function: 'forceAdjustTotalIssuance(direction: `PalletBalancesAdjustmentDirection`, delta: `Compact<u128>`)',
    description: 'Adjust the total issuance in a saturating way.'
  },
  'balances.forceSetBalance': {
    function: 'forceSetBalance(who: `MultiAddress`, new_free: `Compact<u128>`)',
    description: 'Set the regular balance of a given account.'
  },
  'balances.forceTransfer': {
    function: 'forceTransfer(source: `MultiAddress`, dest: `MultiAddress`, value: `Compact<u128>`)',
    description: 'Exactly as `transfer_allow_death`, except the origin must be root and the source account may be specified.'
  },
  'balances.forceUnreserve': {
    function: 'forceUnreserve(who: `MultiAddress`, amount: `u128`)',
    description: 'Unreserve some balance from a user by force.'
  },
  'balances.transferAll': {
    function: 'transferAll(dest: `MultiAddress`, keep_alive: `bool`)',
    description: 'Transfer the entire transferable balance from the caller account. - `dest`: The recipient of the transfer. - `keep_alive`: A boolean to determine if the `transfer_all` operation should send all of the funds the account has, causing the sender account to be killed (false), or transfer everything except at least the existential deposit, which will guarantee to keep the sender account alive (true).'
  },
  'balances.transferAllowDeath': {
    function: 'transferAllowDeath(dest: `MultiAddress`, value: `Compact<u128>`)',
    description: 'Transfer some liquid free balance to another account.'
  },
  'balances.transferKeepAlive': {
    function: 'transferKeepAlive(dest: `MultiAddress`, value: `Compact<u128>`)',
    description: 'Transfer some liquid free balance to another account, but with a check that the transfer will not kill the origin account.'
  },
  'balances.upgradeAccounts': {
    function: 'upgradeAccounts(who: `Vec<AccountId32>`)',
    description: 'Upgrade a specified account. - `origin`: Must be `Signed`. - `who`: The account to be upgraded.'
  },
  'beefy.reportDoubleVoting': {
    function: 'reportDoubleVoting(equivocation_proof: `SpConsensusBeefyDoubleVotingProof`, key_owner_proof: `SpSessionMembershipProof`)',
    description: 'Report voter equivocation/misbehavior. This method will verify the equivocation proof and validate the given key ownership proof against the extracted offender. If both are valid, the offence will be reported.'
  },
  'beefy.reportDoubleVotingUnsigned': {
    function: 'reportDoubleVotingUnsigned(equivocation_proof: `SpConsensusBeefyDoubleVotingProof`, key_owner_proof: `SpSessionMembershipProof`)',
    description: 'Report voter equivocation/misbehavior. This method will verify the equivocation proof and validate the given key ownership proof against the extracted offender. If both are valid, the offence will be reported.'
  },
  'beefy.reportForkVoting': {
    function: 'reportForkVoting(equivocation_proof: `SpConsensusBeefyForkVotingProofAncestryProof`, key_owner_proof: `SpSessionMembershipProof`)',
    description: 'Report fork voting equivocation. This method will verify the equivocation proof and validate the given key ownership proof against the extracted offender. If both are valid, the offence will be reported.'
  },
  'beefy.reportForkVotingUnsigned': {
    function: 'reportForkVotingUnsigned(equivocation_proof: `SpConsensusBeefyForkVotingProofAncestryProof`, key_owner_proof: `SpSessionMembershipProof`)',
    description: 'Report fork voting equivocation. This method will verify the equivocation proof and validate the given key ownership proof against the extracted offender. If both are valid, the offence will be reported.'
  },
  'beefy.reportFutureBlockVoting': {
    function: 'reportFutureBlockVoting(equivocation_proof: `SpConsensusBeefyFutureBlockVotingProof`, key_owner_proof: `SpSessionMembershipProof`)',
    description: 'Report future block voting equivocation. This method will verify the equivocation proof and validate the given key ownership proof against the extracted offender. If both are valid, the offence will be reported.'
  },
  'beefy.reportFutureBlockVotingUnsigned': {
    function: 'reportFutureBlockVotingUnsigned(equivocation_proof: `SpConsensusBeefyFutureBlockVotingProof`, key_owner_proof: `SpSessionMembershipProof`)',
    description: 'Report future block voting equivocation. This method will verify the equivocation proof and validate the given key ownership proof against the extracted offender. If both are valid, the offence will be reported.'
  },
  'beefy.setNewGenesis': {
    function: 'setNewGenesis(delay_in_blocks: `u32`)',
    description: 'Reset BEEFY consensus by setting a new BEEFY genesis at `delay_in_blocks` blocks in the future.'
  },
  'bounties.acceptCurator': {
    function: 'acceptCurator(bounty_id: `Compact<u32>`)',
    description: 'Accept the curator role for a bounty. A deposit will be reserved from curator and refund upon successful payout. - O(1).'
  },
  'bounties.approveBounty': {
    function: 'approveBounty(bounty_id: `Compact<u32>`)',
    description: 'Approve a bounty proposal. At a later time, the bounty will be funded and become active and the original deposit will be returned. - O(1).'
  },
  'bounties.approveBountyWithCurator': {
    function: 'approveBountyWithCurator(bounty_id: `Compact<u32>`, curator: `MultiAddress`, fee: `Compact<u128>`)',
    description: 'Approve the bounty and propose a curator simultaneously. This call is a shortcut to calling `approve_bounty` and `propose_curator` separately. - `bounty_id`: Bounty ID to approve. - `curator`: The curator account whom will manage this bounty. - `fee`: The curator fee. - O(1).'
  },
  'bounties.awardBounty': {
    function: 'awardBounty(bounty_id: `Compact<u32>`, beneficiary: `MultiAddress`)',
    description: 'Award bounty to a beneficiary account. The beneficiary will be able to claim the funds after a delay. - `bounty_id`: Bounty ID to award. - `beneficiary`: The beneficiary account whom will receive the payout. - O(1).'
  },
  'bounties.claimBounty': {
    function: 'claimBounty(bounty_id: `Compact<u32>`)',
    description: 'Claim the payout from an awarded bounty after payout delay. - `bounty_id`: Bounty ID to claim. - O(1).'
  },
  'bounties.closeBounty': {
    function: 'closeBounty(bounty_id: `Compact<u32>`)',
    description: 'Cancel a proposed or active bounty. All the funds will be sent to treasury and the curator deposit will be unreserved if possible. - `bounty_id`: Bounty ID to cancel. - O(1).'
  },
  'bounties.extendBountyExpiry': {
    function: 'extendBountyExpiry(bounty_id: `Compact<u32>`, remark: `Bytes`)',
    description: 'Extend the expiry time of an active bounty. - `bounty_id`: Bounty ID to extend. - `remark`: additional information. - O(1).'
  },
  'bounties.proposeBounty': {
    function: 'proposeBounty(value: `Compact<u128>`, description: `Bytes`)',
    description: 'Propose a new bounty. - `curator`: The curator account whom will manage this bounty. - `fee`: The curator fee. - `value`: The total payment amount of this bounty, curator fee included. - `description`: The description of this bounty.'
  },
  'bounties.proposeCurator': {
    function: 'proposeCurator(bounty_id: `Compact<u32>`, curator: `MultiAddress`, fee: `Compact<u128>`)',
    description: 'Propose a curator to a funded bounty. - O(1).'
  },
  'bounties.unassignCurator': {
    function: 'unassignCurator(bounty_id: `Compact<u32>`)',
    description: 'Unassign curator from a bounty. - O(1).'
  },
  'broker.assign': {
    function: 'assign(region_id: `PalletBrokerRegionId`, task: `u32`, finality: `PalletBrokerFinality`)',
    description: 'Assign a Bulk Coretime Region to a task. - `origin`: Must be a Signed origin of the account which owns the Region `region_id`. - `region_id`: The Region which should be assigned to the task. - `task`: The task to assign. - `finality`: Indication of whether this assignment is final (in which case it may be eligible for renewal) or provisional (in which case it may be manipulated and/or reassigned at a later stage).'
  },
  'broker.claimRevenue': {
    function: 'claimRevenue(region_id: `PalletBrokerRegionId`, max_timeslices: `u32`)',
    description: 'Claim the revenue owed from inclusion in the Instantaneous Coretime Pool. - `origin`: Must be a Signed origin. - `region_id`: The Region which was assigned to the Pool. - `max_timeslices`: The maximum number of timeslices which should be processed. This must be greater than 0. This may affect the weight of the call but should be ideally made equivalent to the length of the Region `region_id`. If less, further dispatches will be required with the same `region_id` to claim revenue for the remainder.'
  },
  'broker.configure': {
    function: 'configure(config: `PalletBrokerConfigRecord`)',
    description: 'Configure the pallet. - `origin`: Must be Root or pass `AdminOrigin`. - `config`: The configuration for this pallet.'
  },
  'broker.disableAutoRenew': {
    function: 'disableAutoRenew(core: `u16`, task: `u32`)',
    description: 'Extrinsic for disabling auto renewal. - `origin`: Must be the sovereign account of the task. - `core`: The core for which we want to disable auto renewal. - `task`: The task for which we want to disable auto renewal.'
  },
  'broker.dropContribution': {
    function: 'dropContribution(region_id: `PalletBrokerRegionId`)',
    description: 'Drop an expired Instantaneous Pool Contribution record from the chain. - `origin`: Can be any kind of origin. - `region_id`: The Region identifying the Pool Contribution which has expired.'
  },
  'broker.dropHistory': {
    function: 'dropHistory(when: `u32`)',
    description: 'Drop an expired Instantaneous Pool History record from the chain. - `origin`: Can be any kind of origin. - `region_id`: The time of the Pool History record which has expired.'
  },
  'broker.dropRegion': {
    function: 'dropRegion(region_id: `PalletBrokerRegionId`)',
    description: 'Drop an expired Region from the chain. - `origin`: Can be any kind of origin. - `region_id`: The Region which has expired.'
  },
  'broker.dropRenewal': {
    function: 'dropRenewal(core: `u16`, when: `u32`)',
    description: 'Drop an expired Allowed Renewal record from the chain. - `origin`: Can be any kind of origin. - `core`: The core to which the expired renewal refers. - `when`: The timeslice to which the expired renewal refers. This must have passed.'
  },
  'broker.enableAutoRenew': {
    function: 'enableAutoRenew(core: `u16`, task: `u32`, workload_end_hint: `Option<u32>`)',
    description: 'Extrinsic for enabling auto renewal. - `origin`: Must be the sovereign account of the task - `core`: The core to which the task to be renewed is currently assigned. - `task`: The task for which we want to enable auto renewal. - `workload_end_hint`: should be used when enabling auto-renewal for a core that is not expiring in the upcoming bulk period (e.g., due to holding a lease) since it would be inefficient to look up when the core expires to schedule the next renewal.'
  },
  'broker.forceReserve': {
    function: 'forceReserve(workload: `Vec<PalletBrokerScheduleItem>`, core: `u16`)',
    description: 'Reserve a core for a workload immediately. - `origin`: Must be Root or pass `AdminOrigin`. - `workload`: The workload which should be permanently placed on a core starting immediately. - `core`: The core to which the assignment should be made until the reservation takes effect. It is left to the caller to either add this new core or reassign any other tasks to this existing core.'
  },
  'broker.interlace': {
    function: 'interlace(region_id: `PalletBrokerRegionId`, pivot: `PalletBrokerCoreMask`)',
    description: "Split a Bulk Coretime Region into two wholly-overlapping Regions with complementary interlace masks which together make up the original Region's interlace mask. - `origin`: Must be a Signed origin of the account which owns the Region `region_id`. - `region_id`: The Region which should become two interlaced Regions of incomplete regularity. - `pivot`: The interlace mask of one of the two new regions (the other is its partial complement)."
  },
  'broker.partition': {
    function: 'partition(region_id: `PalletBrokerRegionId`, pivot: `u32`)',
    description: 'Split a Bulk Coretime Region into two non-overlapping Regions at a particular time into the region. - `origin`: Must be a Signed origin of the account which owns the Region `region_id`. - `region_id`: The Region which should be partitioned into two non-overlapping Regions. - `pivot`: The offset in time into the Region at which to make the split.'
  },
  'broker.pool': {
    function: 'pool(region_id: `PalletBrokerRegionId`, payee: `AccountId32`, finality: `PalletBrokerFinality`)',
    description: 'Place a Bulk Coretime Region into the Instantaneous Coretime Pool. - `origin`: Must be a Signed origin of the account which owns the Region `region_id`. - `region_id`: The Region which should be assigned to the Pool. - `payee`: The account which is able to collect any revenue due for the usage of this Coretime.'
  },
  'broker.purchase': {
    function: 'purchase(price_limit: `u128`)',
    description: 'Purchase Bulk Coretime in the ongoing Sale. - `origin`: Must be a Signed origin with at least enough funds to pay the current price of Bulk Coretime. - `price_limit`: An amount no more than which should be paid.'
  },
  'broker.purchaseCredit': {
    function: 'purchaseCredit(amount: `u128`, beneficiary: `AccountId32`)',
    description: "Purchase credit for use in the Instantaneous Coretime Pool. - `origin`: Must be a Signed origin able to pay at least `amount`. - `amount`: The amount of credit to purchase. - `beneficiary`: The account on the Relay-chain which controls the credit (generally this will be the collator's hot wallet)."
  },
  'broker.removeAssignment': {
    function: 'removeAssignment(region_id: `PalletBrokerRegionId`)',
    description: 'Remove an assignment from the Workplan. - `origin`: Must be Root or pass `AdminOrigin`. - `region_id`: The Region to be removed from the workplan.'
  },
  'broker.removeLease': {
    function: 'removeLease(task: `u32`)',
    description: 'Remove a lease. - `origin`: Must be Root or pass `AdminOrigin`. - `task`: The task id of the lease which should be removed.'
  },
  'broker.renew': {
    function: 'renew(core: `u16`)',
    description: 'Renew Bulk Coretime in the ongoing Sale or its prior Interlude Period. - `origin`: Must be a Signed origin with at least enough funds to pay the renewal price of the core. - `core`: The core which should be renewed.'
  },
  'broker.requestCoreCount': {
    function: 'requestCoreCount(core_count: `u16`)',
    description: 'Request a change to the number of cores available for scheduling work. - `origin`: Must be Root or pass `AdminOrigin`. - `core_count`: The desired number of cores to be made available.'
  },
  'broker.reserve': {
    function: 'reserve(workload: `Vec<PalletBrokerScheduleItem>`)',
    description: 'Reserve a core for a workload. - `origin`: Must be Root or pass `AdminOrigin`. - `workload`: The workload which should be permanently placed on a core.'
  },
  'broker.setLease': {
    function: 'setLease(task: `u32`, until: `u32`)',
    description: 'Reserve a core for a single task workload for a limited period. - `origin`: Must be Root or pass `AdminOrigin`. - `task`: The workload which should be placed on a core. - `until`: The timeslice now earlier than which `task` should be placed as a workload on a core.'
  },
  'broker.startSales': {
    function: 'startSales(end_price: `u128`, extra_cores: `u16`)',
    description: 'Begin the Bulk Coretime sales rotation. - `origin`: Must be Root or pass `AdminOrigin`. - `end_price`: The price after the leading period of Bulk Coretime in the first sale. - `extra_cores`: Number of extra cores that should be requested on top of the cores required for `Reservations` and `Leases`.'
  },
  'broker.transfer': {
    function: 'transfer(region_id: `PalletBrokerRegionId`, new_owner: `AccountId32`)',
    description: 'Transfer a Bulk Coretime Region to a new owner. - `origin`: Must be a Signed origin of the account which owns the Region `region_id`. - `region_id`: The Region whose ownership should change. - `new_owner`: The new owner for the Region.'
  },
  'broker.unreserve': {
    function: 'unreserve(item_index: `u32`)',
    description: "Cancel a reservation for a workload. - `origin`: Must be Root or pass `AdminOrigin`. - `item_index`: The index of the reservation. Usually this will also be the index of the core on which the reservation has been scheduled. However, it is possible that if other cores are reserved or unreserved in the same sale rotation that they won't correspond, so it's better to look up the core properly in the `Reservations` storage."
  },
  'childBounties.acceptCurator': {
    function: 'acceptCurator(parent_bounty_id: `Compact<u32>`, child_bounty_id: `Compact<u32>`)',
    description: 'Accept the curator role for the child-bounty. - `parent_bounty_id`: Index of parent bounty. - `child_bounty_id`: Index of child bounty.'
  },
  'childBounties.addChildBounty': {
    function: 'addChildBounty(parent_bounty_id: `Compact<u32>`, value: `Compact<u128>`, description: `Bytes`)',
    description: 'Add a new child-bounty. - `parent_bounty_id`: Index of parent bounty for which child-bounty is being added. - `value`: Value for executing the proposal. - `description`: Text description for the child-bounty.'
  },
  'childBounties.awardChildBounty': {
    function: 'awardChildBounty(parent_bounty_id: `Compact<u32>`, child_bounty_id: `Compact<u32>`, beneficiary: `MultiAddress`)',
    description: 'Award child-bounty to a beneficiary. - `parent_bounty_id`: Index of parent bounty. - `child_bounty_id`: Index of child bounty. - `beneficiary`: Beneficiary account.'
  },
  'childBounties.claimChildBounty': {
    function: 'claimChildBounty(parent_bounty_id: `Compact<u32>`, child_bounty_id: `Compact<u32>`)',
    description: 'Claim the payout from an awarded child-bounty after payout delay. - `parent_bounty_id`: Index of parent bounty. - `child_bounty_id`: Index of child bounty.'
  },
  'childBounties.closeChildBounty': {
    function: 'closeChildBounty(parent_bounty_id: `Compact<u32>`, child_bounty_id: `Compact<u32>`)',
    description: 'Cancel a proposed or active child-bounty. Child-bounty account funds are transferred to parent bounty account. The child-bounty curator deposit may be unreserved if possible. - `parent_bounty_id`: Index of parent bounty. - `child_bounty_id`: Index of child bounty.'
  },
  'childBounties.proposeCurator': {
    function: 'proposeCurator(parent_bounty_id: `Compact<u32>`, child_bounty_id: `Compact<u32>`, curator: `MultiAddress`, fee: `Compact<u128>`)',
    description: 'Propose curator for funded child-bounty. - `parent_bounty_id`: Index of parent bounty. - `child_bounty_id`: Index of child bounty. - `curator`: Address of child-bounty curator. - `fee`: payment fee to child-bounty curator for execution.'
  },
  'childBounties.unassignCurator': {
    function: 'unassignCurator(parent_bounty_id: `Compact<u32>`, child_bounty_id: `Compact<u32>`)',
    description: 'Unassign curator from a child-bounty. - `parent_bounty_id`: Index of parent bounty. - `child_bounty_id`: Index of child bounty.'
  },
  'contracts.call': {
    function: 'call(dest: `MultiAddress`, value: `Compact<u128>`, gas_limit: `SpWeightsWeightV2Weight`, storage_deposit_limit: `Option<Compact<u128>>`, data: `Bytes`)',
    description: 'Makes a call to an account, optionally transferring some balance.'
  },
  'contracts.callOldWeight': {
    function: 'callOldWeight(dest: `MultiAddress`, value: `Compact<u128>`, gas_limit: `Compact<u64>`, storage_deposit_limit: `Option<Compact<u128>>`, data: `Bytes`)',
    description: 'Deprecated version if [`Self::call`] for use in an in-storage `Call`.'
  },
  'contracts.instantiate': {
    function: 'instantiate(value: `Compact<u128>`, gas_limit: `SpWeightsWeightV2Weight`, storage_deposit_limit: `Option<Compact<u128>>`, code_hash: `H256`, data: `Bytes`, salt: `Bytes`)',
    description: 'Instantiates a contract from a previously deployed wasm binary.'
  },
  'contracts.instantiateOldWeight': {
    function: 'instantiateOldWeight(value: `Compact<u128>`, gas_limit: `Compact<u64>`, storage_deposit_limit: `Option<Compact<u128>>`, code_hash: `H256`, data: `Bytes`, salt: `Bytes`)',
    description: 'Deprecated version if [`Self::instantiate`] for use in an in-storage `Call`.'
  },
  'contracts.instantiateWithCode': {
    function: 'instantiateWithCode(value: `Compact<u128>`, gas_limit: `SpWeightsWeightV2Weight`, storage_deposit_limit: `Option<Compact<u128>>`, code: `Bytes`, data: `Bytes`, salt: `Bytes`)',
    description: 'Instantiates a new contract from the supplied `code` optionally transferring some balance. - The supplied `code` is deployed, and a `code_hash` is created for that code. - If the `code_hash` already exists on the chain the underlying `code` will be shared. - The destination address is computed based on the sender, code_hash and the salt. - The smart-contract account is created at the computed address. - The `value` is transferred to the new account. - The `deploy` function is executed in the context of the newly-created account.'
  },
  'contracts.instantiateWithCodeOldWeight': {
    function: 'instantiateWithCodeOldWeight(value: `Compact<u128>`, gas_limit: `Compact<u64>`, storage_deposit_limit: `Option<Compact<u128>>`, code: `Bytes`, data: `Bytes`, salt: `Bytes`)',
    description: 'Deprecated version if [`Self::instantiate_with_code`] for use in an in-storage `Call`.'
  },
  'contracts.migrate': {
    function: 'migrate(weight_limit: `SpWeightsWeightV2Weight`)',
    description: "When a migration is in progress, this dispatchable can be used to run migration steps. Calls that contribute to advancing the migration have their fees waived, as it's helpful for the chain. Note that while the migration is in progress, the pallet will also leverage the `on_idle` hooks to run migration steps."
  },
  'contracts.removeCode': {
    function: 'removeCode(code_hash: `H256`)',
    description: 'Remove the code stored under `code_hash` and refund the deposit to its owner.'
  },
  'contracts.setCode': {
    function: 'setCode(dest: `MultiAddress`, code_hash: `H256`)',
    description: 'Privileged function that changes the code of an existing contract.'
  },
  'contracts.uploadCode': {
    function: 'uploadCode(code: `Bytes`, storage_deposit_limit: `Option<Compact<u128>>`, determinism: `PalletContractsWasmDeterminism`)',
    description: 'Upload new `code` without instantiating a contract from it. - `determinism`: If this is set to any other value but [`Determinism::Enforced`] then the only way to use this code is to delegate call into it from an offchain execution. Set to [`Determinism::Enforced`] if in doubt.'
  },
  'convictionVoting.delegate': {
    function: 'delegate(class: `u16`, to: `MultiAddress`, conviction: `PalletConvictionVotingConviction`, balance: `u128`)',
    description: "Delegate the voting power (with some given conviction) of the sending account for a particular class of polls. - be delegating already; or - have no voting activity (if there is, then it will need to be removed through `remove_vote`). - `to`: The account whose voting the `target` account's voting power will follow. - `class`: The class of polls to delegate. To delegate multiple classes, multiple calls to this function are required. - `conviction`: The conviction that will be attached to the delegated votes. When the account is undelegated, the funds will be locked for the corresponding period. - `balance`: The amount of the account's balance to be used in delegating. This must not be more than the account's current balance."
  },
  'convictionVoting.removeOtherVote': {
    function: 'removeOtherVote(target: `MultiAddress`, class: `u16`, index: `u32`)',
    description: 'Remove a vote for a poll. - `target`: The account of the vote to be removed; this account must have voted for poll `index`. - `index`: The index of poll of the vote to be removed. - `class`: The class of the poll.'
  },
  'convictionVoting.removeVote': {
    function: 'removeVote(class: `Option<u16>`, index: `u32`)',
    description: "Remove a vote for a poll. - the poll was cancelled, or - the poll is ongoing, or - the poll has ended such that - the vote of the account was in opposition to the result; or - there was no conviction to the account's vote; or - the account made a split vote ...then the vote is removed cleanly and a following call to `unlock` may result in more funds being available. - it finished corresponding to the vote of the account, and - the account made a standard vote with conviction, and - the lock period of the conviction is not over ...then the lock will be aggregated into the overall account's lock, which may involve - `index`: The index of poll of the vote to be removed. - `class`: Optional parameter, if given it indicates the class of the poll. For polls which have finished or are cancelled, this must be `Some`."
  },
  'convictionVoting.undelegate': {
    function: 'undelegate(class: `u16`)',
    description: 'Undelegate the voting power of the sending account for a particular class of polls. - `class`: The class of polls to remove the delegation from.'
  },
  'convictionVoting.unlock': {
    function: 'unlock(class: `u16`, target: `MultiAddress`)',
    description: 'Remove the lock caused by prior voting/delegating which has expired within a particular class. - `class`: The class of polls to unlock. - `target`: The account to remove the lock on.'
  },
  'convictionVoting.vote': {
    function: 'vote(poll_index: `Compact<u32>`, vote: `PalletConvictionVotingVoteAccountVote`)',
    description: 'Vote in a poll. If `vote.is_aye()`, the vote is to enact the proposal; otherwise it is a vote to keep the status quo. - `poll_index`: The index of the poll to vote for. - `vote`: The vote configuration.'
  },
  'coreFellowship.approve': {
    function: 'approve(who: `AccountId32`, at_rank: `u16`)',
    description: 'Approve a member to continue at their rank. - `origin`: An origin which satisfies `ApproveOrigin` or root. - `who`: A member (i.e. of non-zero rank). - `at_rank`: The rank of member.'
  },
  'coreFellowship.bump': {
    function: 'bump(who: `AccountId32`)',
    description: 'Bump the state of a member. - `origin`: A `Signed` origin of an account. - `who`: A member account whose state is to be updated.'
  },
  'coreFellowship.import': {
    function: 'import()',
    description: 'Introduce an already-ranked individual of the collective into this pallet. - `origin`: A signed origin of a ranked, but not tracked, account.'
  },
  'coreFellowship.importMember': {
    function: 'importMember(who: `AccountId32`)',
    description: 'Introduce an already-ranked individual of the collective into this pallet. - `origin`: A signed origin of a ranked, but not tracked, account. - `who`: The account ID of the collective member to be inducted.'
  },
  'coreFellowship.induct': {
    function: 'induct(who: `AccountId32`)',
    description: 'Introduce a new and unranked candidate (rank zero). - `origin`: An origin which satisfies `InductOrigin` or root. - `who`: The account ID of the candidate to be inducted and become a member.'
  },
  'coreFellowship.offboard': {
    function: 'offboard(who: `AccountId32`)',
    description: 'Stop tracking a prior member who is now not a ranked member of the collective. - `origin`: A `Signed` origin of an account. - `who`: The ID of an account which was tracked in this pallet but which is now not a ranked member of the collective.'
  },
  'coreFellowship.promote': {
    function: 'promote(who: `AccountId32`, to_rank: `u16`)',
    description: 'Increment the rank of a ranked and tracked account. - `origin`: An origin which satisfies `PromoteOrigin` with a `Success` result of `to_rank` or more or root. - `who`: The account ID of the member to be promoted to `to_rank`. - `to_rank`: One more than the current rank of `who`.'
  },
  'coreFellowship.promoteFast': {
    function: 'promoteFast(who: `AccountId32`, to_rank: `u16`)',
    description: 'Fast promotions can skip ranks and ignore the `min_promotion_period`.'
  },
  'coreFellowship.setActive': {
    function: 'setActive(is_active: `bool`)',
    description: "Set whether a member is active or not. - `origin`: A `Signed` origin of a member's account. - `is_active`: `true` iff the member is active."
  },
  'coreFellowship.setParams': {
    function: 'setParams(params: `PalletCoreFellowshipParamsTypeU128`)',
    description: 'Set the parameters. - `origin`: An origin complying with `ParamsOrigin` or root. - `params`: The new parameters for the pallet.'
  },
  'coreFellowship.setPartialParams': {
    function: 'setPartialParams(partial_params: `PalletCoreFellowshipParamsTypeOption`)',
    description: 'Set the parameters partially. - `origin`: An origin complying with `ParamsOrigin` or root. - `partial_params`: The new parameters for the pallet.'
  },
  'coreFellowship.submitEvidence': {
    function: 'submitEvidence(wish: `PalletCoreFellowshipWish`, evidence: `Bytes`)',
    description: 'Provide evidence that a rank is deserved. - `origin`: A `Signed` origin of an inducted and ranked account. - `wish`: The stated desire of the member. - `evidence`: A dump of evidence to be considered. This should generally be either a Markdown-encoded document or a series of 32-byte hashes which can be found on a decentralised content-based-indexing system such as IPFS.'
  },
  'council.close': {
    function: 'close(proposal_hash: `H256`, index: `Compact<u32>`, proposal_weight_bound: `SpWeightsWeightV2Weight`, length_bound: `Compact<u32>`)',
    description: 'Close a vote that is either approved, disapproved or whose voting period has ended. - `O(B + M + P1 + P2)` where: - `B` is `proposal` size in bytes (length-fee-bounded) - `M` is members-count (code- and governance-bounded) - `P1` is the complexity of `proposal` preimage. - `P2` is proposal-count (code-bounded).'
  },
  'council.disapproveProposal': {
    function: 'disapproveProposal(proposal_hash: `H256`)',
    description: 'Disapprove a proposal, close, and remove it from the system, regardless of its current state.'
  },
  'council.execute': {
    function: 'execute(proposal: `Call`, length_bound: `Compact<u32>`)',
    description: 'Dispatch a proposal from a member using the `Member` origin. - `O(B + M + P)` where: - `B` is `proposal` size in bytes (length-fee-bounded) - `M` members-count (code-bounded) - `P` complexity of dispatching `proposal`.'
  },
  'council.kill': {
    function: 'kill(proposal_hash: `H256`)',
    description: 'Disapprove the proposal and burn the cost held for storing this proposal. - `origin`: must be the `KillOrigin`. - `proposal_hash`: The hash of the proposal that should be killed.'
  },
  'council.propose': {
    function: 'propose(threshold: `Compact<u32>`, proposal: `Call`, length_bound: `Compact<u32>`)',
    description: 'Add a new proposal to either be voted on or executed directly. - `O(B + M + P1)` or `O(B + M + P2)` where: - `B` is `proposal` size in bytes (length-fee-bounded) - `M` is members-count (code- and governance-bounded) - branching is influenced by `threshold` where: - `P1` is proposal execution complexity (`threshold < 2`) - `P2` is proposals-count (code-bounded) (`threshold >= 2`).'
  },
  'council.releaseProposalCost': {
    function: 'releaseProposalCost(proposal_hash: `H256`)',
    description: 'Release the cost held for storing a proposal once the given proposal is completed. - `origin`: must be `Signed` or `Root`. - `proposal_hash`: The hash of the proposal.'
  },
  'council.setMembers': {
    function: 'setMembers(new_members: `Vec<AccountId32>`, prime: `Option<AccountId32>`, old_count: `u32`)',
    description: "Set the collective's membership. - `new_members`: The new member list. Be nice to the chain and provide it sorted. - `prime`: The prime member whose vote sets the default. - `old_count`: The upper bound for the previous number of members in storage. Used for weight estimation. - `O(MP + N)` where: - `M` old-members-count (code- and governance-bounded) - `N` new-members-count (code- and governance-bounded) - `P` proposals-count (code-bounded)."
  },
  'council.vote': {
    function: 'vote(proposal: `H256`, index: `Compact<u32>`, approve: `bool`)',
    description: 'Add an aye or nay vote for the sender to the given proposal. - `O(M)` where `M` is members-count (code- and governance-bounded).'
  },
  'democracy.blacklist': {
    function: 'blacklist(proposal_hash: `H256`, maybe_ref_index: `Option<u32>`)',
    description: 'Permanently place a proposal into the blacklist. This prevents it from ever being proposed again. - `proposal_hash`: The proposal hash to blacklist permanently. - `ref_index`: An ongoing referendum whose hash is `proposal_hash`, which will be cancelled.'
  },
  'democracy.cancelProposal': {
    function: 'cancelProposal(prop_index: `Compact<u32>`)',
    description: 'Remove a proposal. - `prop_index`: The index of the proposal to cancel.'
  },
  'democracy.cancelReferendum': {
    function: 'cancelReferendum(ref_index: `Compact<u32>`)',
    description: 'Remove a referendum. - `ref_index`: The index of the referendum to cancel.'
  },
  'democracy.clearPublicProposals': {
    function: 'clearPublicProposals()',
    description: 'Clears all public proposals.'
  },
  'democracy.delegate': {
    function: 'delegate(to: `MultiAddress`, conviction: `PalletDemocracyConviction`, balance: `u128`)',
    description: "Delegate the voting power (with some given conviction) of the sending account. - be delegating already; or - have no voting activity (if there is, then it will need to be removed/consolidated through `reap_vote` or `unvote`). - `to`: The account whose voting the `target` account's voting power will follow. - `conviction`: The conviction that will be attached to the delegated votes. When the account is undelegated, the funds will be locked for the corresponding period. - `balance`: The amount of the account's balance to be used in delegating. This must not be more than the account's current balance."
  },
  'democracy.emergencyCancel': {
    function: 'emergencyCancel(ref_index: `u32`)',
    description: 'Schedule an emergency cancellation of a referendum. Cannot happen twice to the same referendum.'
  },
  'democracy.externalPropose': {
    function: 'externalPropose(proposal: `FrameSupportPreimagesBounded`)',
    description: 'Schedule a referendum to be tabled once it is legal to schedule an external referendum. - `proposal_hash`: The preimage hash of the proposal.'
  },
  'democracy.externalProposeDefault': {
    function: 'externalProposeDefault(proposal: `FrameSupportPreimagesBounded`)',
    description: 'Schedule a negative-turnout-bias referendum to be tabled next once it is legal to schedule an external referendum. - `proposal_hash`: The preimage hash of the proposal.'
  },
  'democracy.externalProposeMajority': {
    function: 'externalProposeMajority(proposal: `FrameSupportPreimagesBounded`)',
    description: 'Schedule a majority-carries referendum to be tabled next once it is legal to schedule an external referendum. - `proposal_hash`: The preimage hash of the proposal.'
  },
  'democracy.fastTrack': {
    function: 'fastTrack(proposal_hash: `H256`, voting_period: `u32`, delay: `u32`)',
    description: "Schedule the currently externally-proposed majority-carries referendum to be tabled immediately. If there is no externally-proposed referendum currently, or if there is one but it is not a majority-carries referendum then it fails. - `proposal_hash`: The hash of the current external proposal. - `voting_period`: The period that is allowed for voting on this proposal. Increased to Must be always greater than zero. For `FastTrackOrigin` must be equal or greater than `FastTrackVotingPeriod`. - `delay`: The number of block after voting has ended in approval and this should be enacted. This doesn't have a minimum amount."
  },
  'democracy.propose': {
    function: 'propose(proposal: `FrameSupportPreimagesBounded`, value: `Compact<u128>`)',
    description: 'Propose a sensitive action to be taken. - `proposal_hash`: The hash of the proposal preimage. - `value`: The amount of deposit (must be at least `MinimumDeposit`).'
  },
  'democracy.removeOtherVote': {
    function: 'removeOtherVote(target: `MultiAddress`, index: `u32`)',
    description: 'Remove a vote for a referendum. - `target`: The account of the vote to be removed; this account must have voted for referendum `index`. - `index`: The index of referendum of the vote to be removed.'
  },
  'democracy.removeVote': {
    function: 'removeVote(index: `u32`)',
    description: "Remove a vote for a referendum. - the referendum was cancelled, or - the referendum is ongoing, or - the referendum has ended such that - the vote of the account was in opposition to the result; or - there was no conviction to the account's vote; or - the account made a split vote ...then the vote is removed cleanly and a following call to `unlock` may result in more funds being available. - it finished corresponding to the vote of the account, and - the account made a standard vote with conviction, and - the lock period of the conviction is not over ...then the lock will be aggregated into the overall account's lock, which may involve - `index`: The index of referendum of the vote to be removed."
  },
  'democracy.second': {
    function: 'second(proposal: `Compact<u32>`)',
    description: 'Signals agreement with a particular proposal. - `proposal`: The index of the proposal to second.'
  },
  'democracy.setMetadata': {
    function: 'setMetadata(owner: `PalletDemocracyMetadataOwner`, maybe_hash: `Option<H256>`)',
    description: 'Set or clear a metadata of a proposal or a referendum. - `origin`: Must correspond to the `MetadataOwner`. - `ExternalOrigin` for an external proposal with the `SuperMajorityApprove` threshold. - `ExternalDefaultOrigin` for an external proposal with the `SuperMajorityAgainst` threshold. - `ExternalMajorityOrigin` for an external proposal with the `SimpleMajority` threshold. - `Signed` by a creator for a public proposal. - `Signed` to clear a metadata for a finished referendum. - `Root` to set a metadata for an ongoing referendum. - `owner`: an identifier of a metadata owner. - `maybe_hash`: The hash of an on-chain stored preimage. `None` to clear a metadata.'
  },
  'democracy.undelegate': {
    function: 'undelegate()',
    description: 'Undelegate the voting power of the sending account.'
  },
  'democracy.unlock': {
    function: 'unlock(target: `MultiAddress`)',
    description: 'Unlock tokens that have an expired lock. - `target`: The account to remove the lock on.'
  },
  'democracy.vetoExternal': {
    function: 'vetoExternal(proposal_hash: `H256`)',
    description: 'Veto and blacklist the external proposal hash. - `proposal_hash`: The preimage hash of the proposal to veto and blacklist.'
  },
  'democracy.vote': {
    function: 'vote(ref_index: `Compact<u32>`, vote: `PalletDemocracyVoteAccountVote`)',
    description: 'Vote in a referendum. If `vote.is_aye()`, the vote is to enact the proposal; otherwise it is a vote to keep the status quo. - `ref_index`: The index of the referendum to vote for. - `vote`: The vote configuration.'
  },
  'electionProviderMultiPhase.governanceFallback': {
    function: 'governanceFallback(maybe_max_voters: `Option<u32>`, maybe_max_targets: `Option<u32>`)',
    description: 'Trigger the governance fallback.'
  },
  'electionProviderMultiPhase.setEmergencyElectionResult': {
    function: 'setEmergencyElectionResult(supports: `Vec<(AccountId32,SpNposElectionsSupport)>`)',
    description: 'Set a solution in the queue, to be handed out to the client of this pallet in the next call to `ElectionProvider::elect`.'
  },
  'electionProviderMultiPhase.setMinimumUntrustedScore': {
    function: 'setMinimumUntrustedScore(maybe_next_score: `Option<SpNposElectionsElectionScore>`)',
    description: 'Set a new value for `MinimumUntrustedScore`.'
  },
  'electionProviderMultiPhase.submit': {
    function: 'submit(raw_solution: `PalletElectionProviderMultiPhaseRawSolution`)',
    description: 'Submit a solution for the signed phase.'
  },
  'electionProviderMultiPhase.submitUnsigned': {
    function: 'submitUnsigned(raw_solution: `PalletElectionProviderMultiPhaseRawSolution`, witness: `PalletElectionProviderMultiPhaseSolutionOrSnapshotSize`)',
    description: 'Submit a solution for the unsigned phase.'
  },
  'elections.cleanDefunctVoters': {
    function: 'cleanDefunctVoters(num_voters: `u32`, num_defunct: `u32`)',
    description: 'Clean all voters who are defunct (i.e. they do not serve any purpose at all). The deposit of the removed voters are returned. - Check is_defunct_voter() details.'
  },
  'elections.removeMember': {
    function: 'removeMember(who: `MultiAddress`, slash_bond: `bool`, rerun_election: `bool`)',
    description: 'Remove a particular member from the set. This is effective immediately and the bond of the outgoing member is slashed. - Check details of remove_and_replace_member() and do_phragmen().'
  },
  'elections.removeVoter': {
    function: 'removeVoter()',
    description: 'Remove `origin` as a voter.'
  },
  'elections.renounceCandidacy': {
    function: 'renounceCandidacy(renouncing: `PalletElectionsPhragmenRenouncing`)',
    description: "Renounce one's intention to be a candidate for the next election round. 3 potential outcomes exist: - `origin` is a candidate and not elected in any set. In this case, the deposit is unreserved, returned and origin is removed as a candidate. - `origin` is a current runner-up. In this case, the deposit is unreserved, returned and origin is removed as a runner-up. - `origin` is a current member. In this case, the deposit is unreserved and origin is removed as a member, consequently not being a candidate for the next round anymore. Similar to [`remove_member`](Self::remove_member), if replacement runners exists, they are immediately used. If the prime is renouncing, then no prime will exist until the next round. - Renouncing::Candidate(count): O(count + log(count)) - Renouncing::Member: O(1) - Renouncing::RunnerUp: O(1)."
  },
  'elections.submitCandidacy': {
    function: 'submitCandidacy(candidate_count: `Compact<u32>`)',
    description: 'Submit oneself for candidacy. A fixed amount of deposit is recorded.'
  },
  'elections.vote': {
    function: 'vote(votes: `Vec<AccountId32>`, value: `Compact<u128>`)',
    description: 'Vote for a set of candidates for the upcoming round of election. This can be called to set the initial votes, or update already existing votes. - not be empty. - be less than the number of possible candidates. Note that all current members and runners-up are also automatically candidates for the next round.'
  },
  'fastUnstake.control': {
    function: 'control(eras_to_check: `u32`)',
    description: 'Control the operation of this pallet.'
  },
  'fastUnstake.deregister': {
    function: 'deregister()',
    description: 'Deregister oneself from the fast-unstake.'
  },
  'fastUnstake.registerFastUnstake': {
    function: 'registerFastUnstake()',
    description: 'Register oneself for fast-unstake.'
  },
  'glutton.bloat': {
    function: 'bloat(garbage: `Vec<[u8;1024]>`)',
    description: 'Increase the block size by including the specified garbage bytes.'
  },
  'glutton.initializePallet': {
    function: 'initializePallet(new_count: `u32`, witness_count: `Option<u32>`)',
    description: 'Initialize the pallet. Should be called once, if no genesis state was provided.'
  },
  'glutton.setBlockLength': {
    function: 'setBlockLength(block_length: `u64`)',
    description: 'Set how much of the block length should be filled with trash data on each block.'
  },
  'glutton.setCompute': {
    function: 'setCompute(compute: `u64`)',
    description: 'Set how much of the remaining `ref_time` weight should be consumed by `on_idle`.'
  },
  'glutton.setStorage': {
    function: 'setStorage(storage: `u64`)',
    description: 'Set how much of the remaining `proof_size` weight should be consumed by `on_idle`.'
  },
  'grandpa.noteStalled': {
    function: 'noteStalled(delay: `u32`, best_finalized_block_number: `u32`)',
    description: 'Note that the current authority set of the GRANDPA finality gadget has stalled.'
  },
  'grandpa.reportEquivocation': {
    function: 'reportEquivocation(equivocation_proof: `SpConsensusGrandpaEquivocationProof`, key_owner_proof: `SpSessionMembershipProof`)',
    description: 'Report voter equivocation/misbehavior. This method will verify the equivocation proof and validate the given key ownership proof against the extracted offender. If both are valid, the offence will be reported.'
  },
  'grandpa.reportEquivocationUnsigned': {
    function: 'reportEquivocationUnsigned(equivocation_proof: `SpConsensusGrandpaEquivocationProof`, key_owner_proof: `SpSessionMembershipProof`)',
    description: 'Report voter equivocation/misbehavior. This method will verify the equivocation proof and validate the given key ownership proof against the extracted offender. If both are valid, the offence will be reported.'
  },
  'identity.acceptUsername': {
    function: 'acceptUsername(username: `Bytes`)',
    description: 'Accept a given username that an `authority` granted. The call must include the full username, as in `username.suffix`.'
  },
  'identity.addRegistrar': {
    function: 'addRegistrar(account: `MultiAddress`)',
    description: 'Add a registrar to the system. - `account`: the account of the registrar.'
  },
  'identity.addSub': {
    function: 'addSub(sub: `MultiAddress`, data: `Data`)',
    description: "Add the given account to the sender's subs."
  },
  'identity.addUsernameAuthority': {
    function: 'addUsernameAuthority(authority: `MultiAddress`, suffix: `Bytes`, allocation: `u32`)',
    description: 'Add an `AccountId` with permission to grant usernames with a given `suffix` appended.'
  },
  'identity.cancelRequest': {
    function: 'cancelRequest(reg_index: `u32`)',
    description: 'Cancel a previous request. - `reg_index`: The index of the registrar whose judgement is no longer requested.'
  },
  'identity.clearIdentity': {
    function: 'clearIdentity()',
    description: "Clear an account's identity info and all sub-accounts and return all deposits."
  },
  'identity.killIdentity': {
    function: 'killIdentity(target: `MultiAddress`)',
    description: "Remove an account's identity and sub-account information and slash the deposits. - `target`: the account whose identity the judgement is upon. This must be an account with a registered identity."
  },
  'identity.killUsername': {
    function: 'killUsername(username: `Bytes`)',
    description: 'Call with [ForceOrigin](crate::Config::ForceOrigin) privileges which deletes a username and slashes any deposit associated with it.'
  },
  'identity.provideJudgement': {
    function: 'provideJudgement(reg_index: `Compact<u32>`, target: `MultiAddress`, judgement: `PalletIdentityJudgement`, identity: `H256`)',
    description: "Provide a judgement for an account's identity. - `reg_index`: the index of the registrar whose judgement is being made. - `target`: the account whose identity the judgement is upon. This must be an account with a registered identity. - `judgement`: the judgement of the registrar of index `reg_index` about `target`. - `identity`: The hash of the [`IdentityInformationProvider`] for that the judgement is provided."
  },
  'identity.quitSub': {
    function: 'quitSub()',
    description: 'Remove the sender as a sub-account.'
  },
  'identity.removeExpiredApproval': {
    function: 'removeExpiredApproval(username: `Bytes`)',
    description: 'Remove an expired username approval. The username was approved by an authority but never accepted by the user and must now be beyond its expiration. The call must include the full username, as in `username.suffix`.'
  },
  'identity.removeSub': {
    function: 'removeSub(sub: `MultiAddress`)',
    description: "Remove the given account from the sender's subs."
  },
  'identity.removeUsername': {
    function: 'removeUsername(username: `Bytes`)',
    description: 'Permanently delete a username which has been unbinding for longer than the grace period. Caller is refunded the fee if the username expired and the removal was successful.'
  },
  'identity.removeUsernameAuthority': {
    function: 'removeUsernameAuthority(suffix: `Bytes`, authority: `MultiAddress`)',
    description: 'Remove `authority` from the username authorities.'
  },
  'identity.renameSub': {
    function: 'renameSub(sub: `MultiAddress`, data: `Data`)',
    description: 'Alter the associated name of the given sub-account.'
  },
  'identity.requestJudgement': {
    function: 'requestJudgement(reg_index: `Compact<u32>`, max_fee: `Compact<u128>`)',
    description: 'Request a judgement from a registrar. - `reg_index`: The index of the registrar whose judgement is requested. - `max_fee`: The maximum fee that may be paid. This should just be auto-populated as:.'
  },
  'identity.setAccountId': {
    function: 'setAccountId(index: `Compact<u32>`, new: `MultiAddress`)',
    description: 'Change the account associated with a registrar. - `index`: the index of the registrar whose fee is to be set. - `new`: the new account ID.'
  },
  'identity.setFee': {
    function: 'setFee(index: `Compact<u32>`, fee: `Compact<u128>`)',
    description: 'Set the fee required for a judgement to be requested from a registrar. - `index`: the index of the registrar whose fee is to be set. - `fee`: the new fee.'
  },
  'identity.setFields': {
    function: 'setFields(index: `Compact<u32>`, fields: `u64`)',
    description: 'Set the field information for a registrar. - `index`: the index of the registrar whose fee is to be set. - `fields`: the fields that the registrar concerns themselves with.'
  },
  'identity.setIdentity': {
    function: 'setIdentity(info: `PalletIdentityLegacyIdentityInfo`)',
    description: "Set an account's identity information and reserve the appropriate deposit. - `info`: The identity information."
  },
  'identity.setPrimaryUsername': {
    function: 'setPrimaryUsername(username: `Bytes`)',
    description: 'Set a given username as the primary. The username should include the suffix.'
  },
  'identity.setSubs': {
    function: 'setSubs(subs: `Vec<(AccountId32,Data)>`)',
    description: "Set the sub-accounts of the sender. - `subs`: The identity's (new) sub-accounts."
  },
  'identity.setUsernameFor': {
    function: 'setUsernameFor(who: `MultiAddress`, username: `Bytes`, signature: `Option<SpRuntimeMultiSignature>`, use_allocation: `bool`)',
    description: 'Set the username for `who`. Must be called by a username authority. - Only contain lowercase ASCII characters or digits. - When combined with the suffix of the issuing authority be _less than_ the `MaxUsernameLength`.'
  },
  'identity.unbindUsername': {
    function: 'unbindUsername(username: `Bytes`)',
    description: 'Start the process of removing a username by placing it in the unbinding usernames map. Once the grace period has passed, the username can be deleted by calling [remove_username](crate::Call::remove_username).'
  },
  'imOnline.heartbeat': {
    function: 'heartbeat(heartbeat: `PalletImOnlineHeartbeat`, signature: `PalletImOnlineSr25519AppSr25519Signature`)',
    description: '#Complexity: - `O(K)` where K is length of `Keys` (heartbeat.validators_len) - `O(K)`: decoding of length `K`.'
  },
  'indices.claim': {
    function: 'claim(index: `u32`)',
    description: 'Assign an previously unassigned index. - `index`: the index to be claimed. This must not be in use. - `O(1)`.'
  },
  'indices.forceTransfer': {
    function: 'forceTransfer(new: `MultiAddress`, index: `u32`, freeze: `bool`)',
    description: "Force an index to an account. This doesn't require a deposit. If the index is already held, then any deposit is reimbursed to its current owner. - `index`: the index to be (re-)assigned. - `new`: the new owner of the index. This function is a no-op if it is equal to sender. - `freeze`: if set to `true`, will freeze the index so it cannot be transferred. - `O(1)`."
  },
  'indices.free': {
    function: 'free(index: `u32`)',
    description: 'Free up an index owned by the sender. - `index`: the index to be freed. This must be owned by the sender. - `O(1)`.'
  },
  'indices.freeze': {
    function: 'freeze(index: `u32`)',
    description: 'Freeze an index so it will always point to the sender account. This consumes the deposit. - `index`: the index to be frozen in place. - `O(1)`.'
  },
  'indices.pokeDeposit': {
    function: 'pokeDeposit(index: `u32`)',
    description: 'Poke the deposit reserved for an index. - `index`: the index whose deposit is to be poked/reconsidered.'
  },
  'indices.transfer': {
    function: 'transfer(new: `MultiAddress`, index: `u32`)',
    description: 'Assign an index already owned by the sender to another account. The balance reservation is effectively transferred to the new account. - `index`: the index to be re-assigned. This must be owned by the sender. - `new`: the new owner of the index. This function is a no-op if it is equal to sender. - `O(1)`.'
  },
  'lottery.buyTicket': {
    function: 'buyTicket(call: `Call`)',
    description: 'Buy a ticket to enter the lottery.'
  },
  'lottery.setCalls': {
    function: 'setCalls(calls: `Vec<Call>`)',
    description: 'Set calls in storage which can be used to purchase a lottery ticket.'
  },
  'lottery.startLottery': {
    function: 'startLottery(price: `u128`, length: `u32`, delay: `u32`, repeat: `bool`)',
    description: 'Start a lottery using the provided configuration.'
  },
  'lottery.stopRepeat': {
    function: 'stopRepeat()',
    description: 'If a lottery is repeating, you can use this to stop the repeat. The lottery will continue to run to completion.'
  },
  'messageQueue.executeOverweight': {
    function: 'executeOverweight(message_origin: `u32`, page: `u32`, index: `u32`, weight_limit: `SpWeightsWeightV2Weight`)',
    description: 'Execute an overweight message. - `origin`: Must be `Signed`. - `message_origin`: The origin from which the message to be executed arrived. - `page`: The page in the queue in which the message to be executed is sitting. - `index`: The index into the queue of the message to be executed. - `weight_limit`: The maximum amount of weight allowed to be consumed in the execution of the message.'
  },
  'messageQueue.reapPage': {
    function: 'reapPage(message_origin: `u32`, page_index: `u32`)',
    description: 'Remove a page which has no more messages remaining to be processed or is stale.'
  },
  'metaTx.dispatch': {
    function: 'dispatch(meta_tx: `PalletMetaTxMetaTx`)',
    description: 'Dispatch a given meta transaction. - `_origin`: Can be any kind of origin. - `meta_tx`: Meta Transaction with a target call to be dispatched.'
  },
  'mixnet.register': {
    function: 'register(registration: `PalletMixnetRegistration`, signature: `SpMixnetAppSignature`)',
    description: 'Register a mixnode for the following session.'
  },
  'multiBlockMigrations.clearHistoric': {
    function: 'clearHistoric(selector: `PalletMigrationsHistoricCleanupSelector`)',
    description: 'Clears the `Historic` set.'
  },
  'multiBlockMigrations.forceOnboardMbms': {
    function: 'forceOnboardMbms()',
    description: 'Forces the onboarding of the migrations.'
  },
  'multiBlockMigrations.forceSetActiveCursor': {
    function: 'forceSetActiveCursor(index: `u32`, inner_cursor: `Option<Bytes>`, started_at: `Option<u32>`)',
    description: 'Allows root to set an active cursor to forcefully start/forward the migration process.'
  },
  'multiBlockMigrations.forceSetCursor': {
    function: 'forceSetCursor(cursor: `Option<PalletMigrationsMigrationCursor>`)',
    description: 'Allows root to set a cursor to forcefully start, stop or forward the migration process.'
  },
  'multisig.approveAsMulti': {
    function: 'approveAsMulti(threshold: `u16`, other_signatories: `Vec<AccountId32>`, maybe_timepoint: `Option<PalletMultisigTimepoint>`, call_hash: `[u8;32]`, max_weight: `SpWeightsWeightV2Weight`)',
    description: 'Register approval for a dispatch to be made from a deterministic composite account if approved by a total of `threshold - 1` of `other_signatories`. - `threshold`: The total number of approvals for this dispatch before it is executed. - `other_signatories`: The accounts (other than the sender) who can approve this dispatch. May not be empty. - `maybe_timepoint`: If this is the first approval, then this must be `None`. If it is not the first approval, then it must be `Some`, with the timepoint (block number and transaction index) of the first approval transaction. - `call_hash`: The hash of the call to be executed. - `O(S)`. - Up to one balance-reserve or unreserve operation. - One passthrough operation, one insert, both `O(S)` where `S` is the number of signatories. `S` is capped by `MaxSignatories`, with weight being proportional. - One encode & hash, both of complexity `O(S)`. - Up to one binary search and insert (`O(logS + S)`). - I/O: 1 read `O(S)`, up to 1 mutate `O(S)`. Up to one remove. - One event. - Storage: inserts one item, value size bounded by `MaxSignatories`, with a deposit taken for its lifetime of `DepositBase + threshold * DepositFactor`.'
  },
  'multisig.asMulti': {
    function: 'asMulti(threshold: `u16`, other_signatories: `Vec<AccountId32>`, maybe_timepoint: `Option<PalletMultisigTimepoint>`, call: `Call`, max_weight: `SpWeightsWeightV2Weight`)',
    description: 'Register approval for a dispatch to be made from a deterministic composite account if approved by a total of `threshold - 1` of `other_signatories`. - `threshold`: The total number of approvals for this dispatch before it is executed. - `other_signatories`: The accounts (other than the sender) who can approve this dispatch. May not be empty. - `maybe_timepoint`: If this is the first approval, then this must be `None`. If it is not the first approval, then it must be `Some`, with the timepoint (block number and transaction index) of the first approval transaction. - `call`: The call to be executed. - `O(S + Z + Call)`. - Up to one balance-reserve or unreserve operation. - One passthrough operation, one insert, both `O(S)` where `S` is the number of signatories. `S` is capped by `MaxSignatories`, with weight being proportional. - One call encode & hash, both of complexity `O(Z)` where `Z` is tx-len. - One encode & hash, both of complexity `O(S)`. - Up to one binary search and insert (`O(logS + S)`). - I/O: 1 read `O(S)`, up to 1 mutate `O(S)`. Up to one remove. - One event. - The weight of the `call`. - Storage: inserts one item, value size bounded by `MaxSignatories`, with a deposit taken for its lifetime of `DepositBase + threshold * DepositFactor`.'
  },
  'multisig.asMultiThreshold1': {
    function: 'asMultiThreshold1(other_signatories: `Vec<AccountId32>`, call: `Call`)',
    description: 'Immediately dispatch a multi-signature call using a single approval from the caller. - `other_signatories`: The accounts (other than the sender) who are part of the multi-signature, but do not participate in the approval process. - `call`: The call to be executed.'
  },
  'multisig.cancelAsMulti': {
    function: 'cancelAsMulti(threshold: `u16`, other_signatories: `Vec<AccountId32>`, timepoint: `PalletMultisigTimepoint`, call_hash: `[u8;32]`)',
    description: 'Cancel a pre-existing, on-going multisig transaction. Any deposit reserved previously for this operation will be unreserved on success. - `threshold`: The total number of approvals for this dispatch before it is executed. - `other_signatories`: The accounts (other than the sender) who can approve this dispatch. May not be empty. - `timepoint`: The timepoint (block number and transaction index) of the first approval transaction for this dispatch. - `call_hash`: The hash of the call to be executed. - `O(S)`. - Up to one balance-reserve or unreserve operation. - One passthrough operation, one insert, both `O(S)` where `S` is the number of signatories. `S` is capped by `MaxSignatories`, with weight being proportional. - One encode & hash, both of complexity `O(S)`. - One event. - I/O: 1 read `O(S)`, one remove. - Storage: removes one item.'
  },
  'multisig.pokeDeposit': {
    function: 'pokeDeposit(threshold: `u16`, other_signatories: `Vec<AccountId32>`, call_hash: `[u8;32]`)',
    description: 'Poke the deposit reserved for an existing multisig operation. - `threshold`: The total number of approvals needed for this multisig. - `other_signatories`: The accounts (other than the sender) who are part of the multisig. - `call_hash`: The hash of the call this deposit is reserved for.'
  },
  'nftFractionalization.fractionalize': {
    function: 'fractionalize(nft_collection_id: `u32`, nft_id: `u32`, asset_id: `u32`, beneficiary: `MultiAddress`, fractions: `u128`)',
    description: 'Lock the NFT and mint a new fungible asset. - `nft_collection_id`: The ID used to identify the collection of the NFT. Is used within the context of `pallet_nfts`. - `nft_id`: The ID used to identify the NFT within the given collection. Is used within the context of `pallet_nfts`. - `asset_id`: The ID of the new asset. It must not exist. Is used within the context of `pallet_assets`. - `beneficiary`: The account that will receive the newly created asset. - `fractions`: The total issuance of the newly created asset class.'
  },
  'nftFractionalization.unify': {
    function: 'unify(nft_collection_id: `u32`, nft_id: `u32`, asset_id: `u32`, beneficiary: `MultiAddress`)',
    description: 'Burn the total issuance of the fungible asset and return (unlock) the locked NFT. - `nft_collection_id`: The ID used to identify the collection of the NFT. Is used within the context of `pallet_nfts`. - `nft_id`: The ID used to identify the NFT within the given collection. Is used within the context of `pallet_nfts`. - `asset_id`: The ID of the asset being returned and destroyed. Must match the original ID of the created asset, corresponding to the NFT. Is used within the context of `pallet_assets`. - `beneficiary`: The account that will receive the unified NFT.'
  },
  'nfts.approveItemAttributes': {
    function: 'approveItemAttributes(collection: `u32`, item: `u32`, delegate: `MultiAddress`)',
    description: "Approve item's attributes to be changed by a delegated third-party account. - `collection`: A collection of the item. - `item`: The item that holds attributes. - `delegate`: The account to delegate permission to change attributes of the item."
  },
  'nfts.approveTransfer': {
    function: 'approveTransfer(collection: `u32`, item: `u32`, delegate: `MultiAddress`, maybe_deadline: `Option<u32>`)',
    description: 'Approve an item to be transferred by a delegated third-party account. - `collection`: The collection of the item to be approved for delegated transfer. - `item`: The item to be approved for delegated transfer. - `delegate`: The account to delegate permission to transfer the item. - `maybe_deadline`: Optional deadline for the approval. Specified by providing the number of blocks after which the approval will expire.'
  },
  'nfts.burn': {
    function: 'burn(collection: `u32`, item: `u32`)',
    description: 'Destroy a single item. - `collection`: The collection of the item to be burned. - `item`: The item to be burned.'
  },
  'nfts.buyItem': {
    function: 'buyItem(collection: `u32`, item: `u32`, bid_price: `u128`)',
    description: "Allows to buy an item if it's up for sale. - `collection`: The collection of the item. - `item`: The item the sender wants to buy. - `bid_price`: The price the sender is willing to pay."
  },
  'nfts.cancelApproval': {
    function: 'cancelApproval(collection: `u32`, item: `u32`, delegate: `MultiAddress`)',
    description: 'Cancel one of the transfer approvals for a specific item. - the `Force` origin; - `Signed` with the signer being the Owner of the `item`; - `collection`: The collection of the item of whose approval will be cancelled. - `item`: The item of the collection of whose approval will be cancelled. - `delegate`: The account that is going to loose their approval.'
  },
  'nfts.cancelItemAttributesApproval': {
    function: 'cancelItemAttributesApproval(collection: `u32`, item: `u32`, delegate: `MultiAddress`, witness: `PalletNftsCancelAttributesApprovalWitness`)',
    description: "Cancel the previously provided approval to change item's attributes. All the previously set attributes by the `delegate` will be removed. - `collection`: Collection that the item is contained within. - `item`: The item that holds attributes. - `delegate`: The previously approved account to remove."
  },
  'nfts.cancelSwap': {
    function: 'cancelSwap(offered_collection: `u32`, offered_item: `u32`)',
    description: 'Cancel an atomic swap. - `collection`: The collection of the item. - `item`: The item an owner wants to give.'
  },
  'nfts.claimSwap': {
    function: 'claimSwap(send_collection: `u32`, send_item: `u32`, receive_collection: `u32`, receive_item: `u32`, witness_price: `Option<PalletNftsPriceWithDirection>`)',
    description: 'Claim an atomic swap. This method executes a pending swap, that was created by a counterpart before. - `send_collection`: The collection of the item to be sent. - `send_item`: The item to be sent. - `receive_collection`: The collection of the item to be received. - `receive_item`: The item to be received. - `witness_price`: A price that was previously agreed on.'
  },
  'nfts.clearAllTransferApprovals': {
    function: 'clearAllTransferApprovals(collection: `u32`, item: `u32`)',
    description: 'Cancel all the approvals of a specific item. - the `Force` origin; - `Signed` with the signer being the Owner of the `item`; - `collection`: The collection of the item of whose approvals will be cleared. - `item`: The item of the collection of whose approvals will be cleared.'
  },
  'nfts.clearAttribute': {
    function: 'clearAttribute(collection: `u32`, maybe_item: `Option<u32>`, namespace: `PalletNftsAttributeNamespace`, key: `Bytes`)',
    description: "Clear an attribute for a collection or item. - `collection`: The identifier of the collection whose item's metadata to clear. - `maybe_item`: The identifier of the item whose metadata to clear. - `namespace`: Attribute's namespace. - `key`: The key of the attribute."
  },
  'nfts.clearCollectionMetadata': {
    function: 'clearCollectionMetadata(collection: `u32`)',
    description: 'Clear the metadata for a collection. - `collection`: The identifier of the collection whose metadata to clear.'
  },
  'nfts.clearMetadata': {
    function: 'clearMetadata(collection: `u32`, item: `u32`)',
    description: "Clear the metadata for an item. - `collection`: The identifier of the collection whose item's metadata to clear. - `item`: The identifier of the item whose metadata to clear."
  },
  'nfts.create': {
    function: 'create(admin: `MultiAddress`, config: `PalletNftsCollectionConfig`)',
    description: "Issue a new collection of non-fungible items from a public origin. - `admin`: The admin of this collection. The admin is the initial address of each member of the collection's admin team."
  },
  'nfts.createSwap': {
    function: 'createSwap(offered_collection: `u32`, offered_item: `u32`, desired_collection: `u32`, maybe_desired_item: `Option<u32>`, maybe_price: `Option<PalletNftsPriceWithDirection>`, duration: `u32`)',
    description: 'Register a new atomic swap, declaring an intention to send an `item` in exchange for `desired_item` from origin to target on the current blockchain. The target can execute the swap during the specified `duration` of blocks (if set). Additionally, the price could be set for the desired `item`. - `collection`: The collection of the item. - `item`: The item an owner wants to give. - `desired_collection`: The collection of the desired item. - `desired_item`: The desired item an owner wants to receive. - `maybe_price`: The price an owner is willing to pay or receive for the desired `item`. - `duration`: A deadline for the swap. Specified by providing the number of blocks after which the swap will expire.'
  },
  'nfts.destroy': {
    function: 'destroy(collection: `u32`, witness: `PalletNftsDestroyWitness`)',
    description: 'Destroy a collection of fungible items. - `collection`: The identifier of the collection to be destroyed. - `witness`: Information on the items minted in the collection. This must be correct. - `m = witness.item_metadatas` - `c = witness.item_configs` - `a = witness.attributes`.'
  },
  'nfts.forceCollectionConfig': {
    function: 'forceCollectionConfig(collection: `u32`, config: `PalletNftsCollectionConfig`)',
    description: 'Change the config of a collection. - `collection`: The identifier of the collection. - `config`: The new config of this collection.'
  },
  'nfts.forceCollectionOwner': {
    function: 'forceCollectionOwner(collection: `u32`, owner: `MultiAddress`)',
    description: 'Change the Owner of a collection. - `collection`: The identifier of the collection. - `owner`: The new Owner of this collection.'
  },
  'nfts.forceCreate': {
    function: 'forceCreate(owner: `MultiAddress`, config: `PalletNftsCollectionConfig`)',
    description: 'Issue a new collection of non-fungible items from a privileged origin. - `owner`: The owner of this collection of items. The owner has full superuser permissions over this item, but may later change and configure the permissions using `transfer_ownership` and `set_team`.'
  },
  'nfts.forceMint': {
    function: 'forceMint(collection: `u32`, item: `u32`, mint_to: `MultiAddress`, item_config: `PalletNftsItemConfig`)',
    description: 'Mint an item of a particular collection from a privileged origin. - `collection`: The collection of the item to be minted. - `item`: An identifier of the new item. - `mint_to`: Account into which the item will be minted. - `item_config`: A config of the new item.'
  },
  'nfts.forceSetAttribute': {
    function: 'forceSetAttribute(set_as: `Option<AccountId32>`, collection: `u32`, maybe_item: `Option<u32>`, namespace: `PalletNftsAttributeNamespace`, key: `Bytes`, value: `Bytes`)',
    description: "Force-set an attribute for a collection or item. - `set_as`: An optional owner of the attribute. - `collection`: The identifier of the collection whose item's metadata to set. - `maybe_item`: The identifier of the item whose metadata to set. - `namespace`: Attribute's namespace. - `key`: The key of the attribute. - `value`: The value to which to set the attribute."
  },
  'nfts.lockCollection': {
    function: 'lockCollection(collection: `u32`, lock_settings: `u64`)',
    description: 'Disallows specified settings for the whole collection. - `collection`: The collection to be locked. - `lock_settings`: The settings to be locked.'
  },
  'nfts.lockItemProperties': {
    function: 'lockItemProperties(collection: `u32`, item: `u32`, lock_metadata: `bool`, lock_attributes: `bool`)',
    description: 'Disallows changing the metadata or attributes of the item. - `collection`: The collection if the `item`. - `item`: An item to be locked. - `lock_metadata`: Specifies whether the metadata should be locked. - `lock_attributes`: Specifies whether the attributes in the `CollectionOwner` namespace should be locked.'
  },
  'nfts.lockItemTransfer': {
    function: 'lockItemTransfer(collection: `u32`, item: `u32`)',
    description: 'Disallow further unprivileged transfer of an item. - `collection`: The collection of the item to be changed. - `item`: The item to become non-transferable.'
  },
  'nfts.mint': {
    function: 'mint(collection: `u32`, item: `u32`, mint_to: `MultiAddress`, witness_data: `Option<PalletNftsMintWitness>`)',
    description: 'Mint an item of a particular collection. - `collection`: The collection of the item to be minted. - `item`: An identifier of the new item. - `mint_to`: Account into which the item will be minted. - `witness_data`: When the mint type is `HolderOf(collection_id)`, then the owned item_id from that collection needs to be provided within the witness data object. If the mint price is set, then it should be additionally confirmed in the `witness_data`.'
  },
  'nfts.mintPreSigned': {
    function: 'mintPreSigned(mint_data: `PalletNftsPreSignedMint`, signature: `SpRuntimeMultiSignature`, signer: `AccountId32`)',
    description: "Mint an item by providing the pre-signed approval. - `mint_data`: The pre-signed approval that consists of the information about the item, its metadata, attributes, who can mint it (`None` for anyone) and until what block number. - `signature`: The signature of the `data` object. - `signer`: The `data` object's signer. Should be an Issuer of the collection."
  },
  'nfts.payTips': {
    function: 'payTips(tips: `Vec<PalletNftsItemTip>`)',
    description: 'Allows to pay the tips. - `tips`: Tips array.'
  },
  'nfts.redeposit': {
    function: 'redeposit(collection: `u32`, items: `Vec<u32>`)',
    description: 'Re-evaluate the deposits on some items. - `collection`: The collection of the items to be reevaluated. - `items`: The items of the collection whose deposits will be reevaluated.'
  },
  'nfts.setAcceptOwnership': {
    function: 'setAcceptOwnership(maybe_collection: `Option<u32>`)',
    description: 'Set (or reset) the acceptance of ownership for a particular account. - `maybe_collection`: The identifier of the collection whose ownership the signer is willing to accept, or if `None`, an indication that the signer is willing to accept no ownership transferal.'
  },
  'nfts.setAttribute': {
    function: 'setAttribute(collection: `u32`, maybe_item: `Option<u32>`, namespace: `PalletNftsAttributeNamespace`, key: `Bytes`, value: `Bytes`)',
    description: "Set an attribute for a collection or item. - `CollectionOwner` namespace could be modified by the `collection` Admin only; - `ItemOwner` namespace could be modified by the `maybe_item` owner only. `maybe_item` should be set in that case; - `Account(AccountId)` namespace could be modified only when the `origin` was given a permission to do so; - `collection`: The identifier of the collection whose item's metadata to set. - `maybe_item`: The identifier of the item whose metadata to set. - `namespace`: Attribute's namespace. - `key`: The key of the attribute. - `value`: The value to which to set the attribute."
  },
  'nfts.setAttributesPreSigned': {
    function: 'setAttributesPreSigned(data: `PalletNftsPreSignedAttributes`, signature: `SpRuntimeMultiSignature`, signer: `AccountId32`)',
    description: "Set attributes for an item by providing the pre-signed approval. - `data`: The pre-signed approval that consists of the information about the item, attributes to update and until what block number. - `signature`: The signature of the `data` object. - `signer`: The `data` object's signer. Should be an Admin of the collection for the `CollectionOwner` namespace."
  },
  'nfts.setCollectionMaxSupply': {
    function: 'setCollectionMaxSupply(collection: `u32`, max_supply: `u32`)',
    description: 'Set the maximum number of items a collection could have. - `collection`: The identifier of the collection to change. - `max_supply`: The maximum number of items a collection could have.'
  },
  'nfts.setCollectionMetadata': {
    function: 'setCollectionMetadata(collection: `u32`, data: `Bytes`)',
    description: 'Set the metadata for a collection. - `collection`: The identifier of the item whose metadata to update. - `data`: The general information of this item. Limited in length by `StringLimit`.'
  },
  'nfts.setMetadata': {
    function: 'setMetadata(collection: `u32`, item: `u32`, data: `Bytes`)',
    description: "Set the metadata for an item. - `collection`: The identifier of the collection whose item's metadata to set. - `item`: The identifier of the item whose metadata to set. - `data`: The general information of this item. Limited in length by `StringLimit`."
  },
  'nfts.setPrice': {
    function: 'setPrice(collection: `u32`, item: `u32`, price: `Option<u128>`, whitelisted_buyer: `Option<MultiAddress>`)',
    description: 'Set (or reset) the price for an item. - `collection`: The collection of the item. - `item`: The item to set the price for. - `price`: The price for the item. Pass `None`, to reset the price. - `buyer`: Restricts the buy operation to a specific account.'
  },
  'nfts.setTeam': {
    function: 'setTeam(collection: `u32`, issuer: `Option<MultiAddress>`, admin: `Option<MultiAddress>`, freezer: `Option<MultiAddress>`)',
    description: 'Change the Issuer, Admin and Freezer of a collection. - `collection`: The collection whose team should be changed. - `issuer`: The new Issuer of this collection. - `admin`: The new Admin of this collection. - `freezer`: The new Freezer of this collection.'
  },
  'nfts.transfer': {
    function: 'transfer(collection: `u32`, item: `u32`, dest: `MultiAddress`)',
    description: 'Move an item from the sender account to another. - the Owner of the `item`; - the approved delegate for the `item` (in this case, the approval is reset). - `collection`: The collection of the item to be transferred. - `item`: The item to be transferred. - `dest`: The account to receive ownership of the item.'
  },
  'nfts.transferOwnership': {
    function: 'transferOwnership(collection: `u32`, new_owner: `MultiAddress`)',
    description: 'Change the Owner of a collection. - `collection`: The collection whose owner should be changed. - `owner`: The new Owner of this collection. They must have called `set_accept_ownership` with `collection` in order for this operation to succeed.'
  },
  'nfts.unlockItemTransfer': {
    function: 'unlockItemTransfer(collection: `u32`, item: `u32`)',
    description: 'Re-allow unprivileged transfer of an item. - `collection`: The collection of the item to be changed. - `item`: The item to become transferable.'
  },
  'nfts.updateMintSettings': {
    function: 'updateMintSettings(collection: `u32`, mint_settings: `PalletNftsMintSettings`)',
    description: 'Update mint settings. - `collection`: The identifier of the collection to change. - `mint_settings`: The new mint settings.'
  },
  'nis.communify': {
    function: 'communify(index: `Compact<u32>`)',
    description: 'Make a private receipt communal and create fungible counterparts for its owner.'
  },
  'nis.fundDeficit': {
    function: 'fundDeficit()',
    description: 'Ensure we have sufficient funding for all potential payouts. - `origin`: Must be accepted by `FundOrigin`.'
  },
  'nis.placeBid': {
    function: 'placeBid(amount: `Compact<u128>`, duration: `u32`)',
    description: 'Place a bid. - `amount`: The amount of the bid; these funds will be reserved, and if/when consolidated, removed. Must be at least `MinBid`. - `duration`: The number of periods before which the newly consolidated bid may be thawed. Must be greater than 1 and no more than `QueueCount`. - `Queues[duration].len()` (just take max).'
  },
  'nis.privatize': {
    function: 'privatize(index: `Compact<u32>`)',
    description: 'Make a communal receipt private and burn fungible counterparts from its owner.'
  },
  'nis.retractBid': {
    function: 'retractBid(amount: `Compact<u128>`, duration: `u32`)',
    description: 'Retract a previously placed bid. - `amount`: The amount of the previous bid. - `duration`: The duration of the previous bid.'
  },
  'nis.thawCommunal': {
    function: 'thawCommunal(index: `Compact<u32>`)',
    description: 'Reduce or remove an outstanding receipt, placing the according proportion of funds into the account of the owner. - `origin`: Must be Signed and the account must be the owner of the fungible counterpart for receipt `index`. - `index`: The index of the receipt.'
  },
  'nis.thawPrivate': {
    function: 'thawPrivate(index: `Compact<u32>`, maybe_proportion: `Option<Perquintill>`)',
    description: 'Reduce or remove an outstanding receipt, placing the according proportion of funds into the account of the owner. - `origin`: Must be Signed and the account must be the owner of the receipt `index` as well as any fungible counterpart. - `index`: The index of the receipt. - `portion`: If `Some`, then only the given portion of the receipt should be thawed. If `None`, then all of it should be.'
  },
  'nominationPools.adjustPoolDeposit': {
    function: 'adjustPoolDeposit(pool_id: `u32`)',
    description: 'Top up the deficit or withdraw the excess ED from the pool.'
  },
  'nominationPools.applySlash': {
    function: 'applySlash(member_account: `MultiAddress`)',
    description: 'Apply a pending slash on a member.'
  },
  'nominationPools.bondExtra': {
    function: 'bondExtra(extra: `PalletNominationPoolsBondExtra`)',
    description: 'Bond `extra` more funds from `origin` into the pool to which they already belong.'
  },
  'nominationPools.bondExtraOther': {
    function: 'bondExtraOther(member: `MultiAddress`, extra: `PalletNominationPoolsBondExtra`)',
    description: '`origin` bonds funds from `extra` for some pool member `member` into their respective pools.'
  },
  'nominationPools.chill': {
    function: 'chill(pool_id: `u32`)',
    description: 'Chill on behalf of the pool.'
  },
  'nominationPools.claimCommission': {
    function: 'claimCommission(pool_id: `u32`)',
    description: 'Claim pending commission.'
  },
  'nominationPools.claimPayout': {
    function: 'claimPayout()',
    description: "A bonded member can use this to claim their payout based on the rewards that the pool has accumulated since their last claimed payout (OR since joining if this is their first time claiming rewards). The payout will be transferred to the member's account."
  },
  'nominationPools.claimPayoutOther': {
    function: 'claimPayoutOther(other: `AccountId32`)',
    description: "`origin` can claim payouts on some pool member `other`'s behalf."
  },
  'nominationPools.create': {
    function: 'create(amount: `Compact<u128>`, root: `MultiAddress`, nominator: `MultiAddress`, bouncer: `MultiAddress`)',
    description: 'Create a new delegation pool.'
  },
  'nominationPools.createWithPoolId': {
    function: 'createWithPoolId(amount: `Compact<u128>`, root: `MultiAddress`, nominator: `MultiAddress`, bouncer: `MultiAddress`, pool_id: `u32`)',
    description: 'Create a new delegation pool with a previously used pool id.'
  },
  'nominationPools.join': {
    function: 'join(amount: `Compact<u128>`, pool_id: `u32`)',
    description: "Stake funds with a pool. The amount to bond is delegated from the member to the pool account and immediately increases the pool's bond."
  },
  'nominationPools.migrateDelegation': {
    function: 'migrateDelegation(member_account: `MultiAddress`)',
    description: 'Migrates delegated funds from the pool account to the `member_account`.'
  },
  'nominationPools.migratePoolToDelegateStake': {
    function: 'migratePoolToDelegateStake(pool_id: `u32`)',
    description: 'Migrate pool.'
  },
  'nominationPools.nominate': {
    function: 'nominate(pool_id: `u32`, validators: `Vec<AccountId32>`)',
    description: 'Nominate on behalf of the pool.'
  },
  'nominationPools.poolWithdrawUnbonded': {
    function: 'poolWithdrawUnbonded(pool_id: `u32`, num_slashing_spans: `u32`)',
    description: 'Remove any unlocked chunks from the `unlocking` queue. This call can be made by any account.'
  },
  'nominationPools.setClaimPermission': {
    function: 'setClaimPermission(permission: `PalletNominationPoolsClaimPermission`)',
    description: 'Allows a pool member to set a claim permission to allow or disallow permissionless bonding and withdrawing.'
  },
  'nominationPools.setCommission': {
    function: 'setCommission(pool_id: `u32`, new_commission: `Option<(Perbill,AccountId32)>`)',
    description: 'Set the commission of a pool. Both a commission percentage and a commission payee must be provided in the `current` tuple. Where a `current` of `None` is provided, any current commission will be removed. - If a `None` is supplied to `new_commission`, existing commission will be removed.'
  },
  'nominationPools.setCommissionChangeRate': {
    function: 'setCommissionChangeRate(pool_id: `u32`, change_rate: `PalletNominationPoolsCommissionChangeRate`)',
    description: 'Set the commission change rate for a pool.'
  },
  'nominationPools.setCommissionClaimPermission': {
    function: 'setCommissionClaimPermission(pool_id: `u32`, permission: `Option<PalletNominationPoolsCommissionClaimPermission>`)',
    description: "Set or remove a pool's commission claim permission."
  },
  'nominationPools.setCommissionMax': {
    function: 'setCommissionMax(pool_id: `u32`, max_commission: `Perbill`)',
    description: 'Set the maximum commission of a pool. - Initial max can be set to any `Perbill`, and only smaller values thereafter. - Current commission will be lowered in the event it is higher than a new max commission.'
  },
  'nominationPools.setConfigs': {
    function: 'setConfigs(min_join_bond: `PalletNominationPoolsConfigOpU128`, min_create_bond: `PalletNominationPoolsConfigOpU128`, max_pools: `PalletNominationPoolsConfigOpU32`, max_members: `PalletNominationPoolsConfigOpU32`, max_members_per_pool: `PalletNominationPoolsConfigOpU32`, global_max_commission: `PalletNominationPoolsConfigOpPerbill`)',
    description: 'Update configurations for the nomination pools. The origin for this call must be root.'
  },
  'nominationPools.setMetadata': {
    function: 'setMetadata(pool_id: `u32`, metadata: `Bytes`)',
    description: 'Set a new metadata for the pool.'
  },
  'nominationPools.setState': {
    function: 'setState(pool_id: `u32`, state: `PalletNominationPoolsPoolState`)',
    description: 'Set a new state for the pool.'
  },
  'nominationPools.unbond': {
    function: 'unbond(member_account: `MultiAddress`, unbonding_points: `Compact<u128>`)',
    description: "Unbond up to `unbonding_points` of the `member_account`'s funds from the pool. It implicitly collects the rewards one last time, since not doing so would mean some rewards would be forfeited."
  },
  'nominationPools.updateRoles': {
    function: 'updateRoles(pool_id: `u32`, new_root: `PalletNominationPoolsConfigOpAccountId32`, new_nominator: `PalletNominationPoolsConfigOpAccountId32`, new_bouncer: `PalletNominationPoolsConfigOpAccountId32`)',
    description: 'Update the roles of the pool.'
  },
  'nominationPools.withdrawUnbonded': {
    function: 'withdrawUnbonded(member_account: `MultiAddress`, num_slashing_spans: `u32`)',
    description: 'Withdraw unbonded funds from `member_account`. If no bonded funds can be unbonded, an error is returned. - If the target is the depositor, the pool will be destroyed. - If the pool has any pending slash, we also try to slash the member before letting them withdraw. This calculation adds some weight overhead and is only defensive. In reality, pool slashes must have been already applied via permissionless [`Call::apply_slash`].'
  },
  'parameters.setParameter': {
    function: 'setParameter(key_value: `KitchensinkRuntimeRuntimeParameters`)',
    description: 'Set the value of a parameter.'
  },
  'poolAssets.approveTransfer': {
    function: 'approveTransfer(id: `Compact<u32>`, delegate: `MultiAddress`, amount: `Compact<u128>`)',
    description: 'Approve an amount of asset for transfer by a delegated third-party account. - `id`: The identifier of the asset. - `delegate`: The account to delegate permission to transfer asset. - `amount`: The amount of asset that may be transferred by `delegate`. If there is already an approval in place, then this acts additively.'
  },
  'poolAssets.block': {
    function: 'block(id: `Compact<u32>`, who: `MultiAddress`)',
    description: "Disallow further unprivileged transfers of an asset `id` to and from an account `who`. - `id`: The identifier of the account's asset. - `who`: The account to be unblocked."
  },
  'poolAssets.burn': {
    function: 'burn(id: `Compact<u32>`, who: `MultiAddress`, amount: `Compact<u128>`)',
    description: "Reduce the balance of `who` by as much as possible up to `amount` assets of `id`. - `id`: The identifier of the asset to have some amount burned. - `who`: The account to be debited from. - `amount`: The maximum amount by which `who`'s balance should be reduced."
  },
  'poolAssets.cancelApproval': {
    function: 'cancelApproval(id: `Compact<u32>`, delegate: `MultiAddress`)',
    description: 'Cancel all of some asset approved for delegated transfer by a third-party account. - `id`: The identifier of the asset. - `delegate`: The account delegated permission to transfer asset.'
  },
  'poolAssets.clearMetadata': {
    function: 'clearMetadata(id: `Compact<u32>`)',
    description: 'Clear the metadata for an asset. - `id`: The identifier of the asset to clear.'
  },
  'poolAssets.create': {
    function: 'create(id: `Compact<u32>`, admin: `MultiAddress`, min_balance: `u128`)',
    description: "Issue a new class of fungible assets from a public origin. - `id`: The identifier of the new asset. This must not be currently in use to identify an existing asset. If [`NextAssetId`] is set, then this must be equal to it. - `admin`: The admin of this class of assets. The admin is the initial address of each member of the asset class's admin team. - `min_balance`: The minimum balance of this new asset that any single account must have. If an account's balance is reduced below this, then it collapses to zero."
  },
  'poolAssets.destroyAccounts': {
    function: 'destroyAccounts(id: `Compact<u32>`)',
    description: 'Destroy all accounts associated with a given asset. - `id`: The identifier of the asset to be destroyed. This must identify an existing asset.'
  },
  'poolAssets.destroyApprovals': {
    function: 'destroyApprovals(id: `Compact<u32>`)',
    description: 'Destroy all approvals associated with a given asset up to the max (T::RemoveItemsLimit). - `id`: The identifier of the asset to be destroyed. This must identify an existing asset.'
  },
  'poolAssets.finishDestroy': {
    function: 'finishDestroy(id: `Compact<u32>`)',
    description: 'Complete destroying asset and unreserve currency. - `id`: The identifier of the asset to be destroyed. This must identify an existing asset.'
  },
  'poolAssets.forceAssetStatus': {
    function: 'forceAssetStatus(id: `Compact<u32>`, owner: `MultiAddress`, issuer: `MultiAddress`, admin: `MultiAddress`, freezer: `MultiAddress`, min_balance: `Compact<u128>`, is_sufficient: `bool`, is_frozen: `bool`)',
    description: "Alter the attributes of a given asset. - `id`: The identifier of the asset. - `owner`: The new Owner of this asset. - `issuer`: The new Issuer of this asset. - `admin`: The new Admin of this asset. - `freezer`: The new Freezer of this asset. - `min_balance`: The minimum balance of this new asset that any single account must have. If an account's balance is reduced below this, then it collapses to zero. - `is_sufficient`: Whether a non-zero balance of this asset is deposit of sufficient value to account for the state bloat associated with its balance storage. If set to `true`, then non-zero balances may be stored without a `consumer` reference (and thus an ED in the Balances pallet or whatever else is used to control user-account state growth). - `is_frozen`: Whether this asset class is frozen except for permissioned/admin instructions."
  },
  'poolAssets.forceCancelApproval': {
    function: 'forceCancelApproval(id: `Compact<u32>`, owner: `MultiAddress`, delegate: `MultiAddress`)',
    description: 'Cancel all of some asset approved for delegated transfer by a third-party account. - `id`: The identifier of the asset. - `delegate`: The account delegated permission to transfer asset.'
  },
  'poolAssets.forceClearMetadata': {
    function: 'forceClearMetadata(id: `Compact<u32>`)',
    description: 'Clear the metadata for an asset. - `id`: The identifier of the asset to clear.'
  },
  'poolAssets.forceCreate': {
    function: 'forceCreate(id: `Compact<u32>`, owner: `MultiAddress`, is_sufficient: `bool`, min_balance: `Compact<u128>`)',
    description: "Issue a new class of fungible assets from a privileged origin. - `id`: The identifier of the new asset. This must not be currently in use to identify an existing asset. If [`NextAssetId`] is set, then this must be equal to it. - `owner`: The owner of this class of assets. The owner has full superuser permissions over this asset, but may later change and configure the permissions using `transfer_ownership` and `set_team`. - `min_balance`: The minimum balance of this new asset that any single account must have. If an account's balance is reduced below this, then it collapses to zero."
  },
  'poolAssets.forceSetMetadata': {
    function: 'forceSetMetadata(id: `Compact<u32>`, name: `Bytes`, symbol: `Bytes`, decimals: `u8`, is_frozen: `bool`)',
    description: 'Force the metadata for an asset to some value. - `id`: The identifier of the asset to update. - `name`: The user friendly name of this asset. Limited in length by `StringLimit`. - `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`. - `decimals`: The number of decimals this asset uses to represent one unit.'
  },
  'poolAssets.forceTransfer': {
    function: 'forceTransfer(id: `Compact<u32>`, source: `MultiAddress`, dest: `MultiAddress`, amount: `Compact<u128>`)',
    description: "Move some assets from one account to another. - `id`: The identifier of the asset to have some amount transferred. - `source`: The account to be debited. - `dest`: The account to be credited. - `amount`: The amount by which the `source`'s balance of assets should be reduced and `dest`'s balance increased. The amount actually transferred may be slightly greater in the case that the transfer would otherwise take the `source` balance above zero but below the minimum balance. Must be greater than zero."
  },
  'poolAssets.freeze': {
    function: 'freeze(id: `Compact<u32>`, who: `MultiAddress`)',
    description: 'Disallow further unprivileged transfers of an asset `id` from an account `who`. `who` must already exist as an entry in `Account`s of the asset. If you want to freeze an account that does not have an entry, use `touch_other` first. - `id`: The identifier of the asset to be frozen. - `who`: The account to be frozen.'
  },
  'poolAssets.freezeAsset': {
    function: 'freezeAsset(id: `Compact<u32>`)',
    description: 'Disallow further unprivileged transfers for the asset class. - `id`: The identifier of the asset to be frozen.'
  },
  'poolAssets.mint': {
    function: 'mint(id: `Compact<u32>`, beneficiary: `MultiAddress`, amount: `Compact<u128>`)',
    description: 'Mint assets of a particular class. - `id`: The identifier of the asset to have some amount minted. - `beneficiary`: The account to be credited with the minted assets. - `amount`: The amount of the asset to be minted.'
  },
  'poolAssets.refund': {
    function: 'refund(id: `Compact<u32>`, allow_burn: `bool`)',
    description: 'Return the deposit (if any) of an asset account or a consumer reference (if any) of an account. - `id`: The identifier of the asset for which the caller would like the deposit refunded. - `allow_burn`: If `true` then assets may be destroyed in order to complete the refund.'
  },
  'poolAssets.refundOther': {
    function: 'refundOther(id: `Compact<u32>`, who: `MultiAddress`)',
    description: 'Return the deposit (if any) of a target asset account. Useful if you are the depositor. - `id`: The identifier of the asset for the account holding a deposit. - `who`: The account to refund.'
  },
  'poolAssets.setMetadata': {
    function: 'setMetadata(id: `Compact<u32>`, name: `Bytes`, symbol: `Bytes`, decimals: `u8`)',
    description: 'Set the metadata for an asset. - `id`: The identifier of the asset to update. - `name`: The user friendly name of this asset. Limited in length by `StringLimit`. - `symbol`: The exchange symbol for this asset. Limited in length by `StringLimit`. - `decimals`: The number of decimals this asset uses to represent one unit.'
  },
  'poolAssets.setMinBalance': {
    function: 'setMinBalance(id: `Compact<u32>`, min_balance: `u128`)',
    description: 'Sets the minimum balance of an asset. - `id`: The identifier of the asset. - `min_balance`: The new value of `min_balance`.'
  },
  'poolAssets.setTeam': {
    function: 'setTeam(id: `Compact<u32>`, issuer: `MultiAddress`, admin: `MultiAddress`, freezer: `MultiAddress`)',
    description: 'Change the Issuer, Admin and Freezer of an asset. - `id`: The identifier of the asset to be frozen. - `issuer`: The new Issuer of this asset. - `admin`: The new Admin of this asset. - `freezer`: The new Freezer of this asset.'
  },
  'poolAssets.startDestroy': {
    function: 'startDestroy(id: `Compact<u32>`)',
    description: 'Start the process of destroying a fungible asset class. - `id`: The identifier of the asset to be destroyed. This must identify an existing asset.'
  },
  'poolAssets.thaw': {
    function: 'thaw(id: `Compact<u32>`, who: `MultiAddress`)',
    description: 'Allow unprivileged transfers to and from an account again. - `id`: The identifier of the asset to be frozen. - `who`: The account to be unfrozen.'
  },
  'poolAssets.thawAsset': {
    function: 'thawAsset(id: `Compact<u32>`)',
    description: 'Allow unprivileged transfers for the asset again. - `id`: The identifier of the asset to be thawed.'
  },
  'poolAssets.touch': {
    function: 'touch(id: `Compact<u32>`)',
    description: 'Create an asset account for non-provider assets. - `origin`: Must be Signed; the signer account must have sufficient funds for a deposit to be taken. - `id`: The identifier of the asset for the account to be created.'
  },
  'poolAssets.touchOther': {
    function: 'touchOther(id: `Compact<u32>`, who: `MultiAddress`)',
    description: 'Create an asset account for `who`. - `origin`: Must be Signed by `Freezer` or `Admin` of the asset `id`; the signer account must have sufficient funds for a deposit to be taken. - `id`: The identifier of the asset for the account to be created. - `who`: The account to be created.'
  },
  'poolAssets.transfer': {
    function: 'transfer(id: `Compact<u32>`, target: `MultiAddress`, amount: `Compact<u128>`)',
    description: "Move some assets from the sender account to another. - `id`: The identifier of the asset to have some amount transferred. - `target`: The account to be credited. - `amount`: The amount by which the sender's balance of assets should be reduced and `target`'s balance increased. The amount actually transferred may be slightly greater in the case that the transfer would otherwise take the sender balance above zero but below the minimum balance. Must be greater than zero."
  },
  'poolAssets.transferAll': {
    function: 'transferAll(id: `Compact<u32>`, dest: `MultiAddress`, keep_alive: `bool`)',
    description: 'Transfer the entire transferable balance from the caller asset account. - `id`: The identifier of the asset for the account holding a deposit. - `dest`: The recipient of the transfer. - `keep_alive`: A boolean to determine if the `transfer_all` operation should send all of the funds the asset account has, causing the sender asset account to be killed (false), or transfer everything except at least the minimum balance, which will guarantee to keep the sender asset account alive (true).'
  },
  'poolAssets.transferApproved': {
    function: 'transferApproved(id: `Compact<u32>`, owner: `MultiAddress`, destination: `MultiAddress`, amount: `Compact<u128>`)',
    description: 'Transfer some asset balance from a previously delegated account to some third-party account. - `id`: The identifier of the asset. - `owner`: The account which previously approved for a transfer of at least `amount` and from which the asset balance will be withdrawn. - `destination`: The account to which the asset balance of `amount` will be transferred. - `amount`: The amount of assets to transfer.'
  },
  'poolAssets.transferKeepAlive': {
    function: 'transferKeepAlive(id: `Compact<u32>`, target: `MultiAddress`, amount: `Compact<u128>`)',
    description: "Move some assets from the sender account to another, keeping the sender account alive. - `id`: The identifier of the asset to have some amount transferred. - `target`: The account to be credited. - `amount`: The amount by which the sender's balance of assets should be reduced and `target`'s balance increased. The amount actually transferred may be slightly greater in the case that the transfer would otherwise take the sender balance above zero but below the minimum balance. Must be greater than zero."
  },
  'poolAssets.transferOwnership': {
    function: 'transferOwnership(id: `Compact<u32>`, owner: `MultiAddress`)',
    description: 'Change the Owner of an asset. - `id`: The identifier of the asset. - `owner`: The new Owner of this asset.'
  },
  'preimage.ensureUpdated': {
    function: 'ensureUpdated(hashes: `Vec<H256>`)',
    description: 'Ensure that the bulk of pre-images is upgraded.'
  },
  'preimage.notePreimage': {
    function: 'notePreimage(bytes: `Bytes`)',
    description: 'Register a preimage on-chain.'
  },
  'preimage.requestPreimage': {
    function: 'requestPreimage(hash: `H256`)',
    description: 'Request a preimage be uploaded to the chain without paying any fees or deposits.'
  },
  'preimage.unnotePreimage': {
    function: 'unnotePreimage(hash: `H256`)',
    description: 'Clear an unrequested preimage from the runtime storage. - `hash`: The hash of the preimage to be removed from the store. - `len`: The length of the preimage of `hash`.'
  },
  'preimage.unrequestPreimage': {
    function: 'unrequestPreimage(hash: `H256`)',
    description: 'Clear a previously made request for a preimage.'
  },
  'proxy.addProxy': {
    function: 'addProxy(delegate: `MultiAddress`, proxy_type: `KitchensinkRuntimeProxyType`, delay: `u32`)',
    description: 'Register a proxy account for the sender that is able to make calls on its behalf. - `proxy`: The account that the `caller` would like to make a proxy. - `proxy_type`: The permissions allowed for this proxy account. - `delay`: The announcement period required of the initial proxy. Will generally be zero.'
  },
  'proxy.announce': {
    function: 'announce(real: `MultiAddress`, call_hash: `H256`)',
    description: 'Publish the hash of a proxy-call that will be made in the future. - `real`: The account that the proxy will make a call on behalf of. - `call_hash`: The hash of the call to be made by the `real` account.'
  },
  'proxy.createPure': {
    function: 'createPure(proxy_type: `KitchensinkRuntimeProxyType`, delay: `u32`, index: `u16`)',
    description: "Spawn a fresh new account that is guaranteed to be otherwise inaccessible, and initialize it with a proxy of `proxy_type` for `origin` sender. - `proxy_type`: The type of the proxy that the sender will be registered as over the new account. This will almost always be the most permissive `ProxyType` possible to allow for maximum flexibility. - `index`: A disambiguation index, in case this is called multiple times in the same transaction (e.g. with `utility::batch`). Unless you're using `batch` you probably just want to use `0`. - `delay`: The announcement period required of the initial proxy. Will generally be zero."
  },
  'proxy.killPure': {
    function: 'killPure(spawner: `MultiAddress`, proxy_type: `KitchensinkRuntimeProxyType`, index: `u16`, height: `Compact<u32>`, ext_index: `Compact<u32>`)',
    description: 'Removes a previously spawned pure proxy. - `spawner`: The account that originally called `pure` to create this account. - `index`: The disambiguation index originally passed to `pure`. Probably `0`. - `proxy_type`: The proxy type originally passed to `pure`. - `height`: The height of the chain when the call to `pure` was processed. - `ext_index`: The extrinsic index in which the call to `pure` was processed.'
  },
  'proxy.pokeDeposit': {
    function: 'pokeDeposit()',
    description: 'Poke / Adjust deposits made for proxies and announcements based on current values. This can be used by accounts to possibly lower their locked amount.'
  },
  'proxy.proxy': {
    function: 'proxy(real: `MultiAddress`, force_proxy_type: `Option<KitchensinkRuntimeProxyType>`, call: `Call`)',
    description: 'Dispatch the given `call` from an account that the sender is authorised for through `add_proxy`. - `real`: The account that the proxy will make a call on behalf of. - `force_proxy_type`: Specify the exact proxy type to be used and checked for this call. - `call`: The call to be made by the `real` account.'
  },
  'proxy.proxyAnnounced': {
    function: 'proxyAnnounced(delegate: `MultiAddress`, real: `MultiAddress`, force_proxy_type: `Option<KitchensinkRuntimeProxyType>`, call: `Call`)',
    description: 'Dispatch the given `call` from an account that the sender is authorized for through `add_proxy`. - `real`: The account that the proxy will make a call on behalf of. - `force_proxy_type`: Specify the exact proxy type to be used and checked for this call. - `call`: The call to be made by the `real` account.'
  },
  'proxy.rejectAnnouncement': {
    function: 'rejectAnnouncement(delegate: `MultiAddress`, call_hash: `H256`)',
    description: 'Remove the given announcement of a delegate. - `delegate`: The account that previously announced the call. - `call_hash`: The hash of the call to be made.'
  },
  'proxy.removeAnnouncement': {
    function: 'removeAnnouncement(real: `MultiAddress`, call_hash: `H256`)',
    description: 'Remove a given announcement. - `real`: The account that the proxy will make a call on behalf of. - `call_hash`: The hash of the call to be made by the `real` account.'
  },
  'proxy.removeProxies': {
    function: 'removeProxies()',
    description: 'Unregister all proxy accounts for the sender.'
  },
  'proxy.removeProxy': {
    function: 'removeProxy(delegate: `MultiAddress`, proxy_type: `KitchensinkRuntimeProxyType`, delay: `u32`)',
    description: 'Unregister a proxy account for the sender. - `proxy`: The account that the `caller` would like to remove as a proxy. - `proxy_type`: The permissions currently enabled for the removed proxy account.'
  },
  'rankedCollective.addMember': {
    function: 'addMember(who: `MultiAddress`)',
    description: 'Introduce a new member. - `origin`: Must be the `AddOrigin`. - `who`: Account of non-member which will become a member.'
  },
  'rankedCollective.cleanupPoll': {
    function: 'cleanupPoll(poll_index: `u32`, max: `u32`)',
    description: 'Remove votes from the given poll. It must have ended. - `origin`: Must be `Signed` by any account. - `poll_index`: Index of a poll which is completed and for which votes continue to exist. - `max`: Maximum number of vote items from remove in this call.'
  },
  'rankedCollective.demoteMember': {
    function: 'demoteMember(who: `MultiAddress`)',
    description: 'Decrement the rank of an existing member by one. If the member is already at rank zero, then they are removed entirely. - `origin`: Must be the `DemoteOrigin`. - `who`: Account of existing member of rank greater than zero.'
  },
  'rankedCollective.exchangeMember': {
    function: 'exchangeMember(who: `MultiAddress`, new_who: `MultiAddress`)',
    description: 'Exchanges a member with a new account and the same existing rank. - `origin`: Must be the `ExchangeOrigin`. - `who`: Account of existing member of rank greater than zero to be exchanged. - `new_who`: New Account of existing member of rank greater than zero to exchanged to.'
  },
  'rankedCollective.promoteMember': {
    function: 'promoteMember(who: `MultiAddress`)',
    description: 'Increment the rank of an existing member by one. - `origin`: Must be the `PromoteOrigin`. - `who`: Account of existing member.'
  },
  'rankedCollective.removeMember': {
    function: 'removeMember(who: `MultiAddress`, min_rank: `u16`)',
    description: 'Remove the member entirely. - `origin`: Must be the `RemoveOrigin`. - `who`: Account of existing member of rank greater than zero. - `min_rank`: The rank of the member or greater.'
  },
  'rankedCollective.vote': {
    function: 'vote(poll: `u32`, aye: `bool`)',
    description: 'Add an aye or nay vote for the sender to the given proposal. - `origin`: Must be `Signed` by a member account. - `poll`: Index of a poll which is ongoing. - `aye`: `true` if the vote is to approve the proposal, `false` otherwise.'
  },
  'rankedPolls.cancel': {
    function: 'cancel(index: `u32`)',
    description: 'Cancel an ongoing referendum. - `origin`: must be the `CancelOrigin`. - `index`: The index of the referendum to be cancelled.'
  },
  'rankedPolls.kill': {
    function: 'kill(index: `u32`)',
    description: 'Cancel an ongoing referendum and slash the deposits. - `origin`: must be the `KillOrigin`. - `index`: The index of the referendum to be cancelled.'
  },
  'rankedPolls.nudgeReferendum': {
    function: 'nudgeReferendum(index: `u32`)',
    description: 'Advance a referendum onto its next logical state. Only used internally. - `origin`: must be `Root`. - `index`: the referendum to be advanced.'
  },
  'rankedPolls.oneFewerDeciding': {
    function: 'oneFewerDeciding(track: `u16`)',
    description: 'Advance a track onto its next logical state. Only used internally. - `origin`: must be `Root`. - `track`: the track to be advanced. - begin deciding another referendum (and leave `DecidingCount` alone); or - decrement `DecidingCount`.'
  },
  'rankedPolls.placeDecisionDeposit': {
    function: 'placeDecisionDeposit(index: `u32`)',
    description: "Post the Decision Deposit for a referendum. - `origin`: must be `Signed` and the account must have funds available for the referendum's track's Decision Deposit. - `index`: The index of the submitted referendum whose Decision Deposit is yet to be posted."
  },
  'rankedPolls.refundDecisionDeposit': {
    function: 'refundDecisionDeposit(index: `u32`)',
    description: 'Refund the Decision Deposit for a closed referendum back to the depositor. - `origin`: must be `Signed` or `Root`. - `index`: The index of a closed referendum whose Decision Deposit has not yet been refunded.'
  },
  'rankedPolls.refundSubmissionDeposit': {
    function: 'refundSubmissionDeposit(index: `u32`)',
    description: 'Refund the Submission Deposit for a closed referendum back to the depositor. - `origin`: must be `Signed` or `Root`. - `index`: The index of a closed referendum whose Submission Deposit has not yet been refunded.'
  },
  'rankedPolls.setMetadata': {
    function: 'setMetadata(index: `u32`, maybe_hash: `Option<H256>`)',
    description: 'Set or clear metadata of a referendum. - `origin`: Must be `Signed` by a creator of a referendum or by anyone to clear a metadata of a finished referendum. - `index`: The index of a referendum to set or clear metadata for. - `maybe_hash`: The hash of an on-chain stored preimage. `None` to clear a metadata.'
  },
  'rankedPolls.submit': {
    function: 'submit(proposal_origin: `KitchensinkRuntimeOriginCaller`, proposal: `FrameSupportPreimagesBounded`, enactment_moment: `FrameSupportScheduleDispatchTime`)',
    description: 'Propose a referendum on a privileged action. - `origin`: must be `SubmitOrigin` and the account must have `SubmissionDeposit` funds available. - `proposal_origin`: The origin from which the proposal should be executed. - `proposal`: The proposal. - `enactment_moment`: The moment that the proposal should be enacted.'
  },
  'recovery.asRecovered': {
    function: 'asRecovered(account: `MultiAddress`, call: `Call`)',
    description: 'Send a call through a recovered account. - `account`: The recovered account you want to make a call on-behalf-of. - `call`: The call you want to make with the recovered account.'
  },
  'recovery.cancelRecovered': {
    function: 'cancelRecovered(account: `MultiAddress`)',
    description: 'Cancel the ability to use `as_recovered` for `account`. - `account`: The recovered account you are able to call on-behalf-of.'
  },
  'recovery.claimRecovery': {
    function: 'claimRecovery(account: `MultiAddress`)',
    description: 'Allow a successful rescuer to claim their recovered account. - `account`: The lost account that you want to claim has been successfully recovered by you.'
  },
  'recovery.closeRecovery': {
    function: 'closeRecovery(rescuer: `MultiAddress`)',
    description: 'As the controller of a recoverable account, close an active recovery process for your account. - `rescuer`: The account trying to rescue this recoverable account.'
  },
  'recovery.createRecovery': {
    function: 'createRecovery(friends: `Vec<AccountId32>`, threshold: `u16`, delay_period: `u32`)',
    description: 'Create a recovery configuration for your account. This makes your account recoverable. - `friends`: A list of friends you trust to vouch for recovery attempts. Should be ordered and contain no duplicate values. - `threshold`: The number of friends that must vouch for a recovery attempt before the account can be recovered. Should be less than or equal to the length of the list of friends. - `delay_period`: The number of blocks after a recovery attempt is initialized that needs to pass before the account can be recovered.'
  },
  'recovery.initiateRecovery': {
    function: 'initiateRecovery(account: `MultiAddress`)',
    description: 'Initiate the process for recovering a recoverable account. - `account`: The lost account that you want to recover. This account needs to be recoverable (i.e. have a recovery configuration).'
  },
  'recovery.removeRecovery': {
    function: 'removeRecovery()',
    description: 'Remove the recovery process for your account. Recovered accounts are still accessible.'
  },
  'recovery.setRecovered': {
    function: 'setRecovered(lost: `MultiAddress`, rescuer: `MultiAddress`)',
    description: 'Allow ROOT to bypass the recovery process and set a rescuer account for a lost account directly. - `lost`: The "lost account" to be recovered. - `rescuer`: The "rescuer account" which can call as the lost account.'
  },
  'recovery.vouchRecovery': {
    function: 'vouchRecovery(lost: `MultiAddress`, rescuer: `MultiAddress`)',
    description: 'Allow a "friend" of a recoverable account to vouch for an active recovery process for that account. - `lost`: The lost account that you want to recover. - `rescuer`: The account trying to rescue the lost account that you want to vouch for.'
  },
  'referenda.cancel': {
    function: 'cancel(index: `u32`)',
    description: 'Cancel an ongoing referendum. - `origin`: must be the `CancelOrigin`. - `index`: The index of the referendum to be cancelled.'
  },
  'referenda.kill': {
    function: 'kill(index: `u32`)',
    description: 'Cancel an ongoing referendum and slash the deposits. - `origin`: must be the `KillOrigin`. - `index`: The index of the referendum to be cancelled.'
  },
  'referenda.nudgeReferendum': {
    function: 'nudgeReferendum(index: `u32`)',
    description: 'Advance a referendum onto its next logical state. Only used internally. - `origin`: must be `Root`. - `index`: the referendum to be advanced.'
  },
  'referenda.oneFewerDeciding': {
    function: 'oneFewerDeciding(track: `u16`)',
    description: 'Advance a track onto its next logical state. Only used internally. - `origin`: must be `Root`. - `track`: the track to be advanced. - begin deciding another referendum (and leave `DecidingCount` alone); or - decrement `DecidingCount`.'
  },
  'referenda.placeDecisionDeposit': {
    function: 'placeDecisionDeposit(index: `u32`)',
    description: "Post the Decision Deposit for a referendum. - `origin`: must be `Signed` and the account must have funds available for the referendum's track's Decision Deposit. - `index`: The index of the submitted referendum whose Decision Deposit is yet to be posted."
  },
  'referenda.refundDecisionDeposit': {
    function: 'refundDecisionDeposit(index: `u32`)',
    description: 'Refund the Decision Deposit for a closed referendum back to the depositor. - `origin`: must be `Signed` or `Root`. - `index`: The index of a closed referendum whose Decision Deposit has not yet been refunded.'
  },
  'referenda.refundSubmissionDeposit': {
    function: 'refundSubmissionDeposit(index: `u32`)',
    description: 'Refund the Submission Deposit for a closed referendum back to the depositor. - `origin`: must be `Signed` or `Root`. - `index`: The index of a closed referendum whose Submission Deposit has not yet been refunded.'
  },
  'referenda.setMetadata': {
    function: 'setMetadata(index: `u32`, maybe_hash: `Option<H256>`)',
    description: 'Set or clear metadata of a referendum. - `origin`: Must be `Signed` by a creator of a referendum or by anyone to clear a metadata of a finished referendum. - `index`: The index of a referendum to set or clear metadata for. - `maybe_hash`: The hash of an on-chain stored preimage. `None` to clear a metadata.'
  },
  'referenda.submit': {
    function: 'submit(proposal_origin: `KitchensinkRuntimeOriginCaller`, proposal: `FrameSupportPreimagesBounded`, enactment_moment: `FrameSupportScheduleDispatchTime`)',
    description: 'Propose a referendum on a privileged action. - `origin`: must be `SubmitOrigin` and the account must have `SubmissionDeposit` funds available. - `proposal_origin`: The origin from which the proposal should be executed. - `proposal`: The proposal. - `enactment_moment`: The moment that the proposal should be enacted.'
  },
  'remark.store': {
    function: 'store(remark: `Bytes`)',
    description: 'Index and store data off chain.'
  },
  'revive.call': {
    function: 'call(dest: `H160`, value: `Compact<u128>`, gas_limit: `SpWeightsWeightV2Weight`, storage_deposit_limit: `Compact<u128>`, data: `Bytes`)',
    description: 'Makes a call to an account, optionally transferring some balance.'
  },
  'revive.dispatchAsFallbackAccount': {
    function: 'dispatchAsFallbackAccount(call: `Call`)',
    description: 'Dispatch an `call` with the origin set to the callers fallback address.'
  },
  'revive.ethTransact': {
    function: 'ethTransact(payload: `Bytes`)',
    description: 'A raw EVM transaction, typically dispatched by an Ethereum JSON-RPC server.'
  },
  'revive.instantiate': {
    function: 'instantiate(value: `Compact<u128>`, gas_limit: `SpWeightsWeightV2Weight`, storage_deposit_limit: `Compact<u128>`, code_hash: `H256`, data: `Bytes`, salt: `Option<[u8;32]>`)',
    description: 'Instantiates a contract from a previously deployed wasm binary.'
  },
  'revive.instantiateWithCode': {
    function: 'instantiateWithCode(value: `Compact<u128>`, gas_limit: `SpWeightsWeightV2Weight`, storage_deposit_limit: `Compact<u128>`, code: `Bytes`, data: `Bytes`, salt: `Option<[u8;32]>`)',
    description: 'Instantiates a new contract from the supplied `code` optionally transferring some balance. - The supplied `code` is deployed, and a `code_hash` is created for that code. - If the `code_hash` already exists on the chain the underlying `code` will be shared. - The destination address is computed based on the sender, code_hash and the salt. - The smart-contract account is created at the computed address. - The `value` is transferred to the new account. - The `deploy` function is executed in the context of the newly-created account.'
  },
  'revive.mapAccount': {
    function: 'mapAccount()',
    description: 'Register the callers account id so that it can be used in contract interactions.'
  },
  'revive.removeCode': {
    function: 'removeCode(code_hash: `H256`)',
    description: 'Remove the code stored under `code_hash` and refund the deposit to its owner.'
  },
  'revive.setCode': {
    function: 'setCode(dest: `H160`, code_hash: `H256`)',
    description: 'Privileged function that changes the code of an existing contract.'
  },
  'revive.unmapAccount': {
    function: 'unmapAccount()',
    description: 'Unregister the callers account id in order to free the deposit.'
  },
  'revive.uploadCode': {
    function: 'uploadCode(code: `Bytes`, storage_deposit_limit: `Compact<u128>`)',
    description: 'Upload new `code` without instantiating a contract from it.'
  },
  'rootTesting.fillBlock': {
    function: 'fillBlock(ratio: `Perbill`)',
    description: 'A dispatch that will fill the block weight up to the given ratio.'
  },
  'safeMode.enter': {
    function: 'enter()',
    description: 'Enter safe-mode permissionlessly for [`Config::EnterDuration`] blocks.'
  },
  'safeMode.extend': {
    function: 'extend()',
    description: 'Extend the safe-mode permissionlessly for [`Config::ExtendDuration`] blocks.'
  },
  'safeMode.forceEnter': {
    function: 'forceEnter()',
    description: 'Enter safe-mode by force for a per-origin configured number of blocks.'
  },
  'safeMode.forceExit': {
    function: 'forceExit()',
    description: 'Exit safe-mode by force.'
  },
  'safeMode.forceExtend': {
    function: 'forceExtend()',
    description: 'Extend the safe-mode by force for a per-origin configured number of blocks.'
  },
  'safeMode.forceReleaseDeposit': {
    function: 'forceReleaseDeposit(account: `AccountId32`, block: `u32`)',
    description: 'Force to release a deposit for an account that entered safe-mode at a given historical block.'
  },
  'safeMode.forceSlashDeposit': {
    function: 'forceSlashDeposit(account: `AccountId32`, block: `u32`)',
    description: 'Slash a deposit for an account that entered or extended safe-mode at a given historical block.'
  },
  'safeMode.releaseDeposit': {
    function: 'releaseDeposit(account: `AccountId32`, block: `u32`)',
    description: 'Permissionlessly release a deposit for an account that entered safe-mode at a given historical block.'
  },
  'salary.bump': {
    function: 'bump()',
    description: 'Move to next payout cycle, assuming that the present block is now within that cycle. - `origin`: A `Signed` origin of an account.'
  },
  'salary.checkPayment': {
    function: 'checkPayment()',
    description: "Update a payment's status; if it failed, alter the state so the payment can be retried. - `origin`: A `Signed` origin of an account which is a member of `Members` who has received a payment this cycle."
  },
  'salary.induct': {
    function: 'induct()',
    description: 'Induct oneself into the payout system.'
  },
  'salary.init': {
    function: 'init()',
    description: 'Start the first payout cycle. - `origin`: A `Signed` origin of an account.'
  },
  'salary.payout': {
    function: 'payout()',
    description: 'Request a payout. - `origin`: A `Signed` origin of an account which is a member of `Members`.'
  },
  'salary.payoutOther': {
    function: 'payoutOther(beneficiary: `AccountId32`)',
    description: 'Request a payout to a secondary account. - `origin`: A `Signed` origin of an account which is a member of `Members`. - `beneficiary`: The account to receive payment.'
  },
  'salary.register': {
    function: 'register()',
    description: 'Register for a payout. - `origin`: A `Signed` origin of an account which is a member of `Members`.'
  },
  'scheduler.cancel': {
    function: 'cancel(when: `u32`, index: `u32`)',
    description: 'Cancel an anonymously scheduled task.'
  },
  'scheduler.cancelNamed': {
    function: 'cancelNamed(id: `[u8;32]`)',
    description: 'Cancel a named scheduled task.'
  },
  'scheduler.cancelRetry': {
    function: 'cancelRetry(task: `(u32,u32)`)',
    description: 'Removes the retry configuration of a task.'
  },
  'scheduler.cancelRetryNamed': {
    function: 'cancelRetryNamed(id: `[u8;32]`)',
    description: 'Cancel the retry configuration of a named task.'
  },
  'scheduler.schedule': {
    function: 'schedule(when: `u32`, maybe_periodic: `Option<(u32,u32)>`, priority: `u8`, call: `Call`)',
    description: 'Anonymously schedule a task.'
  },
  'scheduler.scheduleAfter': {
    function: 'scheduleAfter(after: `u32`, maybe_periodic: `Option<(u32,u32)>`, priority: `u8`, call: `Call`)',
    description: 'Anonymously schedule a task after a delay.'
  },
  'scheduler.scheduleNamed': {
    function: 'scheduleNamed(id: `[u8;32]`, when: `u32`, maybe_periodic: `Option<(u32,u32)>`, priority: `u8`, call: `Call`)',
    description: 'Schedule a named task.'
  },
  'scheduler.scheduleNamedAfter': {
    function: 'scheduleNamedAfter(id: `[u8;32]`, after: `u32`, maybe_periodic: `Option<(u32,u32)>`, priority: `u8`, call: `Call`)',
    description: 'Schedule a named task after a delay.'
  },
  'scheduler.setRetry': {
    function: 'setRetry(task: `(u32,u32)`, retries: `u8`, period: `u32`)',
    description: 'Set a retry configuration for a task so that, in case its scheduled run fails, it will be retried after `period` blocks, for a total amount of `retries` retries or until it succeeds.'
  },
  'scheduler.setRetryNamed': {
    function: 'setRetryNamed(id: `[u8;32]`, retries: `u8`, period: `u32`)',
    description: 'Set a retry configuration for a named task so that, in case its scheduled run fails, it will be retried after `period` blocks, for a total amount of `retries` retries or until it succeeds.'
  },
  'session.purgeKeys': {
    function: 'purgeKeys()',
    description: 'Removes any session key(s) of the function caller. - `O(1)` in number of key types. Actual cost depends on the number of length of `T::Keys::key_ids()` which is fixed.'
  },
  'session.setKeys': {
    function: 'setKeys(keys: `KitchensinkRuntimeSessionKeys`, proof: `Bytes`)',
    description: "Sets the session key(s) of the function caller to `keys`. Allows an account to set its session key prior to becoming a validator. This doesn't take effect until the next session. - `O(1)`. Actual cost depends on the number of length of `T::Keys::key_ids()` which is fixed."
  },
  'society.bestowMembership': {
    function: 'bestowMembership(candidate: `AccountId32`)',
    description: 'Transform an approved candidate into a member. Callable only by the Signed origin of the Founder, only after the period for voting has ended and only when the candidate is not clearly rejected.'
  },
  'society.bid': {
    function: 'bid(value: `u128`)',
    description: 'A user outside of the society can make a bid for entry. - `value`: A one time payment the bid would like to receive when joining the society.'
  },
  'society.claimMembership': {
    function: 'claimMembership()',
    description: 'Transform an approved candidate into a member. Callable only by the the candidate, and only after the period for voting has ended.'
  },
  'society.cleanupCandidacy': {
    function: 'cleanupCandidacy(candidate: `AccountId32`, max: `u32`)',
    description: 'Remove up to `max` stale votes for the given `candidate`.'
  },
  'society.cleanupChallenge': {
    function: 'cleanupChallenge(challenge_round: `u32`, max: `u32`)',
    description: 'Remove up to `max` stale votes for the defender in the given `challenge_round`.'
  },
  'society.defenderVote': {
    function: 'defenderVote(approve: `bool`)',
    description: 'As a member, vote on the defender. - `approve`: A boolean which says if the candidate should be approved (`true`) or rejected (`false`).'
  },
  'society.dissolve': {
    function: 'dissolve()',
    description: 'Dissolve the society and remove all members.'
  },
  'society.dropCandidate': {
    function: 'dropCandidate(candidate: `AccountId32`)',
    description: "Remove a `candidate`'s failed application from the society. Callable by any signed origin but only at the end of the subsequent round and only for a candidate with more rejections than approvals."
  },
  'society.foundSociety': {
    function: 'foundSociety(founder: `MultiAddress`, max_members: `u32`, max_intake: `u32`, max_strikes: `u32`, candidate_deposit: `u128`, rules: `Bytes`)',
    description: 'Found the society. - `founder` - The first member and head of the newly founded society. - `max_members` - The initial max number of members for the society. - `max_intake` - The maximum number of candidates per intake period. - `max_strikes`: The maximum number of strikes a member may get before they become suspended and may only be reinstated by the founder. - `candidate_deposit`: The deposit required to make a bid for membership of the group. - `rules` - The rules of this society concerning membership.'
  },
  'society.judgeSuspendedMember': {
    function: 'judgeSuspendedMember(who: `MultiAddress`, forgive: `bool`)',
    description: 'Allow suspension judgement origin to make judgement on a suspended member. - `who` - The suspended member to be judged. - `forgive` - A boolean representing whether the suspension judgement origin forgives (`true`) or rejects (`false`) a suspended member.'
  },
  'society.kickCandidate': {
    function: 'kickCandidate(candidate: `AccountId32`)',
    description: "Remove the candidate's application from the society. Callable only by the Signed origin of the Founder, only after the period for voting has ended, and only when they do not have a clear approval."
  },
  'society.payout': {
    function: 'payout()',
    description: 'Transfer the first matured payout for the sender and remove it from the records.'
  },
  'society.punishSkeptic': {
    function: 'punishSkeptic()',
    description: 'Punish the skeptic with a strike if they did not vote on a candidate. Callable by the candidate.'
  },
  'society.resignCandidacy': {
    function: 'resignCandidacy()',
    description: "Remove the candidate's application from the society. Callable only by the candidate."
  },
  'society.setParameters': {
    function: 'setParameters(max_members: `u32`, max_intake: `u32`, max_strikes: `u32`, candidate_deposit: `u128`)',
    description: 'Change the maximum number of members in society and the maximum number of new candidates in a single intake period. - `max_members` - The maximum number of members for the society. This must be no less than the current number of members. - `max_intake` - The maximum number of candidates per intake period. - `max_strikes`: The maximum number of strikes a member may get before they become suspended and may only be reinstated by the founder. - `candidate_deposit`: The deposit required to make a bid for membership of the group.'
  },
  'society.unbid': {
    function: 'unbid()',
    description: 'A bidder can remove their bid for entry into society. By doing so, they will have their candidate deposit returned or they will unvouch their voucher.'
  },
  'society.unvouch': {
    function: 'unvouch()',
    description: 'As a vouching member, unvouch a bid. This only works while vouched user is only a bidder (and not a candidate). - `pos`: Position in the `Bids` vector of the bid who should be unvouched.'
  },
  'society.vote': {
    function: 'vote(candidate: `MultiAddress`, approve: `bool`)',
    description: 'As a member, vote on a candidate. - `candidate`: The candidate that the member would like to bid on. - `approve`: A boolean which says if the candidate should be approved (`true`) or rejected (`false`).'
  },
  'society.vouch': {
    function: 'vouch(who: `MultiAddress`, value: `u128`, tip: `u128`)',
    description: 'As a member, vouch for someone to join society by placing a bid on their behalf. - `who`: The user who you would like to vouch for. - `value`: The total reward to be paid between you and the candidate if they become a member in the society. - `tip`: Your cut of the total `value` payout when the candidate is inducted into the society. Tips larger than `value` will be saturated upon payout.'
  },
  'society.waiveRepay': {
    function: 'waiveRepay(amount: `u128`)',
    description: 'Repay the payment previously given to the member with the signed origin, remove any pending payments, and elevate them from rank 0 to rank 1.'
  },
  'staking.bond': {
    function: 'bond(value: `Compact<u128>`, payee: `PalletStakingRewardDestination`)',
    description: 'Take the origin account as a stash and lock up `value` of its balance. `controller` will be the account that controls it. - Independent of the arguments. Moderate complexity. - O(1). - Three extra DB entries.'
  },
  'staking.bondExtra': {
    function: 'bondExtra(max_additional: `Compact<u128>`)',
    description: 'Add some extra amount that have appeared in the stash `free_balance` into the balance up for staking. - Independent of the arguments. Insignificant complexity. - O(1).'
  },
  'staking.cancelDeferredSlash': {
    function: 'cancelDeferredSlash(era: `u32`, slash_indices: `Vec<u32>`)',
    description: 'Cancel enactment of a deferred slash.'
  },
  'staking.chill': {
    function: 'chill()',
    description: 'Declare no desire to either validate or nominate. - Independent of the arguments. Insignificant complexity. - Contains one read. - Writes are limited to the `origin` account key.'
  },
  'staking.chillOther': {
    function: 'chillOther(stash: `AccountId32`)',
    description: 'Declare a `controller` to stop participating as either a validator or nominator.'
  },
  'staking.deprecateControllerBatch': {
    function: 'deprecateControllerBatch(controllers: `Vec<AccountId32>`)',
    description: 'Updates a batch of controller accounts to their corresponding stash account if they are not the same. Ignores any controller accounts that do not exist, and does not operate if the stash and controller are already the same.'
  },
  'staking.forceApplyMinCommission': {
    function: 'forceApplyMinCommission(validator_stash: `AccountId32`)',
    description: 'Force a validator to have at least the minimum commission. This will not affect a validator who already has a commission greater than or equal to the minimum. Any account can call this.'
  },
  'staking.forceNewEra': {
    function: 'forceNewEra()',
    description: 'Force there to be a new era at the end of the next session. After this, it will be reset to normal (non-forced) behaviour. - No arguments.'
  },
  'staking.forceNewEraAlways': {
    function: 'forceNewEraAlways()',
    description: 'Force there to be a new era at the end of sessions indefinitely.'
  },
  'staking.forceNoEras': {
    function: 'forceNoEras()',
    description: 'Force there to be no new eras indefinitely. - No arguments.'
  },
  'staking.forceUnstake': {
    function: 'forceUnstake(stash: `AccountId32`, num_slashing_spans: `u32`)',
    description: 'Force a current staker to become completely unstaked, immediately. - `num_slashing_spans`: Refer to comments on [`Call::withdraw_unbonded`] for more details.'
  },
  'staking.increaseValidatorCount': {
    function: 'increaseValidatorCount(additional: `Compact<u32>`)',
    description: 'Increments the ideal number of validators up to maximum of `ElectionProviderBase::MaxWinners`.'
  },
  'staking.kick': {
    function: 'kick(who: `Vec<MultiAddress>`)',
    description: 'Allows a validator to remove specific nominators from supporting them. When this extrinsic is called, the validator stops accepting nominations from the provided accounts. The `who` parameter is an account or a list of nominator stash addresses that will no longer be nominating the calling validator.'
  },
  'staking.manualSlash': {
    function: 'manualSlash(validator_stash: `AccountId32`, era: `u32`, slash_fraction: `Perbill`)',
    description: 'This function allows governance to manually slash a validator and is a - `validator_stash` - The stash account of the validator to slash. - `era` - The era in which the validator was in the active set. - `slash_fraction` - The percentage of the stake to slash, expressed as a Perbill. - If the validator was already slashed by a higher percentage for the same era, this slash will have no additional effect. - If the validator was previously slashed by a lower percentage, only the difference will be applied. - The slash will be deferred by `SlashDeferDuration` eras before being enacted.'
  },
  'staking.migrateCurrency': {
    function: 'migrateCurrency(stash: `AccountId32`)',
    description: 'Removes the legacy Staking locks if they exist.'
  },
  'staking.nominate': {
    function: 'nominate(targets: `Vec<MultiAddress>`)',
    description: "Declare the desire to nominate `targets` for the origin controller. - The transaction's complexity is proportional to the size of `targets` (N) which is capped at CompactAssignments::LIMIT (T::MaxNominations). - Both the reads and writes follow a similar pattern."
  },
  'staking.payoutStakers': {
    function: 'payoutStakers(validator_stash: `AccountId32`, era: `u32`)',
    description: 'Pay out next page of the stakers behind a validator for the given era. - `validator_stash` is the stash account of the validator. - `era` may be any era between `[current_era - history_depth; current_era]`.'
  },
  'staking.payoutStakersByPage': {
    function: 'payoutStakersByPage(validator_stash: `AccountId32`, era: `u32`, page: `u32`)',
    description: 'Pay out a page of the stakers behind a validator for the given era and page. - `validator_stash` is the stash account of the validator. - `era` may be any era between `[current_era - history_depth; current_era]`. - `page` is the page index of nominators to pay out with value between 0 and `num_nominators / T::MaxExposurePageSize`.'
  },
  'staking.reapStash': {
    function: 'reapStash(stash: `AccountId32`, num_slashing_spans: `u32`)',
    description: 'Remove all data structures concerning a staker/stash once it is at a state where it can be considered `dust` in the staking system. The requirements are: - `num_slashing_spans`: Refer to comments on [`Call::withdraw_unbonded`] for more details.'
  },
  'staking.rebond': {
    function: 'rebond(value: `Compact<u128>`)',
    description: 'Rebond a portion of the stash scheduled to be unlocked. - Time complexity: O(L), where L is unlocking chunks - Bounded by `MaxUnlockingChunks`.'
  },
  'staking.restoreLedger': {
    function: 'restoreLedger(stash: `AccountId32`, maybe_controller: `Option<AccountId32>`, maybe_total: `Option<u128>`, maybe_unlocking: `Option<Vec<PalletStakingUnlockChunk>>`)',
    description: 'Restores the state of a ledger which is in an inconsistent state.'
  },
  'staking.scaleValidatorCount': {
    function: 'scaleValidatorCount(factor: `Percent`)',
    description: 'Scale up the ideal number of validators by a factor up to maximum of `ElectionProviderBase::MaxWinners`.'
  },
  'staking.setController': {
    function: 'setController()',
    description: '(Re-)sets the controller of a stash to the stash itself. This function previously accepted a `controller` argument to set the controller to an account other than the stash itself. This functionality has now been removed, now only setting the controller to the stash, if it is not already. - Independent of the arguments. Insignificant complexity. - Contains a limited number of reads. - Writes are limited to the `origin` account key.'
  },
  'staking.setInvulnerables': {
    function: 'setInvulnerables(invulnerables: `Vec<AccountId32>`)',
    description: 'Set the validators who cannot be slashed (if any).'
  },
  'staking.setMinCommission': {
    function: 'setMinCommission(new: `Perbill`)',
    description: 'Sets the minimum amount of commission that each validators must maintain.'
  },
  'staking.setPayee': {
    function: 'setPayee(payee: `PalletStakingRewardDestination`)',
    description: '(Re-)set the payment target for a controller. - O(1) - Independent of the arguments. Insignificant complexity. - Contains a limited number of reads. - Writes are limited to the `origin` account key.'
  },
  'staking.setStakingConfigs': {
    function: 'setStakingConfigs(min_nominator_bond: `PalletStakingPalletConfigOpU128`, min_validator_bond: `PalletStakingPalletConfigOpU128`, max_nominator_count: `PalletStakingPalletConfigOpU32`, max_validator_count: `PalletStakingPalletConfigOpU32`, chill_threshold: `PalletStakingPalletConfigOpPercent`, min_commission: `PalletStakingPalletConfigOpPerbill`, max_staked_rewards: `PalletStakingPalletConfigOpPercent`)',
    description: 'Update the various staking configurations .'
  },
  'staking.setValidatorCount': {
    function: 'setValidatorCount(new: `Compact<u32>`)',
    description: 'Sets the ideal number of validators.'
  },
  'staking.unbond': {
    function: 'unbond(value: `Compact<u128>`)',
    description: 'Schedule a portion of the stash to be unlocked ready for transfer out after the bond period ends. If this leaves an amount actively bonded less than [`asset::existential_deposit`], then it is increased to the full amount.'
  },
  'staking.updatePayee': {
    function: 'updatePayee(controller: `AccountId32`)',
    description: "Migrates an account's `RewardDestination::Controller` to `RewardDestination::Account(controller)`."
  },
  'staking.validate': {
    function: 'validate(prefs: `PalletStakingValidatorPrefs`)',
    description: 'Declare the desire to validate for the origin controller.'
  },
  'staking.withdrawUnbonded': {
    function: 'withdrawUnbonded(num_slashing_spans: `u32`)',
    description: 'Remove any unlocked chunks from the `unlocking` queue from our management. - `num_slashing_spans` indicates the number of metadata slashing spans to clear when this call results in a complete removal of all the data related to the stash account. In this case, the `num_slashing_spans` must be larger or equal to the number of slashing spans associated with the stash account in the [`SlashingSpans`] storage type, otherwise the call will fail. The call weight is directly proportional to `num_slashing_spans`.'
  },
  'stateTrieMigration.continueMigrate': {
    function: 'continueMigrate(limits: `PalletStateTrieMigrationMigrationLimits`, real_size_upper: `u32`, witness_task: `PalletStateTrieMigrationMigrationTask`)',
    description: 'Continue the migration for the given `limits`.'
  },
  'stateTrieMigration.controlAutoMigration': {
    function: 'controlAutoMigration(maybe_config: `Option<PalletStateTrieMigrationMigrationLimits>`)',
    description: 'Control the automatic migration.'
  },
  'stateTrieMigration.forceSetProgress': {
    function: 'forceSetProgress(progress_top: `PalletStateTrieMigrationProgress`, progress_child: `PalletStateTrieMigrationProgress`)',
    description: 'Forcefully set the progress the running migration.'
  },
  'stateTrieMigration.migrateCustomChild': {
    function: 'migrateCustomChild(root: `Bytes`, child_keys: `Vec<Bytes>`, total_size: `u32`)',
    description: 'Migrate the list of child keys by iterating each of them one by one.'
  },
  'stateTrieMigration.migrateCustomTop': {
    function: 'migrateCustomTop(keys: `Vec<Bytes>`, witness_size: `u32`)',
    description: 'Migrate the list of top keys by iterating each of them one by one.'
  },
  'stateTrieMigration.setSignedMaxLimits': {
    function: 'setSignedMaxLimits(limits: `PalletStateTrieMigrationMigrationLimits`)',
    description: 'Set the maximum limit of the signed migration.'
  },
  'sudo.removeKey': {
    function: 'removeKey()',
    description: 'Permanently removes the sudo key.'
  },
  'sudo.setKey': {
    function: 'setKey(new: `MultiAddress`)',
    description: 'Authenticates the current sudo key and sets the given AccountId (`new`) as the new sudo key.'
  },
  'sudo.sudo': {
    function: 'sudo(call: `Call`)',
    description: 'Authenticates the sudo key and dispatches a function call with `Root` origin.'
  },
  'sudo.sudoAs': {
    function: 'sudoAs(who: `MultiAddress`, call: `Call`)',
    description: 'Authenticates the sudo key and dispatches a function call with `Signed` origin from a given account.'
  },
  'sudo.sudoUncheckedWeight': {
    function: 'sudoUncheckedWeight(call: `Call`, weight: `SpWeightsWeightV2Weight`)',
    description: 'Authenticates the sudo key and dispatches a function call with `Root` origin. This function does not check the weight of the call, and instead allows the Sudo user to specify the weight of the call.'
  },
  'system.applyAuthorizedUpgrade': {
    function: 'applyAuthorizedUpgrade(code: `Bytes`)',
    description: 'Provide the preimage (runtime binary) `code` for an upgrade that has been authorized.'
  },
  'system.authorizeUpgrade': {
    function: 'authorizeUpgrade(code_hash: `H256`)',
    description: 'Authorize an upgrade to a given `code_hash` for the runtime. The runtime can be supplied later.'
  },
  'system.authorizeUpgradeWithoutChecks': {
    function: 'authorizeUpgradeWithoutChecks(code_hash: `H256`)',
    description: 'Authorize an upgrade to a given `code_hash` for the runtime. The runtime can be supplied later.'
  },
  'system.killPrefix': {
    function: 'killPrefix(prefix: `Bytes`, subkeys: `u32`)',
    description: 'Kill all storage items with a key that starts with the given prefix.'
  },
  'system.killStorage': {
    function: 'killStorage(keys: `Vec<Bytes>`)',
    description: 'Kill some items from storage.'
  },
  'system.remark': {
    function: 'remark(remark: `Bytes`)',
    description: 'Make some on-chain remark.'
  },
  'system.remarkWithEvent': {
    function: 'remarkWithEvent(remark: `Bytes`)',
    description: 'Make some on-chain remark and emit event.'
  },
  'system.setCode': {
    function: 'setCode(code: `Bytes`)',
    description: 'Set the new runtime code.'
  },
  'system.setCodeWithoutChecks': {
    function: 'setCodeWithoutChecks(code: `Bytes`)',
    description: 'Set the new runtime code without doing any checks of the given `code`.'
  },
  'system.setHeapPages': {
    function: 'setHeapPages(pages: `u64`)',
    description: "Set the number of pages in the WebAssembly environment's heap."
  },
  'system.setStorage': {
    function: 'setStorage(items: `Vec<(Bytes,Bytes)>`)',
    description: 'Set some items of storage.'
  },
  'technicalCommittee.close': {
    function: 'close(proposal_hash: `H256`, index: `Compact<u32>`, proposal_weight_bound: `SpWeightsWeightV2Weight`, length_bound: `Compact<u32>`)',
    description: 'Close a vote that is either approved, disapproved or whose voting period has ended. - `O(B + M + P1 + P2)` where: - `B` is `proposal` size in bytes (length-fee-bounded) - `M` is members-count (code- and governance-bounded) - `P1` is the complexity of `proposal` preimage. - `P2` is proposal-count (code-bounded).'
  },
  'technicalCommittee.disapproveProposal': {
    function: 'disapproveProposal(proposal_hash: `H256`)',
    description: 'Disapprove a proposal, close, and remove it from the system, regardless of its current state.'
  },
  'technicalCommittee.execute': {
    function: 'execute(proposal: `Call`, length_bound: `Compact<u32>`)',
    description: 'Dispatch a proposal from a member using the `Member` origin. - `O(B + M + P)` where: - `B` is `proposal` size in bytes (length-fee-bounded) - `M` members-count (code-bounded) - `P` complexity of dispatching `proposal`.'
  },
  'technicalCommittee.kill': {
    function: 'kill(proposal_hash: `H256`)',
    description: 'Disapprove the proposal and burn the cost held for storing this proposal. - `origin`: must be the `KillOrigin`. - `proposal_hash`: The hash of the proposal that should be killed.'
  },
  'technicalCommittee.propose': {
    function: 'propose(threshold: `Compact<u32>`, proposal: `Call`, length_bound: `Compact<u32>`)',
    description: 'Add a new proposal to either be voted on or executed directly. - `O(B + M + P1)` or `O(B + M + P2)` where: - `B` is `proposal` size in bytes (length-fee-bounded) - `M` is members-count (code- and governance-bounded) - branching is influenced by `threshold` where: - `P1` is proposal execution complexity (`threshold < 2`) - `P2` is proposals-count (code-bounded) (`threshold >= 2`).'
  },
  'technicalCommittee.releaseProposalCost': {
    function: 'releaseProposalCost(proposal_hash: `H256`)',
    description: 'Release the cost held for storing a proposal once the given proposal is completed. - `origin`: must be `Signed` or `Root`. - `proposal_hash`: The hash of the proposal.'
  },
  'technicalCommittee.setMembers': {
    function: 'setMembers(new_members: `Vec<AccountId32>`, prime: `Option<AccountId32>`, old_count: `u32`)',
    description: "Set the collective's membership. - `new_members`: The new member list. Be nice to the chain and provide it sorted. - `prime`: The prime member whose vote sets the default. - `old_count`: The upper bound for the previous number of members in storage. Used for weight estimation. - `O(MP + N)` where: - `M` old-members-count (code- and governance-bounded) - `N` new-members-count (code- and governance-bounded) - `P` proposals-count (code-bounded)."
  },
  'technicalCommittee.vote': {
    function: 'vote(proposal: `H256`, index: `Compact<u32>`, approve: `bool`)',
    description: 'Add an aye or nay vote for the sender to the given proposal. - `O(M)` where `M` is members-count (code- and governance-bounded).'
  },
  'technicalMembership.addMember': {
    function: 'addMember(who: `MultiAddress`)',
    description: 'Add a member `who` to the set.'
  },
  'technicalMembership.changeKey': {
    function: 'changeKey(new: `MultiAddress`)',
    description: 'Swap out the sending member for some other key `new`.'
  },
  'technicalMembership.clearPrime': {
    function: 'clearPrime()',
    description: 'Remove the prime member if it exists.'
  },
  'technicalMembership.removeMember': {
    function: 'removeMember(who: `MultiAddress`)',
    description: 'Remove a member `who` from the set.'
  },
  'technicalMembership.resetMembers': {
    function: 'resetMembers(members: `Vec<AccountId32>`)',
    description: 'Change the membership to a new set, disregarding the existing membership. Be nice and pass `members` pre-sorted.'
  },
  'technicalMembership.setPrime': {
    function: 'setPrime(who: `MultiAddress`)',
    description: 'Set the prime member. Must be a current member.'
  },
  'technicalMembership.swapMember': {
    function: 'swapMember(remove: `MultiAddress`, add: `MultiAddress`)',
    description: 'Swap out one member `remove` for another `add`.'
  },
  'timestamp.set': {
    function: 'set(now: `Compact<u64>`)',
    description: 'Set the current time. - `O(1)` (Note that implementations of `OnTimestampSet` must also be `O(1)`) - 1 storage read and 1 storage mutation (codec `O(1)` because of `DidUpdate::take` in `on_finalize`) - 1 event handler `on_timestamp_set`. Must be `O(1)`.'
  },
  'tips.closeTip': {
    function: 'closeTip(hash: `H256`)',
    description: 'Close and payout a tip. - `hash`: The identity of the open tip for which a tip value is declared. This is formed as the hash of the tuple of the original tip `reason` and the beneficiary account ID. - : `O(T)` where `T` is the number of tippers. decoding `Tipper` vec of length `T`. `T` is charged as upper bound given by `ContainsLengthBound`. The actual cost depends on the implementation of `T::Tippers`.'
  },
  'tips.reportAwesome': {
    function: 'reportAwesome(reason: `Bytes`, who: `MultiAddress`)',
    description: "Report something `reason` that deserves a tip and claim any eventual the finder's fee. - `reason`: The reason for, or the thing that deserves, the tip; generally this will be a UTF-8-encoded URL. - `who`: The account which should be credited for the tip. - `O(R)` where `R` length of `reason`. - encoding and hashing of 'reason'."
  },
  'tips.retractTip': {
    function: 'retractTip(hash: `H256`)',
    description: 'Retract a prior tip-report from `report_awesome`, and cancel the process of tipping. - `hash`: The identity of the open tip for which a tip value is declared. This is formed as the hash of the tuple of the original tip `reason` and the beneficiary account ID. - `O(1)` - Depends on the length of `T::Hash` which is fixed.'
  },
  'tips.slashTip': {
    function: 'slashTip(hash: `H256`)',
    description: 'Remove and slash an already-open tip. - O(1).'
  },
  'tips.tip': {
    function: 'tip(hash: `H256`, tip_value: `Compact<u128>`)',
    description: 'Declare a tip value for an already-open tip. - `hash`: The identity of the open tip for which a tip value is declared. This is formed as the hash of the tuple of the hash of the original tip `reason` and the beneficiary account ID. - `tip_value`: The amount of tip that the sender would like to give. The median tip value of active tippers will be given to the `who`. - `O(T)` where `T` is the number of tippers. decoding `Tipper` vec of length `T`, insert tip and check closing, `T` is charged as upper bound given by `ContainsLengthBound`. The actual cost depends on the implementation of `T::Tippers`.'
  },
  'tips.tipNew': {
    function: 'tipNew(reason: `Bytes`, who: `MultiAddress`, tip_value: `Compact<u128>`)',
    description: "Give a tip for something new; no finder's fee will be taken. - `reason`: The reason for, or the thing that deserves, the tip; generally this will be a UTF-8-encoded URL. - `who`: The account which should be credited for the tip. - `tip_value`: The amount of tip that the sender would like to give. The median tip value of active tippers will be given to the `who`. - `O(R + T)` where `R` length of `reason`, `T` is the number of tippers. - `O(T)`: decoding `Tipper` vec of length `T`. `T` is charged as upper bound given by `ContainsLengthBound`. The actual cost depends on the implementation of `T::Tippers`. - `O(R)`: hashing and encoding of reason of length `R`."
  },
  'transactionStorage.checkProof': {
    function: 'checkProof(proof: `SpTransactionStorageProofTransactionStorageProof`)',
    description: "Check storage proof for block number `block_number() - StoragePeriod`. If such block does not exist the proof is expected to be `None`. #Complexity - Linear w.r.t the number of indexed transactions in the proved block for random probing. There's a DB read for each transaction."
  },
  'transactionStorage.renew': {
    function: 'renew(block: `u32`, index: `u32`)',
    description: 'Renew previously stored data. Parameters are the block number that contains previous `store` or `renew` call and transaction index within that block. Transaction index is emitted in the `Stored` or `Renewed` event. Applies same fees as `store`. #Complexity - O(1).'
  },
  'transactionStorage.store': {
    function: 'store(data: `Bytes`)',
    description: 'Index and store data off chain. Minimum data size is 1 bytes, maximum is `MaxTransactionSize`. Data will be removed after `STORAGE_PERIOD` blocks, unless `renew` is called. #Complexity - O(n*log(n)) of data size, as all data is pushed to an in-memory trie.'
  },
  'treasury.checkStatus': {
    function: 'checkStatus(index: `u32`)',
    description: 'Check the status of the spend and remove it from the storage if processed. - `index`: The spend index.'
  },
  'treasury.payout': {
    function: 'payout(index: `u32`)',
    description: 'Claim a spend. - `index`: The spend index.'
  },
  'treasury.removeApproval': {
    function: 'removeApproval(proposal_id: `Compact<u32>`)',
    description: 'Force a previously approved proposal to be removed from the approval queue. - `proposal_id`: The index of a proposal - O(A) where `A` is the number of approvals - [`Error::ProposalNotApproved`]: The `proposal_id` supplied was not found in the approval queue, i.e., the proposal has not been approved. This could also mean the proposal does not exist altogether, thus there is no way it would have been approved in the first place.'
  },
  'treasury.spend': {
    function: 'spend(asset_kind: `FrameSupportTokensFungibleUnionOfNativeOrWithId`, amount: `Compact<u128>`, beneficiary: `MultiAddress`, valid_from: `Option<u32>`)',
    description: 'Propose and approve a spend of treasury funds. - `asset_kind`: An indicator of the specific asset class to be spent. - `amount`: The amount to be transferred from the treasury to the `beneficiary`. - `beneficiary`: The beneficiary of the spend. - `valid_from`: The block number from which the spend can be claimed. It can refer to the past if the resulting spend has not yet expired according to the [`Config::PayoutPeriod`]. If `None`, the spend can be claimed immediately after approval.'
  },
  'treasury.spendLocal': {
    function: 'spendLocal(amount: `Compact<u128>`, beneficiary: `MultiAddress`)',
    description: 'Propose and approve a spend of treasury funds. - `amount`: The amount to be transferred from the treasury to the `beneficiary`. - `beneficiary`: The destination account for the transfer.'
  },
  'treasury.voidSpend': {
    function: 'voidSpend(index: `u32`)',
    description: 'Void previously approved spend. - `index`: The spend index.'
  },
  'txPause.pause': {
    function: 'pause(full_name: `(Bytes,Bytes)`)',
    description: 'Pause a call.'
  },
  'txPause.unpause': {
    function: 'unpause(ident: `(Bytes,Bytes)`)',
    description: 'Un-pause a call.'
  },
  'uniques.approveTransfer': {
    function: 'approveTransfer(collection: `u32`, item: `u32`, delegate: `MultiAddress`)',
    description: 'Approve an item to be transferred by a delegated third-party account. - `collection`: The collection of the item to be approved for delegated transfer. - `item`: The item of the item to be approved for delegated transfer. - `delegate`: The account to delegate permission to transfer the item.'
  },
  'uniques.burn': {
    function: 'burn(collection: `u32`, item: `u32`, check_owner: `Option<MultiAddress>`)',
    description: 'Destroy a single item. - the Admin of the `collection`; - the Owner of the `item`; - `collection`: The collection of the item to be burned. - `item`: The item of the item to be burned. - `check_owner`: If `Some` then the operation will fail with `WrongOwner` unless the item is owned by this value.'
  },
  'uniques.buyItem': {
    function: 'buyItem(collection: `u32`, item: `u32`, bid_price: `u128`)',
    description: "Allows to buy an item if it's up for sale. - `collection`: The collection of the item. - `item`: The item the sender wants to buy. - `bid_price`: The price the sender is willing to pay."
  },
  'uniques.cancelApproval': {
    function: 'cancelApproval(collection: `u32`, item: `u32`, maybe_check_delegate: `Option<MultiAddress>`)',
    description: 'Cancel the prior approval for the transfer of an item by a delegate. - the `Force` origin; - `Signed` with the signer being the Admin of the `collection`; - `Signed` with the signer being the Owner of the `item`; - `collection`: The collection of the item of whose approval will be cancelled. - `item`: The item of the item of whose approval will be cancelled. - `maybe_check_delegate`: If `Some` will ensure that the given account is the one to which permission of transfer is delegated.'
  },
  'uniques.clearAttribute': {
    function: 'clearAttribute(collection: `u32`, maybe_item: `Option<u32>`, key: `Bytes`)',
    description: "Clear an attribute for a collection or item. - `collection`: The identifier of the collection whose item's metadata to clear. - `maybe_item`: The identifier of the item whose metadata to clear. - `key`: The key of the attribute."
  },
  'uniques.clearCollectionMetadata': {
    function: 'clearCollectionMetadata(collection: `u32`)',
    description: 'Clear the metadata for a collection. - `collection`: The identifier of the collection whose metadata to clear.'
  },
  'uniques.clearMetadata': {
    function: 'clearMetadata(collection: `u32`, item: `u32`)',
    description: "Clear the metadata for an item. - `collection`: The identifier of the collection whose item's metadata to clear. - `item`: The identifier of the item whose metadata to clear."
  },
  'uniques.create': {
    function: 'create(collection: `u32`, admin: `MultiAddress`)',
    description: "Issue a new collection of non-fungible items from a public origin. - `collection`: The identifier of the new collection. This must not be currently in use. - `admin`: The admin of this collection. The admin is the initial address of each member of the collection's admin team."
  },
  'uniques.destroy': {
    function: 'destroy(collection: `u32`, witness: `PalletUniquesDestroyWitness`)',
    description: 'Destroy a collection of fungible items. - `collection`: The identifier of the collection to be destroyed. - `witness`: Information on the items minted in the collection. This must be correct. - `n = witness.items` - `m = witness.item_metadatas` - `a = witness.attributes`.'
  },
  'uniques.forceCreate': {
    function: 'forceCreate(collection: `u32`, owner: `MultiAddress`, free_holding: `bool`)',
    description: 'Issue a new collection of non-fungible items from a privileged origin. - `collection`: The identifier of the new item. This must not be currently in use. - `owner`: The owner of this collection of items. The owner has full superuser permissions over this item, but may later change and configure the permissions using `transfer_ownership` and `set_team`.'
  },
  'uniques.forceItemStatus': {
    function: 'forceItemStatus(collection: `u32`, owner: `MultiAddress`, issuer: `MultiAddress`, admin: `MultiAddress`, freezer: `MultiAddress`, free_holding: `bool`, is_frozen: `bool`)',
    description: 'Alter the attributes of a given item. - `collection`: The identifier of the item. - `owner`: The new Owner of this item. - `issuer`: The new Issuer of this item. - `admin`: The new Admin of this item. - `freezer`: The new Freezer of this item. - `free_holding`: Whether a deposit is taken for holding an item of this collection. - `is_frozen`: Whether this collection is frozen except for permissioned/admin instructions.'
  },
  'uniques.freeze': {
    function: 'freeze(collection: `u32`, item: `u32`)',
    description: 'Disallow further unprivileged transfer of an item. - `collection`: The collection of the item to be frozen. - `item`: The item of the item to be frozen.'
  },
  'uniques.freezeCollection': {
    function: 'freezeCollection(collection: `u32`)',
    description: 'Disallow further unprivileged transfers for a whole collection. - `collection`: The collection to be frozen.'
  },
  'uniques.mint': {
    function: 'mint(collection: `u32`, item: `u32`, owner: `MultiAddress`)',
    description: 'Mint an item of a particular collection. - `collection`: The collection of the item to be minted. - `item`: The item value of the item to be minted. - `beneficiary`: The initial owner of the minted item.'
  },
  'uniques.redeposit': {
    function: 'redeposit(collection: `u32`, items: `Vec<u32>`)',
    description: 'Reevaluate the deposits on some items. - `collection`: The collection to be frozen. - `items`: The items of the collection whose deposits will be reevaluated.'
  },
  'uniques.setAcceptOwnership': {
    function: 'setAcceptOwnership(maybe_collection: `Option<u32>`)',
    description: 'Set (or reset) the acceptance of ownership for a particular account. - `maybe_collection`: The identifier of the collection whose ownership the signer is willing to accept, or if `None`, an indication that the signer is willing to accept no ownership transferal.'
  },
  'uniques.setAttribute': {
    function: 'setAttribute(collection: `u32`, maybe_item: `Option<u32>`, key: `Bytes`, value: `Bytes`)',
    description: "Set an attribute for a collection or item. - `collection`: The identifier of the collection whose item's metadata to set. - `maybe_item`: The identifier of the item whose metadata to set. - `key`: The key of the attribute. - `value`: The value to which to set the attribute."
  },
  'uniques.setCollectionMaxSupply': {
    function: 'setCollectionMaxSupply(collection: `u32`, max_supply: `u32`)',
    description: 'Set the maximum amount of items a collection could have. - `collection`: The identifier of the collection to change. - `max_supply`: The maximum amount of items a collection could have.'
  },
  'uniques.setCollectionMetadata': {
    function: 'setCollectionMetadata(collection: `u32`, data: `Bytes`, is_frozen: `bool`)',
    description: 'Set the metadata for a collection. - `collection`: The identifier of the item whose metadata to update. - `data`: The general information of this item. Limited in length by `StringLimit`. - `is_frozen`: Whether the metadata should be frozen against further changes.'
  },
  'uniques.setMetadata': {
    function: 'setMetadata(collection: `u32`, item: `u32`, data: `Bytes`, is_frozen: `bool`)',
    description: "Set the metadata for an item. - `collection`: The identifier of the collection whose item's metadata to set. - `item`: The identifier of the item whose metadata to set. - `data`: The general information of this item. Limited in length by `StringLimit`. - `is_frozen`: Whether the metadata should be frozen against further changes."
  },
  'uniques.setPrice': {
    function: 'setPrice(collection: `u32`, item: `u32`, price: `Option<u128>`, whitelisted_buyer: `Option<MultiAddress>`)',
    description: 'Set (or reset) the price for an item. - `collection`: The collection of the item. - `item`: The item to set the price for. - `price`: The price for the item. Pass `None`, to reset the price. - `buyer`: Restricts the buy operation to a specific account.'
  },
  'uniques.setTeam': {
    function: 'setTeam(collection: `u32`, issuer: `MultiAddress`, admin: `MultiAddress`, freezer: `MultiAddress`)',
    description: 'Change the Issuer, Admin and Freezer of a collection. - `collection`: The collection whose team should be changed. - `issuer`: The new Issuer of this collection. - `admin`: The new Admin of this collection. - `freezer`: The new Freezer of this collection.'
  },
  'uniques.thaw': {
    function: 'thaw(collection: `u32`, item: `u32`)',
    description: 'Re-allow unprivileged transfer of an item. - `collection`: The collection of the item to be thawed. - `item`: The item of the item to be thawed.'
  },
  'uniques.thawCollection': {
    function: 'thawCollection(collection: `u32`)',
    description: 'Re-allow unprivileged transfers for a whole collection. - `collection`: The collection to be thawed.'
  },
  'uniques.transfer': {
    function: 'transfer(collection: `u32`, item: `u32`, dest: `MultiAddress`)',
    description: 'Move an item from the sender account to another. - the Admin of the `collection`; - the Owner of the `item`; - the approved delegate for the `item` (in this case, the approval is reset). - `collection`: The collection of the item to be transferred. - `item`: The item of the item to be transferred. - `dest`: The account to receive ownership of the item.'
  },
  'uniques.transferOwnership': {
    function: 'transferOwnership(collection: `u32`, new_owner: `MultiAddress`)',
    description: 'Change the Owner of a collection. - `collection`: The collection whose owner should be changed. - `owner`: The new Owner of this collection. They must have called `set_accept_ownership` with `collection` in order for this operation to succeed.'
  },
  'utility.asDerivative': {
    function: 'asDerivative(index: `u16`, call: `Call`)',
    description: 'Send a call through an indexed pseudonym of the sender.'
  },
  'utility.batch': {
    function: 'batch(calls: `Vec<Call>`)',
    description: 'Send a batch of dispatch calls. - `calls`: The calls to be dispatched from the same origin.'
  },
  'utility.batchAll': {
    function: 'batchAll(calls: `Vec<Call>`)',
    description: 'Send a batch of dispatch calls and atomically execute them. The whole transaction will rollback and fail if any of the calls failed. - `calls`: The calls to be dispatched from the same origin.'
  },
  'utility.dispatchAs': {
    function: 'dispatchAs(as_origin: `KitchensinkRuntimeOriginCaller`, call: `Call`)',
    description: 'Dispatches a function call with a provided origin. - O(1).'
  },
  'utility.dispatchAsFallible': {
    function: 'dispatchAsFallible(as_origin: `KitchensinkRuntimeOriginCaller`, call: `Call`)',
    description: 'Dispatches a function call with a provided origin.'
  },
  'utility.forceBatch': {
    function: 'forceBatch(calls: `Vec<Call>`)',
    description: "Send a batch of dispatch calls. Unlike `batch`, it allows errors and won't interrupt. - `calls`: The calls to be dispatched from the same origin."
  },
  'utility.ifElse': {
    function: 'ifElse(main: `Call`, fallback: `Call`)',
    description: 'Dispatch a fallback call in the event the main call fails to execute. May be called from any origin except `None`. - `main`: The main call to be dispatched. This is the primary action to execute. - `fallback`: The fallback call to be dispatched in case the `main` call fails. - If the origin is `root`, both the main and fallback calls are executed without applying any origin filters. - If the origin is not `root`, the origin filter is applied to both the `main` and `fallback` calls. - Some use cases might involve submitting a `batch` type call in either main, fallback or both.'
  },
  'utility.withWeight': {
    function: 'withWeight(call: `Call`, weight: `SpWeightsWeightV2Weight`)',
    description: 'Dispatch a function call with a specified weight.'
  },
  'vesting.forceRemoveVestingSchedule': {
    function: 'forceRemoveVestingSchedule(target: `MultiAddress`, schedule_index: `u32`)',
    description: 'Force remove a vesting schedule - `target`: An account that has a vesting schedule - `schedule_index`: The vesting schedule index that should be removed.'
  },
  'vesting.forceVestedTransfer': {
    function: 'forceVestedTransfer(source: `MultiAddress`, target: `MultiAddress`, schedule: `PalletVestingVestingInfo`)',
    description: 'Force a vested transfer. - `source`: The account whose funds should be transferred. - `target`: The account that should be transferred the vested funds. - `schedule`: The vesting schedule attached to the transfer. - `O(1)`.'
  },
  'vesting.mergeSchedules': {
    function: 'mergeSchedules(schedule1_index: `u32`, schedule2_index: `u32`)',
    description: 'Merge two vesting schedules together, creating a new vesting schedule that unlocks over the highest possible start and end blocks. If both schedules have already started the current block will be used as the schedule start; with the caveat that if one schedule is finished by the current block, the other will be treated as the new merged schedule, unmodified. - `starting_block`: `MAX(schedule1.starting_block, scheduled2.starting_block, current_block)`. - `ending_block`: `MAX(schedule1.ending_block, schedule2.ending_block)`. - `locked`: `schedule1.locked_at(current_block) + schedule2.locked_at(current_block)`. - `schedule1_index`: index of the first schedule to merge. - `schedule2_index`: index of the second schedule to merge.'
  },
  'vesting.vest': {
    function: 'vest()',
    description: 'Unlock any vested funds of the sender account. - `O(1)`.'
  },
  'vesting.vestOther': {
    function: 'vestOther(target: `MultiAddress`)',
    description: 'Unlock any vested funds of a `target` account. - `target`: The account whose vested funds should be unlocked. Must have funds still locked under this pallet. - `O(1)`.'
  },
  'vesting.vestedTransfer': {
    function: 'vestedTransfer(target: `MultiAddress`, schedule: `PalletVestingVestingInfo`)',
    description: 'Create a vested transfer. - `target`: The account receiving the vested funds. - `schedule`: The vesting schedule attached to the transfer. - `O(1)`.'
  },
  'voterList.putInFrontOf': {
    function: 'putInFrontOf(lighter: `MultiAddress`)',
    description: "Move the caller's Id directly in front of `lighter`. - both nodes are within the same bag, - and `origin` has a greater `Score` than `lighter`."
  },
  'voterList.putInFrontOfOther': {
    function: 'putInFrontOfOther(heavier: `MultiAddress`, lighter: `MultiAddress`)',
    description: "Move the caller's Id directly in front of `lighter`, but it can be called by anyone."
  },
  'voterList.rebag': {
    function: 'rebag(dislocated: `MultiAddress`)',
    description: 'Declare that some `dislocated` account has, through rewards or penalties, sufficiently changed its score that it should properly fall into a different bag than its current one.'
  }
} as const;
