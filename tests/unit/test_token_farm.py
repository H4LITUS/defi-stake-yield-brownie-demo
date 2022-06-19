from os import access
from brownie import network, exceptions
import pytest
from scripts.helpful_scripts import (
    deploy_mocks,
    get_account,
    LOCAL_BLOCKCHAIN_ENVIRONEMNTS,
    get_contract,
    INITIAL_PRICE_FEED_VALUE,
    DECIMALS,
)
from scripts.deploy import deploy_token_farm_and_dapp_token, KEPT_BALANCE


def test_set_price_feed_contract():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONEMNTS:
        pytest.skip("Only for local testing")

    account = get_account()
    non_owner = get_account(index=1)

    token_farm, dapp_token = deploy_token_farm_and_dapp_token()

    # Act
    price_feed_address = get_contract("dai_usd_price_feed")
    token_farm.setPriceFeedContract(
        dapp_token.address, price_feed_address, {"from": account}
    )

    # Assert
    assert token_farm.tokenPriceFeedMapping(dapp_token.address) == price_feed_address

    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.setPriceFeedContract(
            dapp_token.address, price_feed_address, {"from": non_owner}
        )


def test_stake_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONEMNTS:
        pytest.skip("Only for local testing")

    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()

    # Act
    dapp_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, dapp_token.address, {"from": account})

    # Assert
    assert (
        token_farm.stakingBalance(dapp_token.address, account.address) == amount_staked
    )
    assert token_farm.uniqueTokensStaked(account.address) == 1
    assert token_farm.stakers(0) == account.address

    return token_farm, dapp_token


def test_issue_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONEMNTS:
        pytest.skip("Only for local testing")

    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    starting_balance = dapp_token.balanceOf(account.address)

    # Act
    token_farm.issueTokens({"from": account})

    # Arrange
    assert (
        dapp_token.balanceOf(account.address)
        == starting_balance + INITIAL_PRICE_FEED_VALUE
    )


def test_get_user_total_value_with_different_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONEMNTS:
        pytest.skip("Only for local testing")

    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)

    weth_token = get_contract("weth_token")
    weth_token.approve(token_farm, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, weth_token.address, {"from": account})

    assert token_farm.getUserTotalValue(account.address) == (
        INITIAL_PRICE_FEED_VALUE * 2
    )


def test_get_token_value():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONEMNTS:
        pytest.skip("Only for local testing")

    token_farm, dapp_token = deploy_token_farm_and_dapp_token()

    assert token_farm.getTokenValue(dapp_token.address) == (
        INITIAL_PRICE_FEED_VALUE,
        DECIMALS,
    )


def test_unstake_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONEMNTS:
        pytest.skip("Only for local testing")

    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)

    # Act
    unique_tokens = token_farm.uniqueTokensStaked(account.address)
    token_farm.unstakeTokens(dapp_token.address, {"from": account})

    # Arrange
    assert token_farm.stakingBalance(dapp_token.address, account.address) == 0
    assert token_farm.uniqueTokensStaked(account.address) == (unique_tokens - 1)
    assert dapp_token.balanceOf(account.address) == KEPT_BALANCE
