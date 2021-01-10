import { Container, Row, Col, Navbar, Nav, NavDropdown, Form, Button, } from 'react-bootstrap';
import {AuthButton, LoggedIn, LoggedOut} from "@solid/react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams,
    useHistory
} from "react-router-dom";
import React, {useState, useEffect} from 'react';
import Name from './components/Name.js'
import Nicks from './components/Nicks';
import Friends from './components/Friends';
import Explore from './components/Explore';
import Thing from './components/Thing';
import './App.css';
import _ from 'lodash'
import { withRouter } from 'react-router-dom';


const Main = props => {

    return (
        <Container>
            <Route path="/">

            </Route>
            <Route path="/name">
                <Row>
                    <Col><Name /></Col>
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
            <Route path="/thing">
                <Row>
                    <Col><Thing /></Col>
                </Row>
            </Route>
        </Container>
    )
}


function App() {

    const params = useParams();

    const history = useHistory();

    const [module, setModule] = useState(history.location.pathname);

    useEffect(() => history.replace(module), [module]);

    return (


          <Container>
              <Navbar bg="light" expand="lg">
                  <Navbar.Brand href="/">1 Billion</Navbar.Brand>
                  <Navbar.Toggle aria-controls="basic-navbar-nav" />
                  <Navbar.Collapse id="basic-navbar-nav">
                      <Nav className="mr-auto">
                          <Button onClick={()=>{setModule('/name')}}>Name</Button>
                          <Button onClick={()=>{setModule('/nicks')}}>Nicks</Button>
                          <Button onClick={()=>{setModule('/friends')}}>Friends</Button>
                          <Button onClick={()=>{setModule('/explore')}}>Explore</Button>
                          <Button onClick={()=>{setModule('/thing')}}>Things</Button>
                      </Nav>
                      <AuthButton className="btn btn-primary" popup="https://pod.ideniox.com/common/popup.html" login="Login" logout="Logout"/>
                  </Navbar.Collapse>
              </Navbar>
              <LoggedIn>
                  <Main />
              </LoggedIn>
          </Container>
  );
}

export default App;
