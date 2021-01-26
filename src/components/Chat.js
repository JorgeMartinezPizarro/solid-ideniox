import React, {useState, useEffect} from 'react';
import {getFolder, getWebId, uploadFile} from "../api/explore";
import {getInboxes, getNotifications, deleteNotification, markNotificationAsRead, sendNotification, getNotificationsFromFolder} from "../api/things";
import {Button, Container, Dropdown, Spinner, Table} from "react-bootstrap";
import _ from 'lodash'
import md5 from 'md5';

const Chat = () => {



    const [inboxes, setInboxes] = useState([])

    const [id, setId] = useState('');

    const [files, setFiles] = useState([]);

    const [selectedInbox, setSelectedInbox] = useState('');

    const [notifications, setNotifications] = useState([]);

    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [send, setSend] = useState(false)

    const [error, setError] = useState({})

    useEffect(() => {
        getWebId().then(setId)
        getInboxes().then(setInboxes)
        getNotifications().then(setNotifications)
    }, []);





    useEffect(() => {

        if (_.isEmpty(notifications) || _.isEmpty(inboxes)) return;

        console.log("Creating sockets")
        _.map(inboxes, inbox => {
            const addressee = id.replace('/profile/card#me', '/inbox/') + md5(inbox.url) + '/';

            const socket = new WebSocket(
                id.replace('https', 'wss').replace('/profile/card#me', '/'),
                ['solid-0.1']
            );
            socket.onopen = function() {
                this.send(`sub ${addressee}log.txt`);
                console.log("open", inbox)
            };
            socket.onmessage = function(msg) {
                console.log(inbox)
                if (msg.data && msg.data.slice(0, 3) === 'pub') {

                    getNotificationsFromFolder(addressee, inbox.url, notifications.map(n => _.last(n.url.split('/'))))
                        .then(e => {
                            console.log(_.differenceBy(e, notifications, JSON.stringify));
                            setNotifications(_.reverse(_.sortBy(_.concat(_.differenceBy(e, notifications, JSON.stringify), notifications), 'time')))

                        })
                }
            };


        })
    }, [inboxes, notifications]);

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
                    {!_.isEmpty(notification.attachments) && <ul>{_.map(notification.attachments, attachment => {
                        return <li key={attachment}><a href={attachment}>{attachment}</a></li>;
                    })}</ul>}
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
        <Table className={'chat-list'}><tbody>
            <tr key={'space-1-row'}>
                <td ></td>
                <td style={{width: '200px'}}></td>
            </tr>
            {!_.isEmpty(error) && <tr key={'error-message'}><td colSpan={2}>{JSON.stringify(error)}</td></tr>}
            <tr key={'wtf'}><td colSpan={2}><Button onClick={() => setSend(!send)}><span className="material-icons">{send ? 'list' : 'edit'}</span></Button><Button onClick={() => getNotifications().then(setNotifications)}><span className="material-icons">refresh</span></Button></td></tr>
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
            {send && <tr key={'wth'}><td style={{padding: '0!important' }} colSpan={2}><input onChange={e => setFiles(e.target.files)} type="file" id="fileArea"  multiple/></td></tr>}
            {send && <tr key={'send-row'}><td key='send' colSpan={2}>{send && <Button key='button' disabled={!title || !text || !selectedInbox} onClick={async () => {
                const e = await sendNotification(text, title, selectedInbox.url, selectedInbox.inbox, files);
                setError(e);
                setText('');
                setTitle('');
                setNotifications(await getNotifications());
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
