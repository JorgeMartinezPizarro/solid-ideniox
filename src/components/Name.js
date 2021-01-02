import React, {useState, useEffect} from 'react';

import {Button, Spinner, Container, Row} from 'react-bootstrap';

import _ from 'lodash';

import {getName, setName, getProfile} from '../api/user'

export default () => {
    const [userName, setUserName] = useState('')
    const [newName, setNewName] = useState('')
    useEffect(() => {
        getName().then(setUserName)
        getProfile().then(console.log)
    }, [])

    return <Container>
        {_.isEmpty(userName) && <Row><Spinner animation="border" /></Row>}
        {!_.isEmpty(userName) && <Row>
            <input
                value={newName}
                onChange={e => {
                    setNewName(e.target.value);
                }}
                type={'text'}
            />
            <Button
                onClick={async () => {
                    await setName(newName);
                    setNewName('');
                    setUserName(newName);
                }}
            >
                Change
            </Button>
        </Row>}
        <Row>{userName}</Row>
    </Container>
}
