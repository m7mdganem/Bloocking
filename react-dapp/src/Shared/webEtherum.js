import { ethers } from 'ethers';

import HotelBooking from '../HotelBooking.json';
import contractsInfo from '../Reputation.json';

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
    return new ethers.Contract(contractsInfo.reps[0].reputationContractAddress, HotelBooking.abi, signer);
}
