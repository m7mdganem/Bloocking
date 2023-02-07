import { getSignerHotelContract, getSignerReputationContract } from '../Shared/webEtherum';
import { useState, useEffect } from 'react';
import { useNavigate} from "react-router-dom";

import './HotelAdminPage.css';
import { ethers } from 'ethers';

function HotelAdminPage({ contractAddress }) {
  let navigate = useNavigate({});

  // Hotel info
  const [hotelName, setHotelName] = useState(undefined);
  const [hotelRoomsTypes, setHotelRoomsTypes] = useState([]);
  const [hotelRoomsPrices, setHotelRoomsPrices] = useState(new Map());
  const [hotelRoomsNumbers, setHotelRoomsNumbers] = useState(new Map());
  const [hotelTotalRooms, setHotelTotalRooms] = useState(0);
  const [hotelTotalBookedRooms, setHotelTotalBookedRooms] = useState(0);
  const [coverPhotoLink, setCoverPhotoLink] = useState(undefined);
  const [hotelBalance, setHotelBalance] = useState('0');
  const [amountToTransfer, setAmountToTransfer] = useState('0');

  window.ethereum.on('accountsChanged', function (_accounts) {
    checkIsOwner().then((isOwner2) => {
      if (isOwner !== isOwner2) {
        setIsOwner(isOwner);
        navigate(`/hotels/${contractAddress}`);
      }
    });
  });

  // Add room card
    const [roomTypeToAdd, setRoomTypeToAdd] = useState();
    const [roomPriceToAdd, setRoomPriceToAdd] = useState();
    const [roomNumberToAdd, setRoomNumberToAdd] = useState();
  
  // Update price card
    const [roomTypeToUpdatePrice, setRoomTypeToUpdatePrice] = useState();
    const [roomPriceToUpdate, setRoomPriceToUpdate] = useState();

  // Rating
  const [rating, setRating] = useState()
  const [ratingNumerical, setRatingNumerical] = useState()

  // Errors
  const [hasErrorFindingCustomer, setHasErrorFindingCustomer] = useState(false)
  const [hasErrorAddingRoom, setHasErrorAddingRoom] = useState(false)
  const [hasErrorUpdatingPrice, setHasErrorUpdatingPrice] = useState(false)
  const [hasErrorTransfering, setHasErrorTransfering] = useState(false)

  // isOwner
  const [isOwner, setIsOwner] = useState(false)

  // customer rating info
  const [customerDate, setCustomerDate] = useState()
  const [roomNumber, setRoomNumber] = useState()

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
    getBalance().then((balance) => {
      setAmountToTransfer(ethers.utils.formatEther(balance) / 2);
      setHotelBalance(ethers.utils.formatEther(balance));
    });
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    getRoomsTypes().then((roomsTypes) => {
      setHotelRoomsTypes(roomsTypes);
      setRoomTypeToUpdatePrice(roomsTypes[0]);
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
            const hotelContract = await getSignerHotelContract(hotelContractAddress);
            try {
                return await hotelContract.getTotalRooms()
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
            const hotelContract = await getSignerHotelContract(hotelContractAddress);
            try {
                return await hotelContract.getTotalBookings();
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
          return await hotelContract.getRoomPriceByType(roomType)
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
          console.log("Error:    ", err)
        }
      }
    }
    return await getCoverPhotoLinkAsync(contractAddress);
  }

  async function getBalance() {
    const getBalanceAsync = async (hotelContractAddress) => {
      if (typeof window.ethereum !== 'undefined') {
        const hotelContract = await getSignerHotelContract(hotelContractAddress);
        try {
          return await hotelContract.getBalance();
        } catch (err) {
          console.log("Error:    ", err)
        }
      }
    }
    return await getBalanceAsync(contractAddress);
  }

  async function rateCustomer() {
    if (typeof window.ethereum !== 'undefined') {
      const hotelContract = await getSignerHotelContract(contractAddress);
      const reputationContract = await getSignerReputationContract();
      try {
        const customerAddress = await hotelContract.getCustomerAdressByDate(customerDate.getTime(), roomNumber)
        if(customerAddress !== "0x0000000000000000000000000000000000000000"){
          const rate = await reputationContract.submitRating(customerAddress, ratingNumerical)
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
        const hotelContract = await getSignerHotelContract(contractAddress);
        try {
          if(isOwner) {
            const addRoom = await hotelContract.addRoom(roomTypeToAdd, roomPriceToAdd, roomNumberToAdd);
            await addRoom.wait();

            const newPrices = new Map(hotelRoomsPrices);
            newPrices.set(roomTypeToAdd, roomPriceToAdd);
            setHotelRoomsPrices(newPrices);

            const newHotelTotalRooms = parseInt(hotelTotalRooms) + parseInt(roomNumberToAdd);
            setHotelTotalRooms(newHotelTotalRooms);

            const newNumberOfRooms = new Map(hotelRoomsNumbers);
            newNumberOfRooms.set(roomTypeToAdd, parseInt(newNumberOfRooms.get(roomTypeToAdd)  ?? 0) + parseInt(roomNumberToAdd));
            setHotelRoomsNumbers(newNumberOfRooms);

            if(!hotelRoomsTypes.includes(roomTypeToAdd)) {
              const newRoomsTypes = [...hotelRoomsTypes];
              newRoomsTypes.push(roomTypeToAdd);
              setHotelRoomsTypes(newRoomsTypes);
            }
          }
          else {
            setHasErrorAddingRoom(true);
          }
        } catch (err) {
          console.log("Error:    ", err);
        }
    }    
  }

  async function updateRoomPrice() {
    if (typeof window.ethereum !== 'undefined') {
        const hotelContract = await getSignerHotelContract(contractAddress);
        try {
          if(isOwner) {
            const updateRoomPrice = await hotelContract.updateRoomPrice(roomTypeToUpdatePrice, roomPriceToUpdate);
            await updateRoomPrice.wait();

            const newPrices = new Map(hotelRoomsPrices);
            newPrices.set(roomTypeToUpdatePrice, roomPriceToUpdate);
            setHotelRoomsPrices(newPrices);
          }
          else {
            setHasErrorUpdatingPrice(true);
          }
        } catch (err) {
          console.log("Error:    ", err);
        }
    }    
  }

  async function trnsferAmountToOwner() {
    if (amountToTransfer > hotelBalance / 2) {
      alert("You can't transfer more than 50% of your balance");
      return;
    }

    if (typeof window.ethereum !== 'undefined') {
        const hotelContract = await getSignerHotelContract(contractAddress);
        try {
          if(isOwner) {
            const transferToOwner = await hotelContract.transferToOwner(ethers.utils.parseEther(amountToTransfer));
            await transferToOwner.wait();

            setHotelBalance(hotelBalance - amountToTransfer)
          }
          else {
            setHasErrorTransfering(true);
          }
        } catch (err) {
          setHasErrorTransfering(true);
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

  function changeRoomTypeToUpdatePrice(x) {
    setHasErrorUpdatingPrice(false);
    setRoomTypeToUpdatePrice(x.target.value);
  }

  function changeRoomPriceToUpdatePrice(x) {
    setHasErrorUpdatingPrice(x.target.value < 0);
    setRoomPriceToUpdate(x.target.value);
  }

  function changeAmountToTransfer(x) {
    setHasErrorTransfering(x.target.value < 0);
    setAmountToTransfer(x.target.value);
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
                <span class="hotel-details-title">Current Balance: </span>
                <span class="hotel-details">{`${hotelBalance}`}</span>
                <span style={{color: 'green', paddingLeft: '8px'}}>ETHER</span>
            </p>
            
            <p>
                <span class="hotel-details-title">Room types: </span>
                {hotelTotalBookedRooms && <span class="hotel-details">{`${hotelRoomsTypes.join(',  ')}`}</span>}
            </p>
        </div>

        {hotelRoomsTypes && (hotelRoomsTypes.length > 0) && hotelRoomsNumbers.size > 0 && hotelRoomsPrices.size > 0 && 
        (<div class="hotel-details-card">
          <h1>Rooms Details</h1>
          <table>
            <tr>
              <th>Room Type</th>
              <th clas="number-of-rooms-col">Number Of Rooms</th>
              <th>Room Price</th>
            </tr>
              {hotelRoomsTypes && (hotelRoomsTypes.length > 0) && hotelRoomsTypes.map((roomType) => {
                    return (hotelRoomsNumbers.get(roomType) && hotelRoomsPrices.get(roomType)) ? (<tr>
                      <td>{roomType}</td>
                      <td>{`${hotelRoomsNumbers.get(roomType)}`}</td>
                      <td>{`${hotelRoomsPrices.get(roomType)}`}</td>
                    </tr>): ''})}
          </table> 
        </div>)}
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
                <button class="submit-button" onClick={addRoom}>Submit</button>
            </div>
        </div>

        <div class="update-card">
            <h2>Update Room Price</h2>
            {hotelRoomsTypes &&
            (<select class="rooms-types-selector" onChange={changeRoomTypeToUpdatePrice}>
                {hotelRoomsTypes.map((roomType) => <option value={roomType}>{`${roomType}`}</option>)}
              </select>)}
            <div>
                <input type="text" inputmode="numeric" style={{marginTop: '16px'}} placeholder={`Current room Price: ${hotelRoomsPrices.get(roomTypeToUpdatePrice)}`} onChange={changeRoomPriceToUpdatePrice}></input>
            </div>
            <div>
                {hasErrorUpdatingPrice && <p class="error">Please enter a valid room type and price.</p>}
            </div>
            <div>
                <button class="submit-button" onClick={updateRoomPrice}>Submit</button>
            </div>
        </div>

        <div class="update-card">
            <h2>Transfer Money To Owner Account</h2>
            <div>
                <input type="text" inputmode="numeric" style={{marginTop: '16px'}} placeholder={`Enter amount to transfer: ${amountToTransfer}`} onChange={changeAmountToTransfer}></input>
            </div>
            <div>
                {hasErrorTransfering && <p class="error">Can not transfer money.</p>}
            </div>
            <div>
                <button class="submit-button" onClick={trnsferAmountToOwner}>Transfer</button>
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