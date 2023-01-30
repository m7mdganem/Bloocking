import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { getSignerHotelContract, getSignerReputationContract } from '../Shared/webEtherum';
import { useNavigate} from "react-router-dom";

import './HotelPage.css';

function Hotel({ contractAddress }) {
  let navigate = useNavigate({});

  // Hotel info
  const [hotelName, setHotelName] = useState(undefined);
  const [hotelRoomsTypes, setHotelRoomsTypes] = useState([]);
  const [hotelRoomsPrices, setHotelRoomsPrices] = useState(new Map());
  const [hotelRoomsNumbers, setHotelRoomsNumbers] = useState(new Map());
  const [coverPhotoLink, setCoverPhotoLink] = useState(undefined);

  // Dates
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()

  // Rating
  const [rating, setRating] = useState()
  const [ratingNumerical, setRatingNumerical] = useState()

  // Errors
  const [hasErrorDateRange, setHasErrorDateRange] = useState(new Map())
  const [hasErrorBooking, setHasErrorBooking] = useState(new Map())

  // isOwner
  const [isOwner, setIsOwner] = useState(false)

  // booked room id
  const [bookedRoomId, setBookedRoomId] = useState(new Map())

  window.ethereum.on('accountsChanged', function (_accounts) {
    checkIsOwner().then((isOwner2) => {
      if (isOwner != isOwner2) {
        setIsOwner(isOwner);
        navigate(`/hotels/admin/${contractAddress}`);
      }
    });
  });

  useEffect(() => {
    checkIsOwner().then((isOwner) => {
      setIsOwner(isOwner);
    });
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getHotelName().then((hotelName) => {
      setHotelName(hotelName);
    });
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getCoverPhotoLink().then((coverPhotoLink) => {
      setCoverPhotoLink(coverPhotoLink);
    });
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getRoomsTypes().then((roomsTypes) => {
      setHotelRoomsTypes(roomsTypes);
      getRoomsPrices(roomsTypes).then((roomsPrices) => {
        setHotelRoomsPrices(roomsPrices);
      });
      getNumberOfRoomsForEachRoomType(roomsTypes).then((roomsNumbers) => {
        setHotelRoomsNumbers(roomsNumbers);
      });
    });
  // eslint-disable-next-line
  }, []);

  async function getRoomsTypes() {
    const getRoomsTypesAsync = async (hotelContractAddress) => {
      if (typeof window.ethereum !== 'undefined') {
        const hotelContract = await getSignerHotelContract(hotelContractAddress);
        try {
          return await hotelContract.getRoomsTypes();
        } catch (err) {
          console.log("Error:    ", err)
        }
      }
    }
    return await getRoomsTypesAsync(contractAddress);
  }

  async function getRoomsPrices(roomsTypes) {
    const roomsPrices = new Map();
    const getRoomPriceAsync = async (hotelContractAddress, roomType) => {
      if (typeof window.ethereum !== 'undefined') {
        const hotelContract = await getSignerHotelContract(hotelContractAddress);
        try {
          return await hotelContract.getRoomPriceByType(roomType);
        } catch (err) {
          console.log("Error:    ", err)
        }
      }
    }
    for (const roomType of roomsTypes) {
      roomsPrices.set(roomType, await getRoomPriceAsync(contractAddress, roomType));
    }
    return roomsPrices;
  }

  async function getNumberOfRoomsForEachRoomType(roomsTypes) {
    const numberOfRooms = new Map();
    const getNumberOfRoomsByTypeAsync = async (hotelContractAddress, roomType) => {
      if (typeof window.ethereum !== 'undefined') {
        const hotelContract = await getSignerHotelContract(hotelContractAddress);
        try {
          return await hotelContract.getNumberOfRoomsByType(roomType);
        } catch (err) {
          console.log("Error:    ", err)
        }
      }
    }
    for (const roomType of roomsTypes) {
      numberOfRooms.set(roomType, await getNumberOfRoomsByTypeAsync(contractAddress, roomType));
    }
    return numberOfRooms;
  }

  async function getHotelName() {
    const getHotelNameAsync = async (hotelContractAddress) => {
      if (typeof window.ethereum !== 'undefined') {
        const hotelContract = await getSignerHotelContract(hotelContractAddress);
        try {
          return await hotelContract.getHotelName();
        } catch (err) {
          console.log("Error:    ", err)
        }
      }
    }
    return await getHotelNameAsync(contractAddress);
  }

  async function getCoverPhotoLink() {
    const getCoverPhotoLinkAsync = async (hotelContractAddress) => {
      if (typeof window.ethereum !== 'undefined') {
        const hotelContract = await getSignerHotelContract(hotelContractAddress);
        try {
          return await hotelContract.getCoverPhotoLink();
        } catch (err) {
          console.log("Error:    ", err);
        }
      }
    }
    return await getCoverPhotoLinkAsync(contractAddress);
  }

  async function makeBooking(roomType, roomPrice) {
    if (typeof window.ethereum !== 'undefined') {
      const hotelContract = await getSignerHotelContract(contractAddress);
      try {
        const transaction = await hotelContract.makeBooking(startDate.getTime(), endDate.getTime(), roomType, { value: ethers.utils.parseEther(roomPrice) });
        const roomId = await transaction.wait();
        return roomId.events[0].args.roomId;
      } catch (err) {
        console.log("Error:    ", err);
        setHasErrorBooking(new Map([[roomType, true]]));
      }
    }
  }

  async function onClickMakeBooking(event) {
    let roomType = event.target.getAttribute("roomType");
    let roomPrice = event.target.getAttribute("roomPrice");

    // reset error message
    setHasErrorBooking(new Map());

    // reset error date range
    setHasErrorDateRange(new Map());
    
    // reset room booked message
    setBookedRoomId(new Map());

    if (startDate.getTime() >= endDate.getTime()) {
      setHasErrorDateRange(new Map([[roomType, true]]));
      return;
    }

    const roomId = await makeBooking(roomType, roomPrice);

    // set room booked message
    const newBookings = new Map(bookedRoomId);
    newBookings.set(roomType, roomId);
    setBookedRoomId(newBookings);
  }

  async function rateHotel() {
    if (typeof window.ethereum !== 'undefined') {
      const hotelContract = await getSignerHotelContract(contractAddress);
      const reputationContract = getSignerReputationContract();
      try {
        const isCustomer = await hotelContract.isCustomer();
        if(isCustomer) {
          const rate = await reputationContract.submitRating(contractAddress, ratingNumerical);
          await rate.wait();
        }
        else {
          alert("You can't rate a hotel if you haven't booked a room in it!");
        }
      } catch (err) {
        console.log("Error:    ", err);
      }
    }    
  }

  async function checkIsOwner() {
    if (typeof window.ethereum !== 'undefined') {
      const hotelContract = await getSignerHotelContract(contractAddress);
      try {
        return await hotelContract.isOwner();
      } catch (err) {
        console.log("Error:    ", err)
      }
    }    
  }

  function getCurrentDate() {
    var now = new Date();
    var month = (now.getMonth() + 1);               
    var day = now.getDate();
    if (month < 10) 
        month = "0" + month;
    if (day < 10) 
        day = "0" + day;
    return now.getFullYear() + '-' + month + '-' + day;
  }

  function changeStartDate(x) {
    setHasErrorBooking(new Map());
    setHasErrorDateRange(new Map());
    setStartDate(new Date(x.target.value));
  }

  function changeEndDate(x) {
    setHasErrorBooking(new Map());
    setEndDate(new Date(x.target.value));
  }

  function onChangeSetRating(event) {
    let rating = event.target.getAttribute("rating");

    const newRating = [0, 0, 0, 0, 0];
    for (let i = 0; i < rating; i++) {
      newRating[i] = 1;
    }

    setRating(newRating);
    setRatingNumerical(rating);
  }

  function getRatingComponent() {
    return (
      <div>
        {(rating && rating[0] === 1) ? <span class="fa fa-star checked star" rating={1} onClick={onChangeSetRating}></span> : <span class="fa fa-star star" rating={1} onClick={onChangeSetRating}></span>}
        {(rating && rating[1] === 1) ? <span class="fa fa-star checked star" rating={2} onClick={onChangeSetRating}></span> : <span class="fa fa-star star" rating={2} onClick={onChangeSetRating}></span>}
        {(rating && rating[2] === 1) ? <span class="fa fa-star checked star" rating={3} onClick={onChangeSetRating}></span> : <span class="fa fa-star star" rating={3} onClick={onChangeSetRating}></span>}
        {(rating && rating[3] === 1) ? <span class="fa fa-star checked star" rating={4} onClick={onChangeSetRating}></span> : <span class="fa fa-star star" rating={4} onClick={onChangeSetRating}></span>}
        {(rating && rating[4] === 1) ? <span class="fa fa-star checked star" rating={5} onClick={onChangeSetRating}></span> : <span class="fa fa-star star" rating={5} onClick={onChangeSetRating}></span>}
      </div>
    )
  }

  return (
    <>
    {!isOwner &&
      (<div>
      <div class="header">
        {coverPhotoLink && <img class="hotel-img" src={coverPhotoLink} alt=""></img>}
        {hotelName && <div class="hotel-name">{`${hotelName}`}</div>}
      </div>

        <div class="rooms">
          {hotelRoomsTypes &&
           hotelRoomsTypes.map((roomType, index) => {
            return <div class="rooms-card">
              <h2>{`${roomType}`}</h2>
              {hotelRoomsNumbers.get(roomType) && <p>{`Number of rooms: ${hotelRoomsNumbers.get(roomType)}`}</p>}
              {hotelRoomsPrices.get(roomType) && <p>{`Price: ${hotelRoomsPrices.get(roomType)} ETH`}</p>}
              <div class="booking-button">
                <div class="date-picker">
                  <span class="date-title1">From: </span>
                  <input type="date" id="start" name="booking-start" min={getCurrentDate()} onChange={changeStartDate}></input>
                </div>
                <div class="date-picker">
                  <span class="date-title2">To: </span>
                  <input type="date" id="end" name="booking-end" min={getCurrentDate()} onChange={changeEndDate}></input>
                </div>
                {hotelRoomsPrices.get(roomType) && <button class="book-now-button" roomType={roomType} roomPrice={hotelRoomsPrices.get(roomType)} onClick={onClickMakeBooking}>Book Now</button>}
                {hasErrorDateRange.get(roomType) && <p class="error">Please select a valid date range.</p>}
                {hasErrorBooking.get(roomType) && <p class="error">{'There are no available rooms in this date. Please select another date or try booking another room type.'}</p>}
                {bookedRoomId.get(roomType) && <p class="room-booked">{`You booked room number ${bookedRoomId.get(roomType)} Successfully`}</p>}
              </div>
            </div>

          })}
        </div>

        <div class="rating">
          <div class="card-wrapper">
          <div class="card-details">
            <h3 class="card-title">Have you been in this hotel? Please help us rating it!</h3>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
            {getRatingComponent()}
          </div>
          
          <div class="reveal-details">
            <button class="submit-feedback-button" onClick={rateHotel}>Submit Feedback</button>
          </div>
        </div>
        </div>

    </div>)}
    </>
  );
}

export default Hotel;