import React, {useState, useEffect} from 'react';
import {useNotification} from '@inrupt/solid-react-components';

import { AS } from '@inrupt/lit-generated-vocab-common';

import {getWebId} from "../api/explore";
import {getInboxes, getNotifications, deleteNotification, markNotificationAsRead} from "../api/things";
import {Button, Container, Dropdown, Spinner} from "react-bootstrap";
import _ from 'lodash'

export default () => {

    const [inboxes, setInboxes] = useState([])

    const [id, setId] = useState('')

    const [selectedInbox, setSelectedInbox] = useState('');

    const [notifications, setNotifications] = useState([])

    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [send, setSend] = useState(false)

    useEffect(() => {
        getWebId().then(setId)
        getInboxes().then(setInboxes)
        getNotifications().then(setNotifications)
    }, []);

    const { createNotification, createInbox, discoverInbox, notification, fetchNotification, mask } = useNotification('https://jorge.pod.ideniox.com/profile/card#me');

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
    };

    if (_.isEmpty(inboxes) || id === '' || _.isEmpty(notifications))
        return <div><Spinner animation={'border'}/></div>

    return <Container key={'x'}>
            <Button onClick={() => setSend(!send)}>{send?'Inbox':"Redact"}</Button>
            {send && <input type={'text'} value={title} style={{width: '100%'}} onChange={e=> setTitle(e.target.value)} />}
            {send && <textarea type={'text'} value={text} style={{height: '400px', width: '100%'}} onChange={e=> setText(e.target.value)} />}
            {send && <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {selectedInbox.name || 'Select an user'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {_.map(inboxes, inbox => <Dropdown.Item onClick={() => setSelectedInbox(inbox)}>{inbox.name}</Dropdown.Item>)}
                </Dropdown.Menu>
            </Dropdown>}
            {send && <Button onClick={sendNotification}>Send</Button>}
            {!send && <ul>
                {notifications.map(notification => <li><ul>
                    <li>{notification.title}</li>
                    <li>{notification.text}</li>
                    <li>{notification.user}</li>
                    <li>{notification.time}</li>
                    <li>{notification.read}</li>
                    <li>{notification.url}</li>
                    <li><Button onClick={async () => {
                        await markNotificationAsRead(notification.url);
                        setNotifications(await getNotifications());
                    }}>READ</Button></li>
                </ul></li>)}
            </ul>}
        </Container>
}
