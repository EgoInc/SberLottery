import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// styles
import './lotteryPageForPlayer.css'
// imported items
import { Loader } from "../loader";

import { ethers, providers } from "ethers";
import { MMSDK } from '../../App';
const config = require('../../assets/blockchain_abi.json')

const LotteryPageForPlayer = props => {
    // -------------------------------------------------------VARIABLES\\
    const { id } = useParams()
    const [loading, isLoading] = useState(true)
    const [lottery, setLottery] = useState()
    const [participants, setParticipants] = useState()
    const [transactions, setTransactions] = useState()


    useEffect(() => {
        loadLotteries()
    }, [])

    const loadLotteries = async () => {
        const ethereum = MMSDK.getProvider();
        const provider = new ethers.providers.Web3Provider(ethereum);

        var contract = new ethers.Contract(process.env.REACT_APP_SC_ADDRESS, config, provider.getSigner());
        var lottery = await contract.lottery(id);
        setLottery(lottery);
        setParticipants(Number(lottery.curParticipants))
        if (!lottery.isActive) {
            var transactions = await contract.lotResults(id)
            console.log("transactions", transactions)
            var txs = [];
            for (var i = 0; i < transactions.length; i++) {
                if (transactions[i] != "") {
                    txs.push(`https://explorer.test.siberium.net/tx/${transactions[i]}`)
                }
            }
            setTransactions(txs);
            console.log(txs)
        }
        isLoading(false)
        console.log(lottery.winnersAmount)
    }

    return (
        <div className="main_container">
            {loading ? <Loader /> :
                <div className="content_container">
                    <h4 className="lottery_name_h">{lottery.name}</h4>
                    <div className="lotteryPage_image_container">
                        <img src={lottery.image} alt="lottery-image" />
                    </div>
                    <div className="container_fullWidth">
                        <div className="lotteryPage_info_container">
                            <p>Количество победителей:</p> <p>{Number(lottery.winnersAmount)}</p>
                            <p>Текущее количество участников:</p> <p>{participants}</p>
                            <p>Стоимость билета:</p> <p>{Number(lottery.ticketPrice / 1000000000000000000)}</p>
                        </div>
                    </div>
                    {!lottery.isActive &&
                        <>
                            <h2 className="notActive_prizesInfo">Информация о призах</h2>
                            <div className="notActiveLottery_info_container">
                                {transactions.map((item, ind) =>
                                    <a href={item} key={ind} target="_blank">{item}</a>)}
                            </div>
                        </>
                    }
                    {lottery.isActive &&
                        <button className="custom_button lotteryPage_end_button" onClick={() => window.location.href = `/user/lottery/${id}/choose`}> Принять участие</button>
                    }
                </div>
            }
        </div>
    )
}

export { LotteryPageForPlayer }