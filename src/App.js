import { Container} from 'react-bootstrap';
import {AuthButton, LoggedIn, LoggedOut} from "@solid/react";
import {
    Route,
} from "react-router-dom";

import React, {useEffect} from 'react';

import Chat from './components/Chat';
import './App.css';
import {createOutbox, existOutbox} from './api/things'

function App() {

    useEffect(() => {

        existOutbox()
            .then(response => {
                if (response === false) {
                    console.log('not exist')
                    createOutbox()
                        .then(e => {
                            if (e) console.log('created')
                            else console.log('could not be created')
                        })
                        .catch(e => console.error)
                } else console.log('exists')

        }).catch(e =>
            console.error('error reading')
        )


    });

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
