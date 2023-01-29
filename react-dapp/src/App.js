import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { requestAccount } from './Shared/webEtherum';
import { useNavigate} from "react-router-dom";

import HotelBooking from './HotelBooking.json';
import Reputation from './Reputation.json';
import contractsInfo from './contractsInfo.json';

import './App.css';

function App() {
  let navigate = useNavigate({});

  // Hotels info
  const [hotelsNames, setHotelsNames] = useState(new Map());
  const [hotelsCoverPhotoLinks, setHotelsCoverPhotoLinks] = useState(new Map());
  const [hotelsRatings, setHotelsRatings] = useState(new Map());
  const [hotelsAddresses, setHotelsAddresses] = useState(new Map());

  const [isAdmin, setIsAdmin] = useState(new Map());
  const [numberOfRooms, setNumberOfRooms] = useState(new Map());

  useEffect(() => {
    getHotelsNames().then((hotelsNames) => {
      setHotelsNames(hotelsNames);
    });
  }, []);

  useEffect(() => {
    getHotelsPhotoCoverLinks().then((hotelsPhotoCoverLinks) => {
      setHotelsCoverPhotoLinks(hotelsPhotoCoverLinks);
    });
  }, []);

  useEffect(() => {
    getHotelsRatings().then((ratings) => {
      setHotelsRatings(ratings);
    });
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    checkIsAdminForEachHotel().then((adminByHotel) => {
      setIsAdmin(adminByHotel);
    });
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getHotelsAddresses().then((addresses) => {
      setHotelsAddresses(addresses);
    });
  }, []);

  useEffect(() => {
    getNumberOfRooms().then((numberOfRooms) => {
      setNumberOfRooms(numberOfRooms);
    });
  }, []);

  async function getHotelsNames() {
    const hotelsNames = new Map();

    const getHotelsNamesAsync = async (hotelContractAddress) => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const a = new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer)
        try {
          const hotelName = await a.getHotelName()
          return hotelName;
        } catch (err) {
          console.log("Error:    ", err)
        }
      }
    }

    for (const hotel of contractsInfo.hotels) {
      hotelsNames.set(hotel.contractAddress, await getHotelsNamesAsync(hotel.contractAddress));
    }
    return hotelsNames;
  }

  async function getHotelsPhotoCoverLinks() {
    const hotelsPhotoCoverLinks = new Map();

    const getHotelsPhotoCoverLinksAsync = async (hotelContractAddress) => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const a = new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer)
        try {
          const hotelPhotoCoverLink = await a.getCoverPhotoLink()
          return hotelPhotoCoverLink;
        } catch (err) {
          console.log("Error:    ", err)
        }
      }
    }

    for (const hotel of contractsInfo.hotels) {
      hotelsPhotoCoverLinks.set(hotel.contractAddress, await getHotelsPhotoCoverLinksAsync(hotel.contractAddress));
    }
    return hotelsPhotoCoverLinks;
  }

  async function getHotelRatingAsync(hotelAdress) {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const rate = new ethers.Contract(contractsInfo.reps[0].reputationContractAddress, Reputation.abi, provider)
      try {
        const rating = await rate.getRating(hotelAdress);
        return rating;
      } catch (err) {
        console.log("Error:    ", err)
      }
    }
  }

  async function getHotelRating(hotelAdress) {
    const rating = await getHotelRatingAsync(hotelAdress);
    if (rating[1]._hex === "0x00") {
      return undefined;
    }
    return rating[0]._hex / rating[1]._hex;
  }

  async function getHotelsRatings() {
    const ratings = new Map();

    for (const hotel of contractsInfo.hotels) {
      ratings.set(hotel.contractAddress, await getHotelRating(hotel.contractAddress));
    }

    return ratings;
  }

  async function checkIsOwnerAsync(hotelContractAddress) {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const a = new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer)
      try {
        const isOwner = await a.isOwner()
        return isOwner;
      } catch (err) {
        console.log("Error:    ", err)
      }
    }    
  }

  async function checkIsAdminForEachHotel() {
    const admins = new Map();
    for (const hotel of contractsInfo.hotels) {
      admins.set(hotel.contractAddress, await checkIsOwnerAsync(hotel.contractAddress));
    }
    return admins;
  }

  async function getHotelsAddresses() {
    const addresses = new Map();

    const getHotelsAddressesAsync = async (hotelContractAddress) => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const a = new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer)
        try {
          const hotelAddress = await a.getHotelAddress()
          return hotelAddress;
        } catch (err) {
          console.log("Error:    ", err)
        }
      }
    }

    for (const hotel of contractsInfo.hotels) {
      addresses.set(hotel.contractAddress, await getHotelsAddressesAsync(hotel.contractAddress));
    }
    return addresses;
  }

  async function getNumberOfRooms() {
    const numberOfRooms = new Map();

    const getNumberOfroomsAsync = async (hotelContractAddress) => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const a = new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer)
        try {
          const numberOfRooms = await a.getTotalRooms()
          return numberOfRooms;
        } catch (err) {
          console.log("Error:    ", err)
        }
      }
    }

    for (const hotel of contractsInfo.hotels) {
      numberOfRooms.set(hotel.contractAddress, await getNumberOfroomsAsync(hotel.contractAddress));
    }
    return numberOfRooms;
  }



  return (
    <>
    <div className="App">
      
      <div className="App-header">
        <div class="header-Name">
          <h1 class="header1">Bloocking</h1>
          <h1 class="header2">.</h1>
          <h1 class="header3">com</h1>
        </div>
        <div className='description'>
          <h4>Booking Based On Block Chain</h4>
        </div>
      </div>

      <div className='hotels'>
      {contractsInfo.hotels.map((hotel) => 
        <button class="hotel-button"
          onClick={async () => { if (isAdmin.get(hotel.contractAddress)) { navigate(`/hotels/admin/${hotel.contractAddress}`); } else { navigate(`/hotels/${hotel.contractAddress}`); }}}>
            {hotelsNames.get(hotel.contractAddress) && <h2>{hotelsNames.get(hotel.contractAddress)}</h2>}
        <div>
        {hotelsRatings.get(hotel.contractAddress) &&
          (<div class="rating-stars" style={{width: `${22 * hotelsRatings.get(hotel.contractAddress)}px`, whiteSpace: 'nowrap', overflow: 'hidden', position: 'relative', display: 'inline-block'}}>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
            <span class="fa fa-star checked star"></span>
            <span class="fa fa-star checked star"></span>
            <span class="fa fa-star checked star"></span>
            <span class="fa fa-star checked star"></span>
            <span class="fa fa-star checked star"></span>
           </div>)
        }

        {!hotelsRatings.get(hotel.contractAddress) &&
          (<div class="no-rating-available" style={{position: 'relative', display: 'inline-block', fontSize: '16px', color: 'rgb(230, 150, 2)'}}>
            <span> No rating available for this hotel yet </span>
           </div>)
        }
        </div>
        {hotelsCoverPhotoLinks.get(hotel.contractAddress) && <img class="hotel-img" src={hotelsCoverPhotoLinks.get(hotel.contractAddress)} alt=""></img>}
        <div class="Hotel-information">
          {numberOfRooms.get(hotel.contractAddress) && <div>{`Number of rooms: ${numberOfRooms.get(hotel.contractAddress)}`}</div>}
          {hotelsAddresses.get(hotel.contractAddress) && <div>{`Address: ${hotelsAddresses.get(hotel.contractAddress)}`}</div>}
        </div>
        </button>)}
      </div>
      
    </div>
    </>
  );
}

export default App;