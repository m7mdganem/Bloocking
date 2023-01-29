import { ethers } from 'ethers';
import { requestAccount } from '../Shared/webEtherum';
import { useState, useEffect } from 'react';

import HotelBooking from '../HotelBooking.json';
import Reputation from '../Reputation.json';
import contractsInfo from '../contractsInfo.json';

import './HotelAdminPage.css';

function HotelAdminPage({ contractAddress }) {
  // Hotel info
  const [hotelName, setHotelName] = useState(undefined);
  const [hotelRoomsTypes, setHotelRoomsTypes] = useState([]);
  const [hotelRoomsPrices, setHotelRoomsPrices] = useState(new Map());
  const [hotelRoomsNumbers, setHotelRoomsNumbers] = useState(new Map());
  const [hotelTotalRooms, setHotelTotalRooms] = useState(0);
  const [hotelTotalBookedRooms, setHotelTotalBookedRooms] = useState(0);
  const [coverPhotoLink, setCoverPhotoLink] = useState(undefined);

  // Add room card
    const [roomTypeToAdd, setRoomTypeToAdd] = useState();
    const [roomPriceToAdd, setRoomPriceToAdd] = useState();
    const [roomNumberToAdd, setRoomNumberToAdd] = useState();

  // Dates
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()

  // Rating
  const [rating, setRating] = useState()
  const [ratingNumerical, setRatingNumerical] = useState()

  // Errors
  const [hasErrorDateRange, setHasErrorDateRange] = useState(new Map())
  const [hasErrorBooking, setHasErrorBooking] = useState(new Map())
  const [hasErrorFindingCustomer, setHasErrorFindingCustomer] = useState(false)
  const [hasErrorAddingRoom, setHasErrorAddingRoom] = useState(false)

  // isOwner
  const [isOwner, setIsOwner] = useState(false)

  // customer rating info
  const [customerDate, setCustomerDate] = useState()
  const [roomNumber, setRoomNumber] = useState()

  // booked room id
  const [bookedRoomId, setBookedRoomId] = useState(new Map())

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
    getHotelTotalRooms().then((hotelTotalRooms) => {
      setHotelTotalRooms(hotelTotalRooms);
    });
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getHotelTotalBookings().then((hotelTotalBookings) => {
        setHotelTotalBookedRooms(hotelTotalBookings);
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

  async function getHotelTotalRooms() {
    const getHotelTotalRoomsAsync = async (hotelContractAddress) => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const a = new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer)
            try {
                const hotelTotalRooms = await a.getTotalRooms()
                return hotelTotalRooms;
            } catch (err) {
                console.log("Error:    ", err)
            }
        }
    }
    return await getHotelTotalRoomsAsync(contractAddress);
  }

  async function getHotelTotalBookings() {
    const getHotelTotalBookingsAsync = async (hotelContractAddress) => {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const a = new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer)
            try {
                const hotelTotalBookings = await a.getTotalBookings()
                return hotelTotalBookings;
            } catch (err) {
                console.log("Error:    ", err)
            }
        }
    }
    return await getHotelTotalBookingsAsync(contractAddress);
  }

  async function getRoomsTypes() {
    const getRoomsTypesAsync = async (hotelContractAddress) => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const a = new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer)
        try {
          const roomsTypes = await a.getRoomsTypes()
          return roomsTypes;
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
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const a = new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer)
        try {
          const roomPrice = await a.getRoomPriceByType(roomType)
          return roomPrice;
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
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const a = new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer)
        try {
          const numberOfRooms = await a.getNumberOfRoomsByType(roomType)
          return numberOfRooms;
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
    
    return await getHotelNameAsync(contractAddress);
  }

  async function getCoverPhotoLink() {
    const getCoverPhotoLinkAsync = async (hotelContractAddress) => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const a = new ethers.Contract(hotelContractAddress, HotelBooking.abi, signer)
        try {
          const coverPhotoLink = await a.getCoverPhotoLink()
          return coverPhotoLink;
        } catch (err) {
          console.log("Error:    ", err)
        }
      }
    }
    
    return await getCoverPhotoLinkAsync(contractAddress);
  }

  async function makeBooking(roomType, roomPrice) {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, HotelBooking.abi, signer)
      try {
        const transaction = await contract.makeBooking(startDate.getTime(), endDate.getTime(), roomType, { value: ethers.utils.parseEther(roomPrice) })
        const roomId = await transaction.wait()
        return roomId.events[0].args.roomId;
      } catch (err) {
        console.log("Error:    ", err)
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

  async function rateCustomer() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const a = new ethers.Contract(contractAddress, HotelBooking.abi, signer)
      const rating = new ethers.Contract(contractsInfo.reps[0].reputationContractAddress, Reputation.abi, signer)
      try {
        const customerAddress = await a.getCustomerAdressByDate(customerDate.getTime(), roomNumber)
        if(customerAddress !== "0x0000000000000000000000000000000000000000"){
          const rate = await rating.submitRating(customerAddress, ratingNumerical)
          await rate.wait()
        }
        else {
          setHasErrorFindingCustomer(true);
        }
      } catch (err) {
        console.log("Error:    ", err)
      }
    }    
  }

  async function addRoom() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const a = new ethers.Contract(contractAddress, HotelBooking.abi, signer)
      try {
        if(isOwner){
          const addRoom = await a.addRoom(roomTypeToAdd, roomPriceToAdd, roomNumberToAdd);
          await addRoom.wait()
        }
        else {
            setHasErrorAddingRoom(true);
        }
      } catch (err) {
        console.log("Error:    ", err)
      }
    }    
  }

  async function checkIsOwner() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const a = new ethers.Contract(contractAddress, HotelBooking.abi, signer)
      try {
        const isOwner = await a.isOwner()
        return isOwner;
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

  function changeCustomerDate(x) {
    setHasErrorFindingCustomer(false);
    setCustomerDate(new Date(x.target.value));
  }

  function changeRoomNumber(x) {
    setHasErrorFindingCustomer(false);
    setRoomNumber(x.target.value);
  }

  function changeRoomTypeToAdd(x) {
    setHasErrorAddingRoom(false);
    setRoomTypeToAdd(x.target.value);
  }

  function changeRoomNumberToAdd(x) {
    setHasErrorAddingRoom(x.target.value < 0);
    setRoomNumberToAdd(x.target.value);
  }

  function changeRoomPriceToAdd(x) {
    setHasErrorAddingRoom(x.target.value < 0);
    setRoomPriceToAdd(x.target.value);
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
    {isOwner &&
    (<div>
      <div class="header">
        {coverPhotoLink && <img class="hotel-img" src={coverPhotoLink} alt=""></img>}
        {hotelName && <div class="hotel-name">{`${hotelName}`}</div>}
      </div>

      <div class="hotel-info-and-stats">
        <div class="hotel-details-card">
            <h1>Hotel Info And Stats</h1>
            <p>
                <span class="hotel-details-title">Total number of rooms: </span>
                {hotelTotalRooms && <span class="hotel-details">{`${hotelTotalRooms}`}</span>}
            </p>

            <p>
                <span class="hotel-details-title">Total number of bookings: </span>
                {hotelTotalBookedRooms && <span class="hotel-details">{`${hotelTotalBookedRooms}`}</span>}
            </p>
            
            <p>
                <span class="hotel-details-title">Room types: </span>
                {hotelTotalBookedRooms && <span class="hotel-details">{`${hotelRoomsTypes.join(',  ')}`}</span>}
            </p>
        </div>
      </div>

      <div class="update-hotel">
        <div class="update-card">
            <h2>Add Room</h2>
            <div>
                <input type="text" placeholder='Room type' onChange={changeRoomTypeToAdd}></input>
            </div>
            <div>
                <input type="text" inputmode="numeric" style={{marginTop: '16px'}} placeholder='Number of rooms to add' onChange={changeRoomNumberToAdd}></input>
            </div>
            <div>
                <input type="text" inputmode="numeric" style={{marginTop: '16px'}} placeholder='Room Price' onChange={changeRoomPriceToAdd}></input>
            </div>
            <div>
                {hasErrorAddingRoom && <p class="error">Please enter a valid room type and number of rooms.</p>}
            </div>
            <div>
                <button class="submit-button" onClick={addRoom}>Submit Feedback</button>
            </div>
        </div>
      </div>

        <div class="rating">
          <div class="card-wrapper">
          <div class="card-details">
            <h3 class="card-title">Please help us rating customers to keep fit community!</h3>
            <p>Select the date the customer was in the hotel, and the room number he stayed in:</p>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"></link>
            <input type="date" onChange={changeCustomerDate}></input>
            <input type="text" inputmode="numeric" class="room-number-input" placeholder='Enter room number' onChange={changeRoomNumber}></input>
            <div class="rating-customer-stars">
              {getRatingComponent()}
            </div>
          </div>
          
          {hasErrorFindingCustomer && <p class="error">{'There is no customer in this date and room number. Please select another date or room number.'}</p>}
          
          <div class="reveal-details">
            <button class="submit-feedback-button" onClick={rateCustomer}>Submit Feedback</button>
          </div>
        </div>
        </div>

    </div>)}

    </>
  );
}

export default HotelAdminPage;