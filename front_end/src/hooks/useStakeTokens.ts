import { useEthers, useContractFunction } from "@usedapp/core"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import ERC20 from "../chain-info/contracts/MockDAI.json"
import networkMapping from "../chain-info/deployments/map.json"
import { constants, utils } from "ethers"
import { Contract } from "@usedapp/core/node_modules/@ethersproject/contracts"
import { useState, useEffect } from "react"

export const useStakeTokens = (tokenAddress: string) => {
    const { chainId } = useEthers();
    const { abi } = TokenFarm
    const tokenFarmAddress = chainId ? networkMapping[chainId.toString()]["TokenFarm"][0] : constants.AddressZero;
    const tokenFarmInterface = new utils.Interface(abi)
    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface);

    const erc20ABI = ERC20.abi;
    const erc20Interface = new utils.Interface(erc20ABI);
    const erc20Contract = new Contract(tokenAddress, erc20Interface);

    const { state: approveAndStakeErc20State, send: approveErc20Send } =
        useContractFunction(erc20Contract, "approve", {
            transactionName: "Approve ERC20 transfer"
        })

    const approveAndStake = (amount: string) => {
        setAmountToStake(amount);
        return approveErc20Send(tokenFarmAddress, amount);
    }


    const { state: stakeState, send: stakeSend } =
        useContractFunction(tokenFarmContract, "stakeTokens", {
            transactionName: "Staked tokens"
        })

    const [amountToStake, setAmountToStake] = useState("0");

    useEffect(() => {
        if (approveAndStakeErc20State.status === "Success") {
            // stake function
            stakeSend(amountToStake, tokenAddress)
        }
    }, [approveAndStakeErc20State, amountToStake, tokenAddress])

    const [state, setState] = useState(approveAndStakeErc20State)

    useEffect(() => {
        if (approveAndStakeErc20State.status === "Success") {
            setState(stakeState)
        } else {
            setState(approveAndStakeErc20State)
        }
    }, [approveAndStakeErc20State, stakeState])

    return { approveAndStake, state }
}