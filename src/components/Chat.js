import React, {useState, useEffect} from 'react';
import {getWebId} from "../api/explore";
import {getInboxes, getNotifications, deleteNotification, markNotificationAsRead, sendNotification} from "../api/things";
import {Button, Container, Dropdown, Spinner, Table} from "react-bootstrap";
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

    if (_.isEmpty(inboxes) || id === '' || _.isEmpty(notifications))
        return <div><Spinner animation={'border'}/></div>

    const getFoto = user => {
        const x = _.find(inboxes, inbox => {
            return inbox.url === user
        });


        return x ? x.photo : '/favicon.png';
    }

    return <Container key={'x'}>
        <Table><tbody>
            <tr>
                <td ></td>
                <td style={{width: '170px'}}></td>
            </tr>
            <tr><td colSpan={2}><Button onClick={() => setSend(!send)}><span className="material-icons">{send ? 'list' : 'edit'}</span></Button><Button onClick={() => getNotifications().then(setNotifications)}><span className="material-icons">refresh</span></Button></td></tr>
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
            {send && <Button disabled={!title || !text || !selectedInbox} onClick={async () => {
                await sendNotification(text, title, selectedInbox.url, selectedInbox.inbox)
                setText('');
                setTitle('');
            }}>Send</Button>}
            {!send && <>
                <tr>
                    <td ></td>
                    <td style={{width: '170px'}}></td>
                </tr>
                {notifications.map(notification => {
                    return <tr className={notification.read === 'false' ? 'unread-message message' : 'message'}>
                        <td>
                            <img className='image-chat' src={getFoto(notification.user)}/>
                            {<img className='image-chat' src={getFoto(notification.destinatary)}/>}
                            {notification.text}
                        </td>
                        <td>
                            <Button onClick={async () => {
                                await markNotificationAsRead(notification.url);
                                setNotifications(await getNotifications());
                            }}><span className="material-icons">visibility</span></Button>
                            <Button variant='danger' onClick={async () => {
                                await deleteNotification(notification.url);
                                setNotifications(await getNotifications());
                            }}><span className="material-icons">delete</span></Button>
                        </td>
                </tr>})}
            </>}
        </tbody></Table>
    </Container>
}
