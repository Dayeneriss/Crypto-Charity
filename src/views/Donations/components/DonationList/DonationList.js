import React, { useState, useEffect } from 'react';

import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import FundraiserContract from 'contracts/Fundraiser.json';

const cc = require('cryptocompare');

const DonationList = ({fundraiser}) => {
    const [ web3, setWeb3 ] = useState(null);
    const [ contract, setContract] = useState(null);
    const [ accounts, setAccounts ] = useState([]);
    const [ userDonations, setUserDonations ] = useState(null);
    const [ exchangeRate, setExchangeRate ] = useState(null);

    useEffect (() => {
  
        if (fundraiser) {
            init (fundraiser);
        }
    }, [fundraiser]);
  
    const init = async (fundraiser) => {
        try {
            const fund = fundraiser;
            const provider = await detectEthereumProvider();
            const web3 = new Web3(provider);
            const account = await web3.eth.getAccounts();
    
            console.log('accounts---', account);
    
            const instance = new web3.eth.Contract(
              FundraiserContract.abi,
              fund
            );
            setWeb3 (web3);
            setContract (instance);
            setAccounts (account);

          console.log('accounts---', account);
          const userDonations = instance.methods.myDonations().call({ from: accounts[0] });
          console.log(userDonations);
          setUserDonations(userDonations);

          await cc.price('ETH', ['USD'])
          .then( prices => { 
            exchangeRate = prices.USD; 
            setExchangeRate(prices.USD); 
          }).catch(console.error);

        } catch (error) {
            console.error(error);
        }
    }
    
    window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload()
    })

    var donations = userDonations
    if (donations === null) {return null}

    const totalDonations = donations.values.length
    let donationList = []
    var i
    for (i = 0; i < totalDonations; i++) {
      const ethAmount = web3.utils.fromWei(donations.values[i])
      const userDonation = exchangeRate * ethAmount
      const donationDate = donations.dates[i]
      donationList.push({ donationAmount: userDonation.toFixed(2), date: donationDate})
    }

    return donationList.map((donation) => {
      return (
        <div className="donation-list">
          <p>${donation.donationAmount}</p>
          <Button variant="contained" color="primary">
            <Link className="donation-receipt-link" 
              to = {{ pathname: '/receipts', state: { fund: fundName, donation: donation.donationAmount, date: donation.date } 
              }}
            >
              Request Receipt
            </Link>
          </Button>
        </div>
      )
    })
  }

  export default DonationList;
