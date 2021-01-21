import React, {useState, useEffect} from 'react';
import {useNotification} from '@inrupt/solid-react-components';

import { AS } from '@inrupt/lit-generated-vocab-common';

import {getWebId} from "../api/explore";
import {getInboxes, getNotifications} from "../api/things";
import {Button, Container, Dropdown} from "react-bootstrap";
import _ from 'lodash'

export default () => {

    const [inboxes, setInboxes] = useState([])

    const [id, setId] = useState('')

    const [selectedInbox, setSelectedInbox] = useState('');

    const [notifications, setNotifications] = useState([])

    const [title, setTitle] = useState('')
    const [text, setText] = useState('')

    useEffect(() => {
        getWebId().then(setId)
        getInboxes().then(setInboxes)
        getNotifications().then(setNotifications)
    }, []);

    console.log(selectedInbox)

    const { createNotification, createInbox, discoverInbox, notification, fetchNotification } = useNotification('https://jorge.pod.ideniox.com/profile/card#me');

    const sendNotification = () => {
        createNotification(
            {
                title,
                summary: text,
                actor: id,
            },
            selectedInbox.inbox,
            AS.Announce.iriAsString
        );
    }

    return _.isEmpty(inboxes) || id === ''
        ? <div>LOADING</div>
        : <Container key={'x'}>
            <input type={'text'} value={title} style={{width: '100%'}} onChange={e=> setTitle(e.target.value)} />
            <textarea type={'text'} value={text} style={{height: '400px', width: '100%'}} onChange={e=> setText(e.target.value)} />
            <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    Dropdown Button
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {_.map(inboxes, inbox => <Dropdown.Item onClick={() => setSelectedInbox(inbox)}>{inbox.name}</Dropdown.Item>)}
                </Dropdown.Menu>
            </Dropdown>
            <Button onClick={sendNotification}>Send</Button>
            <ul>
                {notifications.map(notification => <li>{notification.title + ' / ' + notification.text + '/' + notification.user}</li>)}
            </ul>
        </Container>
}
