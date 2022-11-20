import React, { Component } from "react";
import logo from '../../assets/logos/logo.png';

import { GetSvgIcon } from "../../Helpers/Helpers.js";

import "./Header.css";

class Header extends Component{
  constructor(props){
    super(props);

    this.state = {
      catSelected: "afrik",
      findMeIconHover: "#800020",
    }
  }

  handleCategoryClick(catSelected){
    this.setState({
      findMeIconHover: "black",
      createIconHover: "black",
      meCardsIconHover: "black",
    })

    if(catSelected == "afrik"){
      this.setState({ findMeIconHover: "#800020"})
    }else if(catSelected == "aboutme"){
      this.setState({ createIconHover: "#800020"})
    }else if(catSelected == "mecards"){
      this.setState({ meCardsIconHover: "#800020"})
    }

    this.props.changePage(catSelected)
  }

  componentDidMount(){
    let path = window.location.pathname;
    this.setState({
      findMeIconHover: path.includes("afrik/") || path.includes("rimicard") ? "#800020" : 'black',
      createIconHover: path.includes("aboutme/") ? "#800020" : 'black',
      meCardsIconHover: path.includes("mecards/") ? "#800020" : 'black',
    })
  }

  render(){
    return (
      <div className="Header">
        <div className="Header-logoWrapper" onClick={() => this.handleCategoryClick("afrik")}>
          <img className="Header-logo" src={logo} alt="afrik.me.logo" />
        </div>
        <div className="Header-mainMenu">
          <div className="Header-mainMenu-item Header-icon" onClick={() => this.handleCategoryClick("afrik")}>
            {GetSvgIcon("findMeIcon", this.state.findMeIconHover)}
            <span className="Header-img-title">afrik!</span>
          </div>
          <div className="Header-mainMenu-item Header-icon" onClick={() => this.handleCategoryClick("aboutme")}>
            {GetSvgIcon("createIcon", this.state.createIconHover)}
            <span className="Header-img-title">about.us</span>
          </div>
        </div>
      </div>
    );
  }
}

export default Header;
