import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
// styles
import './adminPage.css'
// imported images
/* global BigInt */

import searchIcon from '../../assets/images/search.svg'
// imported items
import { Loader } from "../loader";

import { ethers, providers } from "ethers";
import { MMSDK } from '../../App';
const config = require('../../assets/blockchain_abi.json')

const AdminPage = props => {
    const [loading, setLoading] = useState(true)
    const [allLoteries, setAllLoteries] = useState([])

    useEffect(() => {
        loadLotteries()
    }, [])

    const loadLotteries = async () => {
        try {
            const ethereum = MMSDK.getProvider();
            const provider = new ethers.providers.Web3Provider(ethereum);

            const contract = new ethers.Contract(process.env.REACT_APP_SC_ADDRESS, config, provider.getSigner());
            const totalLotteries = await contract.actualLottery();
            console.log("Total Lottteries", totalLotteries)
            for (var id = 0; id < Number(totalLotteries); id++) {
                console.log("Total Lottteries", Number(totalLotteries), "now", id)
                var lottery = await contract.lottery(id);
                console.log("LOT", lottery)
                var lot = {
                    id: id,
                    name: lottery.name,
                    isActive: lottery.isActive
                }
                if (!allLoteries.includes(lot)) {
                    allLoteries.push(lot)
                }
                console.log("Lotteries loaded", allLoteries)
            }
            setLoading(false)
        }
        catch (err) {
            setLoading(false)
            console.log(err)
        }
    }

    return (
        <>
            {props.loggedUser === 'owner' ?
                <div className="main_container">
                    {loading ? <Loader /> : <>
                        < div className="content_container adminPage_main_container">
                            {/*--------------------------------------------------------------ПОИСК ПО ЛАТЕРЕЯМ */}
                            <div className="search_lotteries_container adminPage_search_lotteries_container">
                                <input placeholder="Введите название латереи" />
                                <button> <img src={searchIcon} alt="search-icon" className="search_icon" /> </button>
                            </div>
                            {/* -----------------------------------------------------------СПИСОК ЛОТЕРЕЙ */}
                            {allLoteries.map((item, index) => (
                                <div className="lotteryItem_container" onClick={() => { window.location.href = `/admin/lottery/${item.id}` }}>
                                    <div className="lotteryItem">
                                        <div>{item.id}</div>
                                        <div>{item.name}</div>
                                    </div>
                                </div>
                            ))}
                            {/*--------------------------------------------------------------КНОПКА СОЗДАНИЯ НОВОЙ ЛОТЕРЕИ */}
                            <div className="admincreateLotteryBut_container">
                                <form action="/create/">
                                    <button className="custom_button createLoterryBut" type="submit">Создать новую лотерею</button>
                                </form>
                            </div>
                        </div>
                    </>
                    }
                </div >
                :
                <Navigate to='/user' />
            }
        </>
    )
}

export { AdminPage }