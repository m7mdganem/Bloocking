import './HotelPage.css';
import { ethers } from 'ethers';
import { requestAccount } from '../Shared/webEtherum';
import { useState, useEffect } from 'react';
import HotelBooking from '../HotelBooking.json';
import Reputation from '../Reputation.json';
import Contracts from '../Shared/contracts.json';
import contractsInfo from '../contractsInfo.json';

function Hotel({ key, name, contractAddress, address, numberOfRegularRooms, numberOfLuxuryRooms, coverPhotoLink }) {
  // Dates
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()

  // Rating
  const [rating, setRating] = useState()
  const [ratingNumerical, setRatingNumerical] = useState()

  // Errors
  const [hasErrorRegular, setHasErrorRegular] = useState()
  const [hasErrorLuxury, setHasErrorLuxury] = useState()
  const [hasErrorBookingRegular, setHasErrorBookingRegular] = useState(false)
  const [hasErrorBookingLuxury, setHasErrorBookingLuxury] = useState(false)
  const [hasErrorFindingCustomer, setHasErrorFindingCustomer] = useState(false)

  // isOwner
  const [isOwner, setIsOwner] = useState(false)

  // customer rating info
  const [customerDate, setCustomerDate] = useState()
  const [roomNumber, setRoomNumber] = useState()

  // Regular room id
  const [regularRoomId, setRegularRoomId] = useState(undefined)

  // Luxury room id
  const [luxuryRoomId, setLuxuryRoomId] = useState(undefined)

  useEffect(() => {
    checkIsOwner().then((isOwner) => {
      setIsOwner(isOwner);
    });
  // eslint-disable-next-line
  }, []);

  async function makeBooking(roomType, roomPrice) {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, HotelBooking.abi, signer)
      try {
        const transaction = await contract.makeBooking(startDate.getTime(), endDate.getTime(), roomType, { value: ethers.utils.parseEther(roomPrice.toString()) })
        const roomId = await transaction.wait()
        return roomId.events[0].args.roomId;
      } catch (err) {
        console.log("Error:    ", err)
        if (roomType === Contracts.RoomType.Regular) {
          setHasErrorBookingRegular(true);
        } else {
          setHasErrorBookingLuxury(true);
        }
      }
    }
  }

  async function rateHotel() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const a = new ethers.Contract(contractAddress, HotelBooking.abi, signer)
      const rating = new ethers.Contract(contractsInfo.reps[0].reputationContractAddress, Reputation.abi, signer)
      try {
        const isCustomer = await a.isCustomer()
        if(isCustomer){
          const rate = await rating.submitRating(contractAddress, ratingNumerical)
          await rate.wait()
        }
        else {
          alert("You can't rate a hotel if you haven't booked a room in it!")
        }
      } catch (err) {
        console.log("Error:    ", err)
      }
    }    
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
  
  async function makeRegularBooking() {
    setRegularRoomId(undefined);
    setHasErrorBookingRegular(false);
    if (startDate.getTime() >= endDate.getTime()) {
      setHasErrorRegular(true);
      return;
    }

    const roomId = await makeBooking(Contracts.RoomType.Regular, Contracts.RoomPrice.Regular);
    setRegularRoomId(roomId);
  }

  async function makeLuxuryBooking() {
    setLuxuryRoomId(undefined);
    setHasErrorBookingLuxury(false);
    if (startDate.getTime() >= endDate.getTime()) {
      setHasErrorLuxury(true);
      return;
    }

    const roomId = await makeBooking(Contracts.RoomType.Luxury, Contracts.RoomPrice.Luxury);
    setLuxuryRoomId(roomId);
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
    setHasErrorRegular(false);
    setHasErrorLuxury(false);
    setHasErrorBookingRegular(false);
    setHasErrorBookingLuxury(false);
    setStartDate(new Date(x.target.value));
  }

  function changeEndDate(x) {
    setHasErrorRegular(false);
    setHasErrorLuxury(false);
    setHasErrorBookingRegular(false);
    setHasErrorBookingLuxury(false);
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

  function setRatingInternal(x) {
    const newRating = [0, 0, 0, 0, 0];
    for (let i = 0; i < x; i++) {
      newRating[i] = 1;
    }
    setRating(newRating);
    setRatingNumerical(x);
  }

  function setRating1() {
    setRatingInternal(1);
  }

  function setRating2() {
    setRatingInternal(2);
  }

  function setRating3() {
    setRatingInternal(3);
  }

  function setRating4() {
    setRatingInternal(4);
  }

  function setRating5() {
    setRatingInternal(5);
  }

  function getRatingComponent() {
    if (rating !== undefined) {
      return (
        <div>
          {rating[0] === 1 ? <span class="fa fa-star checked star" onClick={setRating1}></span> : <span class="fa fa-star star" onClick={setRating1}></span>}
          {rating[1] === 1 ? <span class="fa fa-star checked star" onClick={setRating2}></span> : <span class="fa fa-star star" onClick={setRating2}></span>}
          {rating[2] === 1 ? <span class="fa fa-star checked star" onClick={setRating3}></span> : <span class="fa fa-star star" onClick={setRating3}></span>}
          {rating[3] === 1 ? <span class="fa fa-star checked star" onClick={setRating4}></span> : <span class="fa fa-star star" onClick={setRating4}></span>}
          {rating[4] === 1 ? <span class="fa fa-star checked star" onClick={setRating5}></span> : <span class="fa fa-star star" onClick={setRating5}></span>}
        </div>
      )
    }
    else {
      return (
        <div>
          <span class="fa fa-star star" onClick={setRating1}></span>
          <span class="fa fa-star star" onClick={setRating2}></span>
          <span class="fa fa-star star" onClick={setRating3}></span>
          <span class="fa fa-star star" onClick={setRating4}></span>
          <span class="fa fa-star star" onClick={setRating5}></span>
        </div>
      )
    }
  }

  return (
    <div>
      <div class="header">
        <img class="hotel-img" src={coverPhotoLink} alt=""></img>
        <div class="hotel-name">{`${name}`}</div>
      </div>

        <div class="rooms">

            <div class="rooms-card">
                <h2>Regular Rooms</h2>
                <p>Number of rooms: {`${numberOfRegularRooms}`}</p>
                <p>{`Price: ${Contracts.RoomPrice.Regular} ETH`}</p>
                <div class="booking-button">
                  <div class="date-picker">
                    <span class="date-title1">From: </span>
                    <input type="date" id="start" name="booking-start" min={getCurrentDate()} onChange={changeStartDate}></input>
                  </div>
                  <div class="date-picker">
                    <span class="date-title2">To: </span>
                    <input type="date" id="end" name="booking-end" min={getCurrentDate()} onChange={changeEndDate}></input>
                  </div>
                  <button class="book-now-button" onClick={makeRegularBooking}>Book Now</button>
                  {hasErrorRegular && <p class="error">Please select a valid date range</p>}
                  {hasErrorBookingRegular && <p class="error">{'There are no available rooms in this date. Please select another date or try booking a luxury room.'}</p>}
                  {regularRoomId && <p class="room-booked">{`You booked room number ${regularRoomId} Successfully`}</p>}
                </div>
            </div>

            <div class="rooms-card">
                <h2>Luxury Rooms</h2>
                <p>Number of rooms: {`${numberOfLuxuryRooms}`}</p>
                <p>{`Price: ${Contracts.RoomPrice.Luxury} ETH`}</p>
                <div class="booking-button">
                  <div class="date-picker">
                    <span class="date-title1">From: </span>
                    <input type="date" id="start" name="booking-start" min={getCurrentDate()} onChange={changeStartDate}></input>
                  </div>
                  <div class="date-picker">
                    <span class="date-title2">To: </span>
                    <input type="date" id="end" name="booking-end" min={getCurrentDate()} onChange={changeEndDate}></input>
                  </div>
                  <button class="book-now-button" onClick={makeLuxuryBooking}>Book Now</button>
                  {hasErrorLuxury && <p class="error">Please select a valid date range</p>}
                  {hasErrorBookingLuxury && <p class="error">{'There are no available rooms in this date. Please select another date or try booking a regular room.'}</p>}
                  {luxuryRoomId && <p class="room-booked">{`You booked room number ${luxuryRoomId} Successfully`}</p>}
                </div>
            </div>
        </div>

        {!isOwner &&
        (<div class="rating">
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
        </div>)}

        {isOwner && 
        (<div class="rating">
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
        </div>)}

    </div>
  );
}

export default Hotel;