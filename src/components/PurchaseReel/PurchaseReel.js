import React, { Component } from "react";
import Firebase from "../../firebase/firebase.js";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import DatePicker from "react-datepicker";
import { Recorder } from "react-voice-recorder";
import validator from 'validator'
import emailjs from '@emailjs/browser'
import Menu from "../../components/Menu/Menu.js"

import "./PurchaseReel.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-voice-recorder/dist/index.css";

class ConnectedPurchaseReel extends Component {
  constructor(props) {
    super(props);

    this.state = {
			selectedLevelOption: "",
			errorMsg: "",
			reelPurpose: "",
			reelDuration: "",
			reelSampleLink: "",
			igname: "",
			emailAddress: "",
			firstName: "",
			lastName: "",
			downloadURL: "",
      dueDateSelected: new Date(),
      audioIdToUse: "",

      audioDetails: {
        url: null,
        blob: null,
        chunks: null,
        duration: {
          h: null,
          m: null,
          s: null,
        },
      },

      levelOptions: [
        { name: "Regular Chicken Shawarma", id: 1 },
        { name: "Regular Beef Shawarma", id: 2 },
        { name: "Regular Combo (Chicken and Beef)", id: 3 },
        { name: "Regular Mega (Chicken, Beef, and Shrimp)", id: 4 },
        { name: "Double Sausage Chicken Shawarma", id: 5 },
        { name: "Double Sausage Beef Shawarma", id: 6},
        { name: "Double Sausage Mega (chicken, beef, and shrimp)", id: 7},
        { name: "Extra Chicken Shawarma", id: 8},
        { name: "Extra Beef Shawarma", id: 9},
        { name: "Extra Combo (chicken and beef)", id: 10},
        { name: "Extra Mega (chicken, beef, and shrimp)", id: 11},
        { name: "No Sausage Chicken Shawarma", id: 12},
        { name: "No Sausage Beef Shawarma", id: 13},
        { name: "No Sausage Combo (chicken and beef)", id: 14},
        { name: "No sausage Mega (chicken, beef, and shrimp)", id: 15},
      ],
    };
  }

  componentDidMount() {
		//find a nice popular line for this order while user is filling form

    Firebase.getRimiSenTitles()
    .then(val => {
      let letAllPopularLines = []

      for (let i = 0; i < val.length; i++) {
        let lyricsArray = val[i].lyrics.split("\n")

        for (let j = 0; j < lyricsArray.length; j++){
          letAllPopularLines.push(lyricsArray[j])
        }
      }

      let randomRimiIndex = Math.floor(Math.random() * (letAllPopularLines.length - 0) + 0);

      this.setState({audioIdToUse: letAllPopularLines[randomRimiIndex]})
    })
  }


  handleAudioStop(data) {
    this.setState({ audioDetails: data });
  }

  handleAudioUpload(orderID){
		if (this.state.audioDetails.chunks != null){
			let audioBlob = new Blob(this.state.audioDetails.chunks, {type: 'audio/mpeg'});

			Firebase.storage()
			.ref("audioFolder/")
			.child(orderID + ".mp3")
			.put(audioBlob)
			.then((url) => {
				this.setState({avatarOnFile: true });
			})
			.catch((error) => {
				this.setState({errorMsg: error.message})
			})
		}
  }

  handleRest() {
    const reset = {
      url: null,
      blob: null,
      chunks: null,
      duration: {
        h: null,
        m: null,
        s: null,
      },
    };
    this.setState({ audioDetails: reset });
  }

	placeOrder(){

		let errors = ""
		let audioRecorded = false

		//required fields
		if(this.state.firstName == ""){
			errors += " First name is empty \n"
		}

		if(this.state.lastName == ""){
			errors += " Last name is empty \n"
		}

		if(!validator.isEmail(this.state.emailAddress)){
			errors += " Email Address is invalid \n"
		}

		let orderId = (this.state.emailAddress + Date.now()).replace(/[^a-z0-9]/gi, '');
		if (this.state.audioDetails.chunks != null){
			audioRecorded = true
		}else{
			if(this.state.cart.length == 0){
				errors += " You didn't select an item preference \n"
			}

		}

		this.setState({errorMsg: errors})

		if (errors == "" ){

			let reel = {
				id: orderId,
				emailAddress: this.state.emailAddress,
				igname: this.state.igname,
				firstName: this.state.firstName,
				lastName: this.state.lastName,
				reelPurpose: this.state.reelPurpose,
				reelDuration: this.state.reelDuration,
				reelSampleLink: this.state.reelSampleLink,
        dueDateSelected: this.state.dueDateSelected.toString().substring(0, 16),
				selectedLevelOption: this.state.selectedLevelOption,
        orderAudioURL: "",
        audioIdToUse: this.state.audioIdToUse,
        cart: this.state.cart,
			}

      if(audioRecorded){
        let audioURL = `https://firebasestorage.googleapis.com/v0/b/afrik-acab0.appspot.com/o/audioFolder%2F${orderId}.mp3?alt=media&token=22ca9d49-2743-42cf-9ebd-738e307ba023`
        reel.orderAudioURL = audioURL
				this.handleAudioUpload(orderId)
			}

			Firebase.createafrikOrder(reel)
			.then(() =>{
        this.sendEmail(orderId)

        setTimeout(() => {
          location.href = "orders/" + orderId
          // this.props.changePage("orders/" + orderId)
        }, 1000)

			})
		}

	}

