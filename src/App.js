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
              <Navbar bg="light" expand="lg">
                  <Navbar.Brand style={{cursor: 'pointer'}} onClick={()=>{setModule('/')}}>
                      <img alt='' className={'brand-image'} src={image}/>
                  </Navbar.Brand>
                  <Navbar.Toggle aria-controls="basic-navbar-nav" />
                  <Navbar.Collapse id="basic-navbar-nav">
                      <Nav className="mr-auto">
                          <Button variant={getClass('/profile')} onClick={()=>{setModule('/profile')}}>Profile</Button>
                          <Button variant={getClass('/explore')} onClick={()=>{setModule('/explore')}}>Explore</Button>
                          <Button variant={getClass('/chat')} onClick={()=>{setModule('/chat')}}>Chat</Button>
                      </Nav>
                      <AuthButton className="btn btn-primary" popup="https://pod.ideniox.com/common/popup.html" login="Login" logout="Logout"/>
                  </Navbar.Collapse>
              </Navbar>
              <LoggedIn>
                  <div>
                      <Route path="(/)">
                          <User />
                      </Route>
                      <Route path="/profile">
                          <Profile />
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
