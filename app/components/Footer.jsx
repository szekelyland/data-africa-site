import React, {Component} from "react";
import {Link} from "react-router";
import "./Footer.css";

class Footer extends Component {

  render() {
    const {dark} = this.props;
    return (
      <footer id="footer" className={ dark ? "dark" : "light" }>
        <div className="inner">
          <div className="links">
            <ul className="list">
              <h5 className="title">Explore</h5>
              <li className="item"><Link className="link" to="/">Search</Link></li>
              <li className="item"><Link className="link" to="/map">Map</Link></li>
            </ul>
            <ul className="list">
              <h5 className="title">About</h5>
              <li className="item"><Link className="link" to="/about#background">Background</Link></li>
              <li className="item"><Link className="link" to="/about#data">Data Sources</Link></li>
              <li className="item"><Link className="link" to="/about#glossary">Glossary</Link></li>
              <li className="item"><Link className="link" to="/about#terms">Terms of Use</Link></li>
            </ul>
          </div>
          <div className="logos">
            <a href="http://www.ifpri.org" target="_blank"><img className="ifpri" src="/images/logos/ifpri.png" /></a>
            <a href="http://datawheel.us" target="_blank"><img className="datawheel" src={ `/images/logos/datawheel${ dark ? "-white" : "" }.png` } /></a>
          </div>
        </div>
      </footer>
    );

  }
}

export default Footer;
