//SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import "hardhat/console.sol";

contract Reputation {
    mapping(address => rating) public ratings;
   // mapping(address => mapping(address => string)) public reviews;

    struct rating {
        uint score;
        uint numRatings;
    }

    function submitRating(address user, uint score) public {
        require(score > 0 && score <= 5, "Invalid score submitted. Score must be between 1 and 5.");
        ratings[user].score += score;
        ratings[user].numRatings++;
    }

    // function submitReview(address user, string memory review) public {
    //     require(reviews[msg.sender][user] == "", "You have already submitted a review for this user.");
    //     reviews[msg.sender][user] = review;
    // }

    function getRating(address user) public view returns (uint256[2] memory) {
        console.log("Getting rating for user: ", user);
        
        if (ratings[user].numRatings == 0) {
            return [uint256(0), uint256(0)];
        }
        return [ratings[user].score, ratings[user].numRatings];
    }

    // function getReview(address user, address reviewer) public view returns (string memory) {
    //     return reviews[reviewer][user];
    // }

     fallback() external payable {
    }

    receive() external payable {
    }

}