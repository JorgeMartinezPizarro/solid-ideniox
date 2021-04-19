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

        const a = Date.now();
        existOutbox()
            .then(response => {
                if (response === false) {
                    createOutbox()
                        .then(e => {
                            if (e) console.log('created')
                            else console.log('could not be created')
                        })
                        .catch(e => console.error)
                } else {
                    console.log("Load app in " + (Date.now() - a) + " ms");
                }

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
                  <div className={'app-loading-page'} >
                      <img src={'/Portada.png'} className={'app-start-page'} />
                      <div>You are not logged in. Please
                          <AuthButton className='inline-login' popup="/popup.html" login="click here" logout="logout"/>
                          to login
                          <i>
                            <br/>
                            <br/>Please check the box
                            <br/>"Give other people and apps access to the Pod, or revoke their (and your) access"
                            <br/>When loading first time
                          </i>
                      </div>
                  </div>
              </LoggedOut>
          </div>
  );
}

export default App;
