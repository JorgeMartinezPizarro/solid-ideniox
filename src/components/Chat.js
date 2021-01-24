import React, {useState, useEffect} from 'react';
import {getWebId} from "../api/explore";
import {getInboxes, getNotifications, deleteNotification, markNotificationAsRead, sendNotification} from "../api/things";
import {Button, Container, Dropdown, Spinner, Table} from "react-bootstrap";
import _ from 'lodash'

const Chat = () => {

    const [inboxes, setInboxes] = useState([])

    const [id, setId] = useState('');

    const [selectedInbox, setSelectedInbox] = useState('');

    const [notifications, setNotifications] = useState([])

    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [send, setSend] = useState(false)

    const [error, setError] = useState({})

    useEffect(() => {
        getWebId().then(setId)
        getInboxes().then(setInboxes)
        getNotifications().then(setNotifications)
    }, []);

    if (_.isEmpty(inboxes) || id === '' )
        return <div><Spinner animation={'border'}/></div>

    const getFoto = user => {
        const x = _.find(inboxes, inbox => {
            return inbox.url === user
        });


        return x ? x.photo : '/favicon.png';
    }

    const getName = user => {
        const x = _.find(inboxes, inbox => {
            return inbox.url === user
        });


        return x ? x.name : user;
    }

    const renderNotifications = notifications => {
        return <>{notifications.map(notification => {
            return <tr data-key={notification.url} key={notification.url} className={notification.read === 'false' ? 'unread-message message' : 'message'}>
                <td key={'users'}>
                    <img alt='' className='image-chat' src={getFoto(notification.user)}/>
                    {<img alt='' className='image-chat' src={getFoto(notification.addressee)}/>}:
                    <pre>{notification.text}</pre>
                </td>
                <td key='message' className={'chat-actions'}>
                    <Button onClick={async () => {
                        await markNotificationAsRead(notification.url);
                        setNotifications(await getNotifications());
                    }}><span className="material-icons">visibility</span></Button>
                    <Button variant='danger' onClick={async () => {
                        await deleteNotification(notification.url);
                        setNotifications(await getNotifications());
                    }}><span className="material-icons">delete</span></Button>
                </td>
            </tr>})}</>
    }

    const groupedNotifications =_.groupBy(notifications, 'users');

    return <Container key={'x'}>
        <Table><tbody>
            <tr key={'space-1-row'}>
                <td ></td>
                <td style={{width: '170px'}}></td>
            </tr>
            {!_.isEmpty(error) && <tr><td colSpan={2}>{JSON.stringify(error)}</td></tr>}
            <tr><td colSpan={2}><Button onClick={() => setSend(!send)}><span className="material-icons">{send ? 'list' : 'edit'}</span></Button><Button onClick={() => getNotifications().then(setNotifications)}><span className="material-icons">refresh</span></Button></td></tr>
            {send && <tr key={'title-field'}><td colSpan={2}><input type={'text'} value={title} style={{width: '100%'}} onChange={e=> setTitle(e.target.value)} /></td></tr>}
            {send && <tr key={'text-field'}><td colSpan={2}><textarea type={'text'} value={text} style={{height: '400px', width: '100%'}} onChange={e=> setText(e.target.value)} /></td></tr>}
            {send && <tr key={'select-friend'}><td colSpan={2}><Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {selectedInbox.name || 'Select an user'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {_.map(inboxes, inbox => <Dropdown.Item key={inbox.url} onClick={() => setSelectedInbox(inbox)}>{inbox.name}</Dropdown.Item>)}
                </Dropdown.Menu>
            </Dropdown></td></tr>}
            {send && <tr key={'send-row'}><td key='send' colSpan={2}>{send && <Button key='button' disabled={!title || !text || !selectedInbox} onClick={async () => {
                const e = await sendNotification(text, title, selectedInbox.url, selectedInbox.inbox);
                setError(e);
                setText('');
                setTitle('');
            }}>Send</Button>}</td></tr>}
            {!send && <>
                <tr key={'space-2-row'}>
                    <td ></td>
                    <td style={{width: '170px'}}></td>
                </tr>
                {_.map(groupedNotifications, (notifications, users) => {
                    const filteredUsers = users.split(',').filter(u => u !== id);
                    return <>
                        <tr data-key={users} key={users} className={'users-chat-list'}>
                            <td colSpan={2}>
                                {_.isEmpty(filteredUsers)&&<b key={'self'}>Self</b>}
                                {filteredUsers.map(user => <b key={getName(user)}>{getName(user) || 'Self'}</b>)}
                            </td>
                        </tr>
                        {renderNotifications(notifications)}
                    </>
                })}
            </>}
        </tbody></Table>
    </Container>
}
export default Chat;
