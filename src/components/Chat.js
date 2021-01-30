import React, {useState, useEffect} from 'react';
import {getFolder, getWebId, uploadFile} from "../api/explore";
import {getInboxes, getNotifications, deleteNotification, markNotificationAsRead, sendNotification, getNotificationsFromFolder, getOutbox, setCache} from "../api/things";
import {Button, Container, Dropdown, Spinner, Table} from "react-bootstrap";
import _ from 'lodash'
import md5 from 'md5';

const sockets = {}

const Chat = () => {

    const [inboxes, setInboxes] = useState([])

    const [id, setId] = useState('');

    const [files, setFiles] = useState([]);

    const [selectedInbox, setSelectedInbox] = useState('');

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [send, setSend] = useState(false)

    const [error, setError] = useState({})

    async function refresh() {
        getNotifications(notifications.map(n => _.last(n.url.split('/')))).then(e => setNotifications(_.reverse(_.sortBy(_.concat(_.differenceBy(e, notifications, JSON.stringify), notifications), 'time'))))

    }

    useEffect(async () => {
        setId(await getWebId())
        setInboxes(await getInboxes())
        setNotifications(await getNotifications())
        setLoading(false)
    }, []);


    useEffect(() => {
        if (_.isEmpty(inboxes)) return;
        console.log("Loaded inboxes, loading sockets")

        _.map(inboxes, inbox => {
            if (inbox.url === id) return;

            const addressee = id.replace('/profile/card#me', '/inbox/') + md5(inbox.url) + '/';
            if (sockets[inbox.url]) {
                sockets[inbox.url].close()
                console.log('Close socket')
            }
            sockets[inbox.url] = new WebSocket(
                addressee.replace('https', 'wss'),
                ['solid-0.1']
            );
            sockets[inbox.url].onopen = function() {
                this.send(`sub ${addressee}log.txt`);
                console.log("open socket", addressee);
            };
            sockets[inbox.url].onmessage = function(msg) {
                if (msg.data && msg.data.slice(0, 3) === 'pub') {
                    getNotificationsFromFolder(addressee, inbox.url, notifications.map(n => _.last(n.url.split('/'))))
                        .then(e => {
                            setNotifications(_.reverse(_.sortBy(_.concat(e, notifications), 'time')))
                        })

                }
            };
        })
    }, [inboxes, notifications]);

    useEffect(() => {
        if (_.isEmpty(notifications)) return;

        const x = _.filter(notifications, n => n.read === 'false')

        window.document.title = x.length ? (x.length + ' unread messages') : 'Pod Explorer';

    }, [notifications])

    if (loading)
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

    const renderNotifications = x => {

        return <>{x.map(notification => {

            const t = Date.parse(notification.time);

            const date = new Date(t)

            const time = Date.now() - t < 60000
                ? "Recently"
                : notification.time

            const y = notification.text.replace(/(?:\r\n|\r|\n)/g, '{{XXX}}').split('{{XXX}}').map(a => <div>{a}</div>)

            return <div data-key={notification.url} key={notification.url} className={notification.read === 'false' ? 'unread-message message' : 'message'}>
                <span key={'users'}>
                    <img alt='' className='image-chat' src={getFoto(notification.user)}/>
                    {<img alt='' className='image-chat' src={getFoto(notification.addressee)}/>}:
                    <div className={'message-text'}>{y}</div>
                    {!_.isEmpty(notification.attachments) && <ul>{_.map(notification.attachments, attachment => {
                        return <li key={attachment}><a href={attachment}>{attachment}</a></li>;
                    })}</ul>}
                    <div style={{textAlign: 'right', fontSize: '70%'}}>{time}</div>
                </span>
                <span key='message' className={'chat-actions'}>
                    <Button onClick={async () => {
                        await markNotificationAsRead(notification.url);
                        setNotifications(notifications.map(n => {
                            if (n.url === notification.url) {
                                n.read = 'true';
                            }
                            return n;

                        }));
                        await setCache(notifications);
                    }}><span className="material-icons">visibility</span></Button>
                    <Button variant='danger' onClick={async () => {
                        await deleteNotification(notification.url);
                        const x = notifications.filter(n => n.url !== notification.url)
                        setNotifications(x);
                        await setCache(notifications);
                    }}><span className="material-icons">delete</span></Button>
                </span>
            </div>})}</>
    }

    const groupedNotifications =_.groupBy(notifications, 'users');

    function autosize(){
        var el = this;
        setTimeout(function(){
            el.style.cssText = 'height:auto; padding:0';
            // for box-sizing other than "content-box" use:
            // el.style.cssText = '-moz-box-sizing:content-box';
            el.style.cssText = 'height:' + el.scrollHeight + 'px';
        },0);
    }



    return <div className={'chat-container'} key={'x'}>
        <div className={'chat-friends-list'}>
            <div className={'header'}>
                <Button onClick={() => {
                    refresh()
                }}><span className="material-icons">refresh</span></Button>
            </div>
            <div className={'content'}>
                {_.map(inboxes, inbox => <div className={'friend ' + (_.isEqual(selectedInbox, inbox)? 'selected-friend' : '')} key={inbox.url} onClick={() => {setSelectedInbox(inbox); setError({})}}><img src={inbox.photo} />{inbox.name}</div>)}
            </div>
        </div>
        <div className={'chat-message-list'}>
            <div className={'header'}>
                <img src={selectedInbox.photo} />
                {selectedInbox.name}
            </div>
            <div className={'content'}>
                {<>
                    {_.map(groupedNotifications, (notifications, users) => {
                        const a = _.sortBy(users.split(','))
                        const b = _.sortBy([selectedInbox.url, id])
                        if (!_.isEqual(a, b)) {
                            return;
                        }
                        return <>
                            {renderNotifications(notifications)}
                        </>
                    })}
                </>}
            </div>
            <div className='message-text-input' key={'text-field'}>
                <textarea type={'text'} value={text} onKeyDown={e => {
                    e.target.style.cssText = 'height:auto; padding:0';
                    // for box-sizing other than "content-box" use:
                    // el.style.cssText = '-moz-box-sizing:content-box';
                    e.target.style.cssText = 'height:' + e.target.scrollHeight + 'px';
                }} onChange={e=> setText(e.target.value)} />
                {<div className='message' key={'wth'}>
                    <span style={{padding: '0!important' }} colSpan={1}><input onChange={e => setFiles(e.target.files)} type="file" id="fileArea"  multiple/></span>
                    <span className="chat-actions">
                        <Button key='button' disabled={!text || !selectedInbox} onClick={async () => {
                            const e = await sendNotification(text, 'xxx', selectedInbox.url, selectedInbox.inbox, files);
                            setError(e);
                            setText('');
                            setTitle('');
                            setFiles([]);
                            setSend(false);
                            getNotificationsFromFolder(await getOutbox(), await getWebId(), notifications.map(n => _.last(n.url.split('/'))))
                                .then(e => {
                                    setNotifications(_.reverse(_.sortBy(_.concat(_.differenceBy(e, notifications, JSON.stringify), notifications), 'time')))

                                })
                        }}><span className="material-icons">send</span></Button>
                    </span>
                </div>}
            </div>
        </div>
    </div>
}
export default Chat;
