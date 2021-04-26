import {Button} from "react-bootstrap";
import {
    Route,
} from "react-router-dom";

import React, {useEffect, useState} from 'react';

import Chat from './components/Chat';
import './App.css';
import {createOutbox, existOutbox, cleanupFolders, setSession} from './api/things'

import { Session, fetch, getDefaultSession } from "@inrupt/solid-client-authn-browser";

const session = new Session();

function App() {

    const [currentSession, setCurrentSession] = useState({})
    const [selectedProvider, setSelectedProvider] = useState("https://pod.ideniox.com");

    useEffect(() => {

        session.handleIncomingRedirect({restorePreviousSession: true}).then(e => {
            setCurrentSession(e)
        }).catch(console.error);
        if (!currentSession.isLoggedIn) return;

        setSession(session)

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
                    console.log("Pr8 Load app in " + (Date.now() - a)/1000 + " s");
                }

        }).catch(e =>
            console.error('error reading')
        )

        const b = Date.now()
        cleanupFolders().then(() => console.log("Pr8 Load cleanup", Date.now() - b))


    }, []);

    return (
          <div>
              {currentSession.isLoggedIn && <div>
                  <Route path="*">
                      <Chat
                          session={session}
                          setCurrentSession={setCurrentSession}
                      />
                  </Route>
              </div>}
              {!currentSession.isLoggedIn && <div className={'app-loading-page'} >

                  <img src={'/Portada.png'} className={'app-start-page'} />
                  <div>
                      <input
                          style={{width: "70%"}}
                          type="text"
                          value={selectedProvider}
                          onChange={e => setSelectedProvider(e.target.value)}
                          placeholder="write your provider"
                      />
                  </div>
                  <div>You are not logged in. Please
                      Click <span onClick={async () => {
                          await session.login({
                              oidcIssuer: selectedProvider,
                          });
                      }}> here </span> to login.
                      <i>
                        <br/>
                        <br/>Please check the box
                        <br/>"Give other people and apps access to the Pod, or revoke their (and your) access"
                        <br/>When loading first time
                      </i>
                  </div>
              </div>}
          </div>
  );
}

export default App;
