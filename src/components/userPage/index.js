import React, { useState, useEffect } from "react";
// styles
import './userPage.css'
// imported images
import searchIcon from '../../assets/images/search.svg'
// imported items
import { Loader } from "../loader";

import { ethers, providers } from "ethers";
import { MMSDK } from '../../App';
const config = require('../../assets/blockchain_abi.json')

const UserPage = props => {
    // -----------------------------------------VARIABLES
    const [loading, setLoading] = useState(true)
    const [availLoteries, setAvailLoteries] = useState([])
    const [oldLoteries, setOldLoteries] = useState([])

    useEffect(() => {
        loadLotteries()
    }, [])

    const loadLotteries = async () => {
        const ethereum = MMSDK.getProvider();
		const provider = new ethers.providers.Web3Provider(ethereum);

        var contract = new ethers.Contract(process.env.REACT_APP_SC_ADDRESS, config, provider.getSigner());
        var totalLotteries = await contract.actualLottery();
        for (var id = 0; id < totalLotteries; id++) {
            var lottery = await contract.lottery(id);
            console.log("new lottery", lottery,  "ends", lottery.transactions)
            var lot = {
                id: id,
                name: lottery.name,
                isActive: lottery.isActive
            }
            if (lot.isActive === true) {
                availLoteries.push(lot)
            } else {
                oldLoteries.push(lot)
            }
            console.log(availLoteries)
        }
        setLoading(false)
    }
    return (
        <div className="main_container">
            {loading ? <Loader /> : <>
                {/* -----------------------------------------------------------СПИСОК ТЕКУЩИХ ЛОТЕРЕЙ */}
                <div className="content_container userPage_lotteries">
                    <h4>Текущие</h4>
                    {/*--------------------------------------------------------------ПОИСК ПО ЛАТЕРЕЯМ */}
                    <div className="search_lotteries_container userPage_search_lotteries_container">
                        <input placeholder="Введите название латереи" />
                        <button> <img src={searchIcon} alt="search-icon" className="search_icon" /> </button>
                    </div>
                    {availLoteries.map((item, index) => (
                        <div className="lotteryItem_container" onClick={() => { window.location.href = `/user/lottery/${item.id}` }}>
                            <div className="lotteryItem">
                                <div>{item.id}</div>
                                <div>{item.name}</div>
                            </div>
                        </div>
                    ))}

                </div>

                {/* -----------------------------------------------------------СПИСОК ЗАВЕРШЕННЫХ ЛОТЕРЕЙ */}
                <div className="content_container userPage_lotteries_done">
                    <h4>Завершенные</h4>
                    {/*--------------------------------------------------------------ПОИСК ПО ЛАТЕРЕЯМ */}
                    <div className="search_lotteries_container userPage_search_lotteries_container">
                        <input placeholder="Введите название латереи" />
                        <button> <img src={searchIcon} alt="search-icon" className="search_icon" /> </button>
                    </div>
                    {oldLoteries.map((item, index) => (
                        <div className="lotteryItem_container" onClick={() => { window.location.href = `/user/lottery/${item.id}` }}>
                            <div className="lotteryItem">
                                <div>{item.id}</div>
                                <div>{item.name}</div>
                            </div>
                        </div>
                    ))}

                </div>
            </>}
        </div>
    )
}

export { UserPage }