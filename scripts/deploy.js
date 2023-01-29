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
    const numberOfRegularRooms = HotelsInfo.hotels[i-1].numberOfRegularRooms
    const numberOfLuxuryRooms = HotelsInfo.hotels[i-1].numberOfLuxuryRooms
    const hotel = await Hotel.deploy(numberOfRegularRooms, numberOfLuxuryRooms, hotelName);
    await hotel.deployed();
    json.hotels.push({
      key: i,
      name: hotelName,
      contractAddress: hotel.address,
      address: HotelsInfo.hotels[i-1].address,
      numberOfRegularRooms: numberOfRegularRooms,
      numberOfLuxuryRooms: numberOfLuxuryRooms,
      coverPhotoLink: HotelsInfo.hotels[i-1].coverPhotoLink
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
