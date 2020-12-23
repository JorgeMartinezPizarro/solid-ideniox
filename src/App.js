import { Button, Container, Row, Col, Navbar, Nav, NavDropdown, Form } from 'react-bootstrap';
import {AuthButton, LoggedIn, LoggedOut} from "@solid/react";

import Read from './components/Read.js'
import Write from './components/Write.js'
import Nicks from './components/Nicks';
import Demo from './components/Demo';

import './App.css';

const Main = () => {
    return <Container>
        <Row>
            <Col><Read /></Col>
        </Row>
        <Row>
            <Col><Write /></Col>
        </Row>
        <Row>
            <Col><Nicks /></Col>
        </Row>
        <Row>
            <Col><Demo /></Col>
        </Row>
    </Container>
}

function App() {
  return (
      <Container>
          <Navbar bg="light" expand="lg">
              <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="mr-auto">
                      <Nav.Link href="#home">Home</Nav.Link>
                      <Nav.Link href="#link">Link</Nav.Link>
                      <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                          <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                          <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                          <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                          <NavDropdown.Divider />
                          <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                      </NavDropdown>
                  </Nav>
                  <Form inline>
                      <AuthButton className="btn btn-primary" popup="https://pod.ideniox.com/common/popup.html" login="LOGIN" logout="LOGOUT"/>
                  </Form>
              </Navbar.Collapse>
          </Navbar>

          <LoggedOut>
              <p>You are not logged in.</p>
          </LoggedOut>
          <LoggedIn>
              <p>Congratulations, you're logged in!</p>
              <Main />
          </LoggedIn>
      </Container>
  );
}

export default App;
