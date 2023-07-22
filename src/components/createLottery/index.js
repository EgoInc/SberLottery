import React, { useState } from "react";
// styles
import './createLottery.css'
// imprted images
/* global BigInt */
import imageIcon from '../../assets/images/image.svg'
import { ethers, providers } from "ethers";
import { MMSDK } from '../../App';
import { Loader } from "../loader";
const config = require('../../assets/blockchain_abi.json')

const CreateLottery = props => {
    // -------------------------------------VARIABLES
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState()
    const [percent, setPercent] = useState()
    const [image, setImage] = useState('')
    const [winnersAmount, setWinnersAmount] = useState()
    const [playersAmount, setPlayersAmount] = useState()
    const [fond, setFond] = useState()
    const [ticket, setTicket] = useState()


    const startLottery = async () => {
        const ethereum = MMSDK.getProvider();
		const provider = new ethers.providers.Web3Provider(ethereum);
        var contract = new ethers.Contract(process.env.REACT_APP_SC_ADDRESS, config, provider.getSigner());
        const options = { value: BigInt(fond * 1000000000000000000) }
        var parts = (winnersAmount * (winnersAmount + 1)) / 2;
        var ticketPrice = ticket * 1000000000000000000;
        // var lotteryStruct = [name, percent, winnersAmount, BigInt(ticketPrice), image, BigInt(fond * 1000000000000000000), true, parts]


        await contract.initializeLottery(name, percent, winnersAmount, BigInt(ticketPrice), image, BigInt(fond * 1000000000000000000), options).then(transaction => {
            setLoading(true)
            console.log(transaction.hash)
            provider.waitForTransaction(transaction.hash)
                .then((receipt) => {
                    console.log(receipt)
                })
                .catch((error) => {
                    console.log(error)
                })
            contract.on("NewLottery", async (id) => {
                console.log("Lot created with id:", Number(id));
                //Перевод на страницу лотерии с id
                window.location.href = `/admin/lottery/${id}`
            }, error => {
                console.error(error) // from creation
            })
        })
    }

    return (
        <div className="main_container">
            {loading ? <Loader /> :
                <>
                    {/*--------------------------------------------------------------ОТОБРАЖЕНИЕ КАРТИНКИ */}
                    <div className="create_image_container">
                        {image == ''
                            ?
                            <div className="create_no_image">
                                <img src={imageIcon} alt="no-image" />
                            </div>
                            :
                            <img src={image} className="create_loaded_image" alt="loaded-image" />
                        }
                    </div>

                    {/*--------------------------------------------------------------ДАННЫЕ О ЛАТЕРЕИ */}
                    <div className="content_container">
                        <div className="custom_input_container">
                            <p>Название лотерии</p>
                            <div className="custom_input">
                                <input placeholder="Введите название" className="create_input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="custom_input_container">
                            <p>Изображение для отображения лотерейных билетов</p>
                            <div className="custom_input">
                                <input placeholder="Введите ссылку на картинку" className="create_input"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="custom_input_container">
                            <p>Процент призового фонда, который будет розыгран между победителями</p>
                            <div className="custom_input">
                                <input placeholder="Введите процент для победителей (не менее 60%)" className="create_input"
                                    value={percent}
                                    onChange={(e) => setPercent(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="custom_input_container">
                            <p>Количество победителей</p>
                            <div className="custom_input">
                                <input placeholder="Введите количество победителей" className="create_input"
                                    value={winnersAmount}
                                    onChange={(e) => setWinnersAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="custom_input_container">
                            <p>Минимальное количество участников</p>
                            <div className="custom_input">
                                <input placeholder="Введите количество участников" className="create_input"
                                    value={playersAmount}
                                    onChange={(e) => setPlayersAmount(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="custom_input_container">
                            <p>Первоначальный капитал (опционально)</p>
                            <div className="custom_input">
                                <input placeholder="Введите первоначальный капитал" className="create_input"
                                    value={fond}
                                    onChange={(e) => setFond(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="custom_input_container">
                            <p>Стоимость билета</p>
                            <div className="custom_input">
                                <input placeholder="Введите стоимость билета" className="create_input"
                                    value={ticket}
                                    onChange={(e) => setTicket(e.target.value)}
                                />
                            </div>
                        </div>

                        {/*--------------------------------------------------------------КНОПКА СОЗДАНИЯ НОВОЙ ЛОТЕРЕИ */}
                        <div className="createLotteryBut_container">
                            <button className="custom_button createLoterryBut" onClick={startLottery}>Создать лотерею</button>
                        </div>

                    </div>
                </>
            }
        </div>
    )
}

export { CreateLottery }