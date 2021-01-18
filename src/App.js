import { Container, Row, Col, Navbar, Nav, Button, } from 'react-bootstrap';
import {AuthButton, LoggedIn} from "@solid/react";
import {
    Route,
    useParams,
    useHistory
} from "react-router-dom";
import _ from 'lodash';
import React, {useState, useEffect} from 'react';
import Profile from './components/Profile.js'
import Resource from './components/Resource';
import User from './components/User';
import Explore from './components/Explore';
import './App.css';


import {getCard} from "./api/user";

function App() {

    const {path} = useParams();

    const history = useHistory();

    const [module, setModule] = useState(history.location.pathname);
    const [image, setImage] = useState('/favicon.png');

    useEffect(() => history.replace(module+(path ? '?path='+path : '')), [module]);

    useEffect(async () => {
        const card = await getCard();
        if (_.isString(card.image.values[0])) {
            setImage(card.image.values[0]);
        }
    }, []);

    const getClass = mod => {
        if (module === mod) return 'secondary';
        return 'primary';
    };

    return (
          <Container>
              <Navbar bg="light" expand="lg">
                  <Navbar.Brand style={{cursor: 'pointer'}} onClick={()=>{setModule('/')}}>
                      <img className={'brand-image'} src={image}/>
                  </Navbar.Brand>
                  <Navbar.Toggle aria-controls="basic-navbar-nav" />
                  <Navbar.Collapse id="basic-navbar-nav">
                      <Nav className="mr-auto">
                          <Button variant={getClass('/profile')} onClick={()=>{setModule('/profile')}}>Profile</Button>
                          <Button variant={getClass('/resource')} onClick={()=>{setModule('/resource')}}>Resource</Button>
                          <Button variant={getClass('/explore')} onClick={()=>{setModule('/explore')}}>Explore</Button>
                      </Nav>
                      <AuthButton className="btn btn-primary" popup="https://pod.ideniox.com/common/popup.html" login="Login" logout="Logout"/>
                  </Navbar.Collapse>
              </Navbar>
              <LoggedIn>
                  <Container>
                      <Route path="(/)">
                          <Row>
                              <Col><User /></Col>
                          </Row>
                      </Route>
                      <Route path="/profile">
                          <Row>
                              <Col><Profile /></Col>
                          </Row>
                      </Route>

                      <Route path="/explore">
                          <Row>
                              <Col><Explore /></Col>
                          </Row>
                      </Route>
                      <Route path="/resource">
                          <Row>
                              <Col><Resource /></Col>
                          </Row>
                      </Route>
                  </Container>
              </LoggedIn>
          </Container>
  );
}

export default App;
