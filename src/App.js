import { Container, Row, Col, Navbar, Nav, Button, Image} from 'react-bootstrap';
import {AuthButton, LoggedIn, LoggedOut} from "@solid/react";
import {
    Route,
    useParams,
    useHistory
} from "react-router-dom";
import _ from 'lodash';
import React, {useState, useEffect} from 'react';
import User from './components/User';

import Chat from './components/Chat';
import './App.css';
import {createOutbox, existOutbox} from './api/things'

import {getCard} from "./api/user";

function App() {

    const {path} = useParams();

    const history = useHistory();

    const [module, setModule] = useState(history.location.pathname);
    const [image, setImage] = useState('/favicon.png');
    const [loading, setLoading] = useState(false);

    useEffect(() => {


        getCard().then(card => {
            if (_.isString(card.image.values[0])) {
                setImage(card.image.values[0]);
            }
        });
        setLoading(true)
        existOutbox().then(response => {
            if (response === false) {
                createOutbox().then(e => setLoading(false)).catch(e => setLoading(false))
            }
            setLoading(false);
        })


    }, []);

    const getClass = mod => {
        if (module === mod) return 'secondary';
        return 'primary';
    };

    return (
          <div>
              <LoggedIn>
                  <div>
                      <Route path="*">
                          <Chat />
                      </Route>
                  </div>
              </LoggedIn>
              <LoggedOut>
                  <Container>You are not logged in. Please
                      <AuthButton className='inline-login' popup="/popup.html" login="click here to login" logout="logout"/>
                      to continue with a log in.
                  </Container>
              </LoggedOut>
          </div>
  );
}

export default App;
