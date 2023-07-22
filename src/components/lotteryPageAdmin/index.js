import React, { useState, useEffect } from "react";
import { useParams, Navigate } from 'react-router-dom';
// styles
/* global BigInt */

import './lotteryPage.css'
// imported items
import { Loader } from "../loader";

import { ethers, providers } from "ethers";
import { MMSDK } from '../../App';
const config = require('../../assets/blockchain_abi.json')

const LotteryPage = props => {
    // -------------------------------------------------------VFRIABLES
    const { id } = useParams();

    const [loading, isLoading] = useState(true)
    const [lottery, setLottery] = useState()
    const [participants, setParticipants] = useState()
    const [winnersAmount, setWinnersAmount] = useState()
    const [transactions, setTransactions] = useState()

    var provider, ethereum, contract;
    useEffect(() => {
        loadAdminLottery()
    }, [])

    const loadAdminLottery = async () => {
        ethereum = MMSDK.getProvider();
        provider = new ethers.providers.Web3Provider(MMSDK.getProvider());

        contract = new ethers.Contract(process.env.REACT_APP_SC_ADDRESS, config, provider.getSigner());
        var lottery = await contract.lottery(id);
        setLottery(lottery)
        setParticipants(Number(lottery.curParticipants))
        setWinnersAmount(lottery.winnersAmount)
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
        // console.log(lottery.winnersAmount)
    }

    function randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function setPrizesAmount(funds, amount) {
        console.log("Funds to give", funds)
        var parts = (amount + 1) * amount / 2;
        console.log("Sum parts", parts, "of", amount)
        var prizes = []
        for (var i = 0; i < amount; i++) {
            prizes[i] = BigInt(Math.round(funds / parts * (i + 1)));
            
        }
        return prizes
    }

    const endLottery = async () => {
        provider = new ethers.providers.Web3Provider(MMSDK.getProvider());
        console.log("start to  end")
        contract = new ethers.Contract(process.env.REACT_APP_SC_ADDRESS, config, provider.getSigner());
        // var multiplicity = contract.multiplicity();
        var multiplicity = 2;
        console.log(Number(winnersAmount))
        var cycles = Number(winnersAmount) / multiplicity;
        var prizes = setPrizesAmount(lottery.curCapital * lottery.winnersPart / 100, Number(winnersAmount))
        var winners_tx = []
        isLoading(true)
        for (var i = 0; i < cycles; i++) {
            var winners = []
            var winners_prizes = []
            while (winners.length < multiplicity) {
                console.log("PARTS", participants)
                var int = randomInteger(100*id, 100*id+participants)
                var exists = await contract.ticketExists(0, 0);
                console.log("TRY", int, ". Is it exists?", exists)
                if (exists && !winners.includes(int)) {

                    console.log("Winner #", winners.length, "gets", prizes[winners.length + i * multiplicity])
                    winners_prizes[winners.length] = prizes[winners.length + i * multiplicity]
                    winners.push(int)
                }
            }
            console.log("WINNERS ARE = ", winners)
            console.log("PRIZES = ", winners_prizes)
            await contract.sendPrizes(id, winners, winners_prizes).then(transaction => {
                var tx = transaction.hash;
                console.log(tx)
                provider.waitForTransaction(tx)
                    .then(async (receipt) => {
                        console.log(receipt)
                        console.log("New winners tx:", tx)
                        winners_tx.push(tx);
                        console.log("DATA", winners_tx.length, cycles)
                        if (winners_tx.length == cycles) {
                            await contract.writeLotteryResults(id, winners_tx).then(transaction => {
                                isLoading(true)
                                console.log(transaction.hash)
                                provider.waitForTransaction(transaction.hash)
                                    .then((receipt) => {
                                        window.location.reload()
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                    })
                            })
                        }

                    })
                    .catch((error) => {
                        console.log(error)
                    })
            })
        }


    }

    return (
        <>
            {props.loggedUser === 'owner' ?
                <div className="main_container">
                    {loading ? <Loader /> :
                        <div className="content_container">
                            <h4 className="lottery_name_h">{lottery.name}</h4>
                            <div className="lotteryPage_image_container">
                                <img src={lottery.image} alt="lottery-image" />
                            </div>
                            <div className="lotteryPage_info_container">
                                <p>Процент призового фонда, который будет розыгран между победителями:</p>
                                <p>{Number(lottery.winnersPart)} %</p>
                                <p>Количество победителей:</p> <p>{Number(lottery.winnersAmount)}</p>
                                <p>Минимальное количество участников:</p> <p>{Number(lottery.winnersAmount)}</p>
                                <p>Текущее количество участников:</p> <p>{participants}</p>
                                <p>{lottery.isActive ? 'Tекущий капитал:' : "Заработок"}</p> <p>{Number(lottery.curCapital / 1000000000000000000).toFixed(5)}</p>
                                <p>Стоимость билета:</p> <p>{Number(lottery.ticketPrice / 1000000000000000000)}</p>
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
                                <button
                                    className="custom_button lotteryPage_end_button"
                                    disabled={Number(lottery.winnersAmount) > participants}
                                    onClick={endLottery}
                                >Завершить лотерею</button>
                            }
                        </div>
                    }
                </div>
                :
                <Navigate to={`/user/lottery/${id}`} />
            }</>
    )
}

export { LotteryPage }