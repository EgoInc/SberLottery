import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// styles
import './chooseCard.css'
// imported items
import { Loader } from "../loader";

import { create } from "ipfs-http-client";
import { ethers, providers } from "ethers";
import { MMSDK } from '../../App';
const config = require('../../assets/blockchain_abi.json')

const ChooseCard = props => {
    // -------------------------------------------------------VARIABLES
    const { id } = useParams()
    const [loading, isLoading] = useState(true)
    const [lottery, setLottery] = useState()
    const [participants, setParticipants] = useState()

    const [resultsNumbers, setResultsNumbers] = useState([])

    var provider, provider, contract;
    useEffect(() => {
        loadLotteries()
    }, [])

    async function getThreeRandoms(participants, winners) {
        var results = [];
        console.log("HERE", participants, winners)
        if (participants >= winners) {
            console.log("FIXED TICKET")
            results = [100*id+participants, 100*id+participants, 100*id+participants]
        }
        else {
            var number;
            while (results.length < 3) {
                number = 100*id + Math.floor(Math.random() * winners);
                console.log('check', number)
                var numberExists = await contract.ticketExists(id, number);
                if (!numberExists) {
                    results.push(number);
                }
            }
        }

        console.log("Варианты выбора", results);
        setResultsNumbers(results)
        return results;
    }

    const loadLotteries = async () => {
        const ethereum = MMSDK.getProvider();
		const provider = new ethers.providers.Web3Provider(ethereum);
        contract = new ethers.Contract(process.env.REACT_APP_SC_ADDRESS, config, provider.getSigner());
        var lottery = await contract.lottery(id);
        setLottery(lottery);
        var participants = lottery.curParticipants;
        setParticipants(Number(participants))
        console.log(lottery.winnersAmount);

        await getThreeRandoms(Number(participants), Number(lottery.winnersAmount))
        isLoading(false)

        // getThreeRandoms()
    }


    async function ipfsClient() {
        const auth = 'Basic ' + Buffer.from(process.env.REACT_APP_INFURA_IPFS + ':' + process.env.REACT_APP_INFURA_IPFS_SECRET).toString('base64');
        const ipfs = await create(
            {
                host: "ipfs.infura.io",
                port: 5001,
                protocol: "https",
                headers: {
                    authorization: auth, // infura auth credentails
                },
            }
        );
        return ipfs;
    }

    async function createJSON(lottery, tickNum) {
        let ipfs = await ipfsClient();
        console.log(lottery)
        var nft = {
            name: lottery.name,
            description: `Лотерейный билет №${tickNum} для лотерии "${lottery.name}"`,
            image: lottery.image
        }
        console.log(nft)
        let options = {
            warpWithDirectory: false,
            progress: (prog) => console.log(`Saved :${prog}`)
        }
        console.log(1)
        let result = await ipfs.add(JSON.stringify(nft), options);
        result = result.path
        var jsonUrl = `https://sber-lottery.infura-ipfs.io/ipfs/${result}`
        // var jsonUrl = ipfsUrl.url.replace('ipfs://','https://ipfs.io/ipfs/');
        return jsonUrl
    }

    const issueTicket = async (tickNum) => {
        const ethereum = MMSDK.getProvider();
		const provider = new ethers.providers.Web3Provider(ethereum);
        contract = new ethers.Contract(process.env.REACT_APP_SC_ADDRESS, config, provider.getSigner());
        console.log(contract)
        var lottery = await contract.lottery(id);
        var linkToJSON = await createJSON(lottery, resultsNumbers[tickNum]);
        console.log(linkToJSON)
        const options = { value: lottery.ticketPrice }
        await contract.buyTicket(id, resultsNumbers[tickNum], linkToJSON, options).then(transaction => {
            isLoading(true)
            console.log(transaction.hash)
            provider.waitForTransaction(transaction.hash)
                .then((receipt) => {
                    console.log(receipt)
                    window.location.href = `/user/lottery/${id}`
                })
                .catch((error) => {
                    console.log(error)
                })
        })
    }

    const [cardNum, setCardNum] = useState('')

    return (
        <div className="main_container">
            {loading ? <Loader /> :
                <div className="content_container">
                    <h4 className="lottery_name_h">{lottery.name}</h4>
                    <div className="chooseCard_image_container">
                        <img src={lottery.image} alt="lottery-image" />
                    </div>
                    <h5 className="choose_card_h">Выберите карточку</h5>
                    <div className="chooseCard_cards_container">
                        <div className="card" onClick={(e) => { setCardNum(1); issueTicket(0) }}>
                            <div className="card__side card__side--front card__side--front-1">
                                <div className="card__description">1</div>
                            </div>
                            <div className={` ${cardNum === 1 && 'card__side card__side--back card__side--back-1'}`}>
                                <div className="card__result">{resultsNumbers[0]}</div>
                            </div>
                        </div>
                        <div className="card" onClick={(e) => { setCardNum(2); issueTicket(1) }}>
                            <div className="card__side card__side--front card__side--front-2">
                                <div className="card__description">2</div>
                            </div>
                            <div className={` ${cardNum === 2 && 'card__side card__side--back card__side--back-2'}`}>
                                <div className="card__result">{resultsNumbers[1]}</div>
                            </div>
                        </div>
                        <div className="card" onClick={(e) => { setCardNum(3); issueTicket(2) }}>
                            <div className="card__side card__side--front card__side--front-3">
                                <div className="card__description">3</div>
                            </div>
                            <div className={` ${cardNum === 3 && 'card__side card__side--back card__side--back-3'}`}>
                                <div className="card__result">{resultsNumbers[2]}</div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div >
    )
}

export { ChooseCard }