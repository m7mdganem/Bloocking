const hre = require("hardhat");
var fs = require('fs');
const  HotelsInfo = require('../react-dapp/src/HotelsInfo/HotelsInfo.json');

async function main() {
  var json = {
    hotels: [],
    reps: []
  }

  const Hotel = await ethers.getContractFactory("HotelBooking");
  for (let i = 1; i <= HotelsInfo.hotels.length; i++) {
    
    const hotelName = HotelsInfo.hotels[i-1].name
    const hotelAddress = HotelsInfo.hotels[i-1].address
    const hotelCoverPhotoLink = HotelsInfo.hotels[i-1].coverPhotoLink
    const roomsTypes = HotelsInfo.hotels[i-1].rooms.map((room) => room.type)
    const roomsPrices = HotelsInfo.hotels[i-1].rooms.map((room) => room.price)
    const roomsNumbers = HotelsInfo.hotels[i-1].rooms.reduce((acc, room) => { acc.push(room.From); acc.push(room.To); return acc; }, []);

    numberOfRooms = 0;
    for (let j = 0; j < roomsNumbers.length; j += 2) {
      numberOfRooms += roomsNumbers[j + 1] - roomsNumbers[j] + 1;
    }

    const hotel = await Hotel.deploy(hotelName, hotelAddress, hotelCoverPhotoLink, roomsTypes, roomsPrices, roomsNumbers);
    await hotel.deployed();
    json.hotels.push({
      contractAddress: hotel.address
    })
    console.log(`hotel address deployed to ${hotel.address}`);
  }

  const Rep = await ethers.getContractFactory("Reputation");
  const rep = await Rep.deploy();
  await rep.deployed();
  json.reps.push({
    reputationContractAddress: rep.address
  })


  console.log(`repution address deployed to ${rep.address}`);

  fs.writeFile('react-dapp/src/contractsInfo.json', JSON.stringify(json), function(err) {
    if (err) throw err;
    console.log('complete');
    }
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
