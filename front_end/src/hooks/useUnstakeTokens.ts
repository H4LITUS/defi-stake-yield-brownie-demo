import { useEthers, useContractFunction } from "@usedapp/core"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import networkMapping from "../chain-info/deployments/map.json"
import { Contract } from "@usedapp/core/node_modules/@ethersproject/contracts"
import { constants, utils } from "ethers"

export const useUnstakeTokens = (tokenAddress: string) => {
    const { chainId } = useEthers();
    const { abi } = TokenFarm;

    const tokenFarmAddress = chainId ? networkMapping[chainId.toString()]["TokenFarm"][0] : constants.AddressZero;
    const tokenFarmInterface = new utils.Interface(abi);
    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface);

    const { state: unstakeState, send: unstakeSend } =
        useContractFunction(tokenFarmContract, "unstakeTokens", { transactionName: "Tokens Unstaked" });


    return { unstakeState, unstakeSend };
}