  sendEmail(orderId){
    let message =  `
      TODO: We have received your order (${orderId}) and it is in the works

      In the meantime, relax, listen to some Burna Boy, and your food will be ready as soon as possible.

      You can follow the progress of your reel here: https://www.afrik.com/orders/${orderId}
    `

    var templateParams = {
      to_name: this.state.firstName,
      from_name: 'afrik',
      message: message,
      recipient_email: this.state.emailAddress,
      sender_email: "jesuyedd@gmail.com",
      order_id: orderId
    };

    emailjs.send('service_yn2l3x8', 'template_nnb32k5', templateParams, 'VSKnf4Vspvt3LgOiz')
    .then(function(response) {
      console.log('SUCCESS!', response.status, response.text);
    }, (error) => {
        this.setState({errorMsg: error.message})
    });
  }

  handleGetCart = (cart) => {
    this.setState({cart: cart});
  }

  render() {
    return (
      <div className="PurchaseReel l-container">
        <h2>happy to assist you. please answer the questions below</h2>

        <div className="PurchaseReel-name PurchaseReel-eachSection">
          <h3>* First things first: what is your name?</h3>
          <TextField
            value={this.state.firstName}
            placeholder="First Name **"
            onChange={(e) => {
              this.setState({ firstName: e.target.value });
            }}
          />
					<TextField
            value={this.state.lastName}
            placeholder="Last Name **"
            onChange={(e) => {
              this.setState({ lastName: e.target.value });
            }}
          />
					<TextField
            value={this.state.emailAddress}
            placeholder="Email Address **"
            onChange={(e) => {
              this.setState({ emailAddress: e.target.value });
            }}
          />
					<TextField
            value={this.state.igname}
            placeholder="Phone Number  **"
            onChange={(e) => {
              this.setState({ igname: e.target.value });
            }}
          />
					<TextField
            value={this.state.igname}
            placeholder="Instagram Username **"
            onChange={(e) => {
              this.setState({ igname: e.target.value });
            }}
          />
        </div>

        <div className="PurchaseReel-dueDateSelection PurchaseReel-eachSection">
          <h3>* Select pick up time</h3>
          <DatePicker
            selected={this.state.dueDateSelected}
            onSelect={(e) => this.setState({dueDateSelected: e})} //when day is clicked
            onChange={(e) => this.setState({dueDateSelected: e})} //only when value has changed
            minDate={new Date()}
          />
        </div>

        <div className="PurchaseReel-voiceNote PurchaseReel-eachSection">
          <h3>
            Leave us a voicenote with all the answers from the questions below
            so you don't have to answer the questions. Then hit pay at the
            bottom of this page
          </h3>

          <Recorder
            record={true}
            audioURL={this.state.audioDetails.url}
            showUIAudio
            handleAudioStop={(data) => this.handleAudioStop(data)}
            handleOnChange={(value) => this.handleOnChange(value, "firstname")}
            handleRest={() => this.handleRest()}
          />
        </div>

        <Menu returnCartItems={this.handleGetCart} />

        <div className="PurchaseReel-sampleVideo PurchaseReel-eachSection">
          <h3>* Is there something else you need that we haven't covered?</h3>
          <TextField
            value={this.state.reelSampleLink}
            multiline = {true}
            minRows={2}
            placeholder="enter brief note here"
            onChange={(e) => {
              this.setState({ reelSampleLink: e.target.value });
            }}
          />
        </div>

				<div className="PurchaseReel-placeOrder PurchaseReel-eachSection">
					{this.state.errorMsg &&
						<pre>Error(s): <br></br>{this.state.errorMsg}</pre>
					}

					<Button
						variant="contained"
						style={{backgroundColor: '#800020', color: 'white', marginTop: 32, marginBottom: 16, fontWeidght: 500}}
						onClick={() => this.placeOrder()}
					>
						Place Order
					</Button>
				</div>

				{/* <div className="PurchaseReel-stripePayment PurchaseReel-eachSection">
					<CardForm/>
				</div> */}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

let PurchaseReel = withRouter(connect(mapStateToProps)(ConnectedPurchaseReel));
export default withRouter(PurchaseReel);
