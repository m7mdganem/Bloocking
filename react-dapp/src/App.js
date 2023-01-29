import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { requestAccount } from './Shared/webEtherum';
import Reputation from './Reputation.json'
import './App.css';
import contractsInfo from './contractsInfo.json'
import { useNavigate} from "react-router-dom";

function App() {
  let navigate = useNavigate({});

  const [hotelsRatings, setHotelsRatings] = useState(new Map());

  useEffect(() => {
    getHotelsRatings().then((ratings) => {
      setHotelsRatings(ratings);
    });
  }, []);

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
          onClick={async () => navigate(`/hotels/${hotel.key}`)}>
            <h2>{hotel.name}</h2>
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
        <img class="hotel-img" src={hotel.coverPhotoLink} alt="">
        </img>
        <div>{`Number of rooms: ${hotel.numberOfLuxuryRooms + hotel.numberOfRegularRooms}`}</div>
        <div>{`Address: ${hotel.address}`}</div>
        </button>)}
      </div>
      
    </div>
    </>
  );
}

export default App;