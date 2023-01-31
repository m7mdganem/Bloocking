import { ethers } from 'ethers';

import HotelBooking from '../HotelBooking.json';
import contractsInfo from '../contractsInfo.json';
import Reputation from '../Reputation.json';

export async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
}

export async function getSignerHotelContract(hotelContractAddress) {
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer);
}

export async function getSignerReputationContract() {
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractsInfo.reps[0].reputationContractAddress, Reputation.abi, signer);
}

export async function getProviderReputationContract() {
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return new ethers.Contract(contractsInfo.reps[0].reputationContractAddress, Reputation.abi, provider);
}
