import { Container, Row, Col, Navbar, Nav, Button, } from 'react-bootstrap';
import {AuthButton, LoggedIn} from "@solid/react";
import {
    Route,
    useParams,
    useHistory
} from "react-router-dom";
import _ from 'lodash';
import React, {useState, useEffect} from 'react';
import Profile from './components/Profile';
import User from './components/User';

import Explore from './components/Explore';
import Chat from './components/Chat';
import './App.css';

import {getCard} from "./api/user";

function App() {

    const {path} = useParams();

    const history = useHistory();

    const [module, setModule] = useState(history.location.pathname);
    const [image, setImage] = useState('/favicon.png');

    useEffect(() => history.replace(module+(path ? '?path='+path : '')), [module, history, path]);

    useEffect(() => {
        getCard().then(card => {
            if (_.isString(card.image.values[0])) {
                setImage(card.image.values[0]);
            }
        });
    }, []);

    const getClass = mod => {
        if (module === mod) return 'secondary';
        return 'primary';
    };

    return (
          <div>
              <div className={'main-header'}>
                  <div className={'brand-image'}><img onClick={()=>{setModule('/')}} alt=''  src={image}/></div>
                  <div className='head-image'><span onClick={()=>{setModule('/explore')}} className="material-icons">explore</span></div>
                  <div className='head-image'><span onClick={()=>{setModule('/chat')}} className="material-icons">forum</span></div>
                  <AuthButton className="logout-main" popup="https://pod.ideniox.com/common/popup.html" login={<span className={'material-icons'}>login</span>} logout={<span className={'material-icons'}>logout</span>}/>
              </div>
              <LoggedIn>
                  <div>
                      <Route path="(/)">
                          <User />
                      </Route>
                      <Route path="/explore">
                          <Explore />
                      </Route>
                      <Route path="/chat">
                          <Chat />
                      </Route>
                  </div>
              </LoggedIn>
          </div>
  );
}

export default App;
