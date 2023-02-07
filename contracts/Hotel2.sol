//SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;


import "hardhat/console.sol";

contract HotelBooking {
    address payable public owner;
    string public hotelName;
    string public hotelAddress;
    string public coverPhotoLink;
    uint public totalRooms = 0;
    uint public totalBookings = 0;

    struct Room {
        uint Id;
        string roomType;
    }

    enum BookingStatus {
        valid,
        cancelled
    }

    struct Booking {
        uint bookingId;
        address guest;
        uint roomId;
        uint checkIn;
        uint checkOut;
        uint paiedPrice;
        BookingStatus status;
    }

    mapping(uint => Room) roomsMapping;
    mapping(address => Booking[]) guestsToBookings;
    mapping(uint => Booking[]) bookings;
    mapping(address => bool) customers;
    mapping(string => uint) roomTypeToPrice;
    mapping(string => uint) roomTypeToNumberOfRooms;
    Room[] rooms;
    string[] roomsTypes;
    uint rooms_index = 1;

    // Event to be emitted when a booking is made
    event BookingMade(uint roomId);

    constructor(string memory _hotelName, string memory _hotelAddress, string memory _coverPhotoLink, string[] memory _roomsTypes, uint[] memory _roomsPrices, uint[] memory _roomsNumbers) {
        owner = payable(msg.sender);
        hotelName = _hotelName;
        hotelAddress = _hotelAddress;
        coverPhotoLink = _coverPhotoLink;
        totalRooms = 0;

        for (uint i = 0; i < _roomsTypes.length; i++) {
            string memory roomType = _roomsTypes[i];
            roomsTypes.push(roomType);
            roomTypeToNumberOfRooms[roomType] = 0;
            uint roomPrice = _roomsPrices[i];
            uint roomsNumbersStart = _roomsNumbers[i * 2];
            uint roomsNumbersEnd = _roomsNumbers[i * 2 + 1];
            roomTypeToPrice[roomType] = roomPrice * (1 ether);
            for (uint j = roomsNumbersStart; j <= roomsNumbersEnd; j++) {
                rooms.push(Room(j, roomType));
                roomsMapping[j] = Room(j, roomType);
                totalRooms++;
                roomTypeToNumberOfRooms[roomType] = roomTypeToNumberOfRooms[roomType] + 1;
            }
        }
    }

    function checkAvailability(uint checkIn, uint checkOut, string memory roomType) public view returns (uint) {
        require(checkIn < checkOut);
        for (uint i = 0; i < rooms.length; i++) {
            if (isEqualStrings(rooms[i].roomType, roomType)) {
                bool isOverlapping = false;
                Booking[] memory roomBookings = bookings[rooms[i].Id];
                for (uint j = 0; j < roomBookings.length; j++) {
                    if (((checkIn >= roomBookings[j].checkIn && checkIn <= roomBookings[j].checkOut) ||
                        (checkOut >= roomBookings[j].checkIn && checkOut <= roomBookings[j].checkOut)) &&
                        roomBookings[j].status == BookingStatus.valid) {
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

    function makeBooking(uint checkIn, uint checkOut, string memory roomType) public payable {
        uint roomId = checkAvailability(checkIn, checkOut, roomType);

        require(roomId != 0, "Rooms are not available for the specified dates.");
        require(msg.value == roomTypeToPrice[roomType], "Incorrect payment amount.");

        guestsToBookings[msg.sender].push(Booking(totalBookings, msg.sender, roomId, checkIn, checkOut, msg.value, BookingStatus.valid));
        bookings[roomId].push(Booking(totalBookings, msg.sender, roomId, checkIn, checkOut, msg.value, BookingStatus.valid));
        customers[msg.sender] = true;
        totalBookings++;

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

    function updateRoomPrice(string memory room_type, uint new_price) public {
        require(msg.sender == owner,"Only hotel owner can access the updateRoomPrice function");
        roomTypeToPrice[room_type] = new_price * (1 ether);
    }

    function addRoomTypeIfNotExists(string memory room_type) private {
        for (uint i = 0; i < roomsTypes.length; i++) {
            if (isEqualStrings(roomsTypes[i], room_type)) {
                return;
            }
        }
        roomsTypes.push(room_type);
    }

    function addRoom(string memory room_type, uint room_price, uint numberOfRoomsToAdd) public {
        require(msg.sender == owner,"Only hotel owner can access the addRoom function");
        addRoomTypeIfNotExists(room_type);
        for (uint i = 0; i < numberOfRoomsToAdd; i++) {
            rooms.push(Room(totalRooms, room_type));
            roomsMapping[totalRooms] = Room(totalRooms, room_type);
            roomTypeToNumberOfRooms[room_type] = roomTypeToNumberOfRooms[room_type] + 1;
            totalRooms++;
        }
        roomTypeToPrice[room_type] = room_price * (1 ether);
    }
     
    function isCustomer() public view returns(bool) {
        return customers[msg.sender];
    }

    function getRoomsTypes() public view returns(string[] memory) {
        return roomsTypes;
    }

    function getRoomPriceByType(string memory room_type) public view returns(uint) {
        return roomTypeToPrice[room_type] / (1 ether);
    }

    function getNumberOfRoomsByType(string memory room_type) public view returns(uint) {
        return roomTypeToNumberOfRooms[room_type];
    }

    function getTotalRooms() public view returns(uint) {
        return totalRooms;
    }

    function getTotalBookings() public view returns(uint) {
        return totalBookings;
    }

    function getHotelAddress() public view returns(string memory) {
        return hotelAddress;
    }

    function getHotelName() public view returns(string memory) {
        return hotelName;
    }

    function getCoverPhotoLink() public view returns(string memory) {
        return coverPhotoLink;
    }

    function isOwner() public view returns(bool) {
        return msg.sender == owner;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    function isEqualStrings(string memory a, string memory b) public pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    function getAllCostumersBookingsFromDate(uint dateOfRequest) public view returns(Booking[] memory) {
        require(customers[msg.sender], "Only customers can access their bookings.");
        Booking[] memory mybook = guestsToBookings[msg.sender];
        Booking[] memory mybook2 = new Booking[](mybook.length);
        uint counter = 0;
        for(uint i = 0; i < mybook.length; i++){
            if(mybook[i].checkIn > dateOfRequest && mybook[i].status == BookingStatus.valid){
                mybook2[counter] = mybook[i];
                counter++;
            }
        }
        return mybook2;
    }

    function cancelBooking(uint bookingId, uint ratingsSum, uint numOfRatings) public {
        require(customers[msg.sender], "Only customers can cancel their bookings.");
        uint roomId = 0;
        for(uint i = 0; i < guestsToBookings[msg.sender].length; i++){
            if(guestsToBookings[msg.sender][i].bookingId == bookingId && guestsToBookings[msg.sender][i].guest == msg.sender){
                roomId = guestsToBookings[msg.sender][i].roomId;
                guestsToBookings[msg.sender][i].status = BookingStatus.cancelled;
                break;
            }
        }
        
        for(uint i = 0; i < bookings[roomId].length; i++){
            if(bookings[roomId][i].bookingId == bookingId && bookings[roomId][i].guest == msg.sender){
                bookings[roomId][i].status = BookingStatus.cancelled;
                break;
            }
        }

        totalBookings--;
        
        // We return mony based on rate of customer
        uint roomPrice = roomTypeToPrice[roomsMapping[roomId].roomType];
        uint256 refund = roomPrice;
        if (numOfRatings != 0) {
            payable(msg.sender).transfer(refund * (ratingsSum / numOfRatings) / 5);
        }
        else {
            payable(msg.sender).transfer(refund);
        }
    }

    function transferToOwner(uint amount) public {
        require(msg.sender == owner, "Only owner can transfer money to owner.");
        payable(owner).transfer(amount);
    }

    fallback() external payable { }

    receive() external payable { }
}