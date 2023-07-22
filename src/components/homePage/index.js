import React from "react";
// styles
import './homePage.css'
import { Background } from "../background";
//Blockchain components
import { ethers, providers } from "ethers";
import { MMSDK } from '../../App';
const config = require('../../assets/blockchain_abi.json')

const HomePage = () => {

	const loginOnClick = async () => {
		try{
		const ethereum = MMSDK.getProvider();
		var provider = new ethers.providers.Web3Provider(ethereum, 'any');

		const users = await provider.send("eth_requestAccounts", []);
		const network = ethereum.networkVersion;
		console.log('Connected to', users[0], ' and ', network)
		//check network settings and change it
		if (network != 111000) {
			console.log("try to change")
			try {
				await ethereum.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: ethers.utils.hexValue(111000) }]
				});
			} catch (switchError) {
				console.log("failed change", switchError)
				if (switchError.code === 4902) {
					try {
						await ethereum.request({
							method: "wallet_addEthereumChain",
							params: [{
								chainName: 'Siberium Test Network',
								chainId: ethers.utils.hexValue(111000),
								nativeCurrency: { name: 'SIBR', decimals: 18, symbol: 'SIBR' },
								rpcUrls: ['https://rpc.test.siberium.net']
							}]
						});
					} catch (error) {
						console.log("ERROR", error)
					}
				}
			}
		}
		var loggedUser = users[0].toLowerCase();
		localStorage.setItem('LogIn_User', JSON.stringify(loggedUser))
		console.log("Logged", loggedUser, "with chainId")

		var contract = new ethers.Contract(process.env.REACT_APP_SC_ADDRESS, config, provider.getSigner());
		console.log("CONTRACT:", contract)
		var owner = await contract.owner();
		if (owner.toLowerCase() == loggedUser) {
			window.location.href = `/admin`;
			console.log('here is admin', owner)
			localStorage.setItem('LoggedIn', JSON.stringify("owner"))
		}
		else {
			window.location.href = `/user`;
			console.log('here is user', owner)
			localStorage.setItem('LoggedIn', JSON.stringify("user"))
		}
	} catch (err) {console.log(err)}
	}


	return (
		<>
			<div className="homaPage_container">
				<button className="logIn_button" type="submit" onClick={loginOnClick}> Войти </button>
			</div>
		</>
	)
}

export { HomePage }