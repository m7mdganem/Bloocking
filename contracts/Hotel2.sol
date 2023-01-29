//SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;


import "hardhat/console.sol";

contract HotelBooking {
    address payable public owner;
    uint public totalRooms;
    uint public bookedRooms;
    string public hotelName;

    enum RoomType {
        Regular,
        Luxury
    }

    struct Room {
        uint Id;
        RoomType roomType;
        uint price;
    }

    struct Booking {
        address guest;
        uint checkIn;
        uint checkOut;
    }

    mapping(uint => Room) roomsMapping;
    mapping(address => Booking[]) guestsToBookings;
    mapping(uint => Booking[]) bookings;
    mapping(address => bool) customers;
    Room[] rooms;

    // Event to be emitted when a booking is made
    event BookingMade(uint roomId);

    // Event to be emitted when a feedback is given
    event FeedbackGiven(address guest, uint bookingId, uint rating, string feedback);

    // Event to be emitted when a feedback is given by the owner
    event OwnerFeedbackGiven(address guest, uint bookingId, string feedback);

    constructor(uint numberOfRegularRooms, uint numberOfLuxuryRooms, string memory _hotelName) {
        owner = payable(msg.sender);
        hotelName = _hotelName;

        uint index = 1;
        for (uint i = 0; i < numberOfRegularRooms; i++) {
            Room memory room = Room(index, RoomType.Regular, 1 ether);
            rooms.push(room);
            roomsMapping[index] = room;
            index++;
        }

        for (uint i = 0; i < numberOfLuxuryRooms; i++) {
            Room memory room = Room(index, RoomType.Luxury, 2 ether);
            rooms.push(room);
            roomsMapping[index] = room;
            index++;
        }

        totalRooms = numberOfRegularRooms + numberOfLuxuryRooms;
        bookedRooms = 0;
    }

    function checkAvailability(uint checkIn, uint checkOut, RoomType roomType) public view returns (uint) {
        require(checkIn < checkOut);
        

        for (uint i = 0; i < rooms.length; i++) {
            if (rooms[i].roomType == roomType) {
                bool isOverlapping = false;
                Booking[] memory roomBookings = bookings[rooms[i].Id];
                for (uint j = 0; j < roomBookings.length; j++) {
                    if ((checkIn >= roomBookings[j].checkIn && checkIn <= roomBookings[j].checkOut) ||
                        (checkOut >= roomBookings[j].checkIn && checkOut <= roomBookings[j].checkOut)) {
                            isOverlapping = true;
                        }
                }
                if (!isOverlapping) {
                    return rooms[i].Id;
                }
            }
        }
        return 0;
    }

    function makeBooking(uint checkIn, uint checkOut, RoomType roomType) public payable {
        uint roomId = checkAvailability(checkIn, checkOut, roomType);

        require(roomId != 0, "Rooms are not available for the specified dates.");
        require(msg.value == roomsMapping[roomId].price, "Incorrect payment amount.");

        owner.transfer(msg.value);
        bookedRooms++;
        guestsToBookings[msg.sender].push(Booking(msg.sender, checkIn, checkOut));
        bookings[roomId].push(Booking(msg.sender, checkIn, checkOut));
        customers[msg.sender] = true;
        emit BookingMade(roomId);
    }

    function getCustomerAdressByDate(uint date, uint room_id) public view returns (address) {
        require(msg.sender == owner,"Only hotel owner can access the getCustomerAdressByDate function");

        Booking[] memory mybook = bookings[room_id];

        for(uint i = 0; i < mybook.length; i++){
            if(mybook[i].checkIn < date && date < mybook[i].checkOut ){
                return mybook[i].guest;
            }
        }

        return address(0);
    }
     
    function isCustomer() public view returns(bool) {
        if(customers[msg.sender] == true){
            return true;
        }

        return false;
    }

    function isOwner() public view returns(bool) {
        if(msg.sender == owner){
            return true;
        }

        return false;
    }

    fallback() external payable { }

    receive() external payable { }

    // Function to cancel a booking
    // function cancelBooking(uint bookingId) public {
    //     require(msg.sender == guestsToBookings[msg.sender].guest, "You are not authorized to cancel this booking.");
    //     delete guestsToBookings[msg.sender];
    //     bookedRooms--;
    // }
}