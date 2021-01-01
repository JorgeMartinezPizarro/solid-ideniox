import { Container, Row, Col, Navbar, Nav, NavDropdown, Form, Button, } from 'react-bootstrap';
import {AuthButton, LoggedIn, LoggedOut} from "@solid/react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
} from "react-router-dom";
import React, {useState, useEffect} from 'react';
import Read from './components/Read.js'
import Write from './components/Write.js'
import Nicks from './components/Nicks';
import Demo from './components/Demo';
import Friends from './components/Friends';
import Explore from './components/Explore';
import './App.css';
import _ from 'lodash'

const Main = props => {

    return (
        <Container>
            <Route path="/">

            </Route>
            <Route path="/name">
                <Row>
                    <Col><Write /></Col>
                </Row>
                <Row>
                    <Col><Read /></Col>
                </Row>
                <Row>
                    <Col><Demo /></Col>
                </Row>
            </Route>
            <Route path="/nicks">
                <Row>
                    <Col><Nicks /></Col>
                </Row>
            </Route>
            <Route path="/friends">
                <Row>
                    <Col><Friends session={props.session}/></Col>
                </Row>
            </Route>
            <Route path="/explore">
                <Row>
                    <Col><Explore /></Col>
                </Row>
            </Route>

        </Container>
    )
}


function App() {

    return (
      <Router>

          <Container>
              <Navbar bg="light" expand="lg">
                  <Navbar.Brand href="/">1 Billion</Navbar.Brand>
                  <Navbar.Toggle aria-controls="basic-navbar-nav" />
                  <Navbar.Collapse id="basic-navbar-nav">
                      <Nav className="mr-auto">
                          <Nav.Link href="/name">Name</Nav.Link>
                          <Nav.Link href="/nicks">Nicks</Nav.Link>
                          <Nav.Link href="/friends">Friends</Nav.Link>
                          <Nav.Link href="/explore">Explore</Nav.Link>
                      </Nav>
                      <AuthButton className="btn btn-primary" popup="https://pod.ideniox.com/common/popup.html" login="log in for magic!" logout="log me outta here"/>
                  </Navbar.Collapse>
              </Navbar>
              <LoggedIn>
                  <Main />
              </LoggedIn>
          </Container>
      </Router>
  );
}

export default App;
