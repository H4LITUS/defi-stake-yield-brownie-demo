import { Token } from "../Main"
import { useEthers, useContractFunction, useContractCall, useNotifications } from "@usedapp/core";
import { formatUnits } from "@ethersproject/units";
import { BalanceMsg } from "../BalanceMsg";
import { constants, utils } from "ethers"
import networkMapping from "../../chain-info/deployments/map.json"
import TokenFarm from "../../chain-info/contracts/TokenFarm.json"
import { Contract } from "@usedapp/core/node_modules/@ethersproject/contracts"
import { useUnstakeTokens } from "../../hooks/useUnstakeTokens"
import { Button, Snackbar, Alert, CircularProgress } from "@mui/material"
import React, { useState, useEffect } from "react"

export interface UnstakeProps {
    token: Token
}

export const Unstake = ({ token }: UnstakeProps) => {
    const { image, address, name } = token;
    const { account, chainId } = useEthers();
    const { abi } = TokenFarm;
    const tokenFarmAddress = chainId ? networkMapping[chainId.toString()]["TokenFarm"][0] : constants.AddressZero;
    const tokenFarmInterface = new utils.Interface(abi);
    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface);

    const [stakingBalance] =
        useContractCall({
            abi: tokenFarmInterface,
            address: tokenFarmAddress,
            method: "stakingBalance",
            args: [address, account],
        }) ?? []

    const formattedTokenBalance: number = stakingBalance ? parseFloat(formatUnits(stakingBalance, 18)) : 0;

    const handleUnstakeSubmit = () => {
        unstakeSend(address);
    }

    const { unstakeState, unstakeSend } = useUnstakeTokens(address)
    // const [state, setState] = useState(unstakeState);

    const { notifications } = useNotifications();

    useEffect(() => {
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Tokens Unstaked").length > 0) {
            setUnstakeSuccess(true);
        }
    }, [notifications])

    const [unstakeSuccess, setUnstakeSuccess] = useState(false);

    const handleCloseSnack = () => {
        setUnstakeSuccess(false);
    }

    const isMining = unstakeState.status === "Mining"

    return (
        <div>
            <BalanceMsg
                label={`Your staked ${name} balance`}
                amount={formattedTokenBalance}
                tokenImgSrc={image} />

            <Button
                onClick={handleUnstakeSubmit}
                variant="outlined"
                size="large"
                color="secondary"
                disabled={isMining}
            >
                {isMining ? <CircularProgress size={26} /> : "UNSTAKE all " + name}
            </Button>

            <Snackbar
                open={unstakeSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack} >
                <Alert onClose={handleCloseSnack} severity="success">
                    Tokens Unstaked !!
                </Alert>
            </Snackbar>

        </div>

    )
}