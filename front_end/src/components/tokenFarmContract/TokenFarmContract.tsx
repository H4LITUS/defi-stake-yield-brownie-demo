import { makeStyles } from "@material-ui/core"
import { Box, Tab } from "@mui/material"
import { TabContext, TabList, TabPanel } from "@material-ui/lab"
import { Token } from "../Main"
import React, { useState } from "react"
import { Unstake } from "./Unstake"

const useStyles = makeStyles((theme) => ({
    tabContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: theme.spacing(4)
    },
    box: {
        backgroundColor: "white",
        borderRadius: "25px"
    },
    header: {
        color: "white"
    }
}))

interface TokenFarmContractProps {
    supportedTokens: Array<Token>
}

export const TokenFarmContract = ({ supportedTokens }: TokenFarmContractProps) => {
    const classes = useStyles();
    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0);
    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue));
    }

    return (
        <>
            <h1 className={classes.header}>The TokenFarm Contract</h1>
            <Box className={classes.box}>
                <TabContext value={selectedTokenIndex.toString()}>
                    <TabList onChange={handleChange} aria-label="unstake form tabs">
                        {
                            supportedTokens.map((token, index) => {
                                return (
                                    <Tab label={token.name} value={index.toString()} key={index} />
                                )
                            })
                        }
                    </TabList>
                    {
                        supportedTokens.map((token, index) => {
                            return (
                                <TabPanel value={index.toString()} key={index}>
                                    <div className={classes.tabContent}>
                                        <Unstake token={token} />
                                    </div>
                                </TabPanel>
                            )
                        })
                    }
                </TabContext>
            </Box>
        </>
    )
}