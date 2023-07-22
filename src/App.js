import './App.css';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminRoute from './routes/adminRoute';
// imported pages
import { Loader } from './components/loader';
import { Background } from './components/background';
import { HomePage } from './components/homePage';
import { AdminPage } from './components/adminPage';
import { UserPage } from './components/userPage';
import { CreateLottery } from './components/createLottery';
import { LotteryPage } from './components/lotteryPageAdmin';
import { LotteryPageForPlayer } from './components/lotteryPageForPlayer';
import { ChooseCard } from './components/chooseCard/chooseCard';
//Blockchain
import { ethers, providers } from "ethers";
import { MetaMaskSDK } from '@metamask/sdk';


const options = {
  dappMetadata: { name: "Art Space", url: "https://art_space.com" },
  injectProvider: true,
  communicationLayerPreference: 'webrtc',
  preferDesktop: false
};
export const MMSDK = new MetaMaskSDK(options);

function App() {
  const [loggedUser, setLoggedUser] = useState(() => {
		var savedItem = localStorage.getItem("LoggedIn");
		var parsedItem = JSON.parse(savedItem);
		return parsedItem || null;
	});

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/loader" element={<Loader />} />
        <Route path="/admin" element={<AdminPage loggedUser={loggedUser}/>} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/create" element={<CreateLottery />} />
        <Route path="/admin/lottery/:id" element={<LotteryPage loggedUser={loggedUser}/>} />
        <Route path="/user/lottery/:id" element={<LotteryPageForPlayer />} />
        <Route path="/user/lottery/:id/choose" element={<ChooseCard />} />
      </Routes>
    </div>
  );
}

export default App;
