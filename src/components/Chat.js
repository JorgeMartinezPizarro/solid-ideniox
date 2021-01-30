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

    const [height, setHeight] = useState(41)
    const [sending, setSending] = useState(false)
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

        _.map(inboxes, inbox => {
            if (inbox.url === id) return;

            const addressee = id.replace('/profile/card#me', '/inbox/') + md5(inbox.url) + '/';
            if (sockets[inbox.url]) {
                sockets[inbox.url].close()
                console.log('Close sockets')
            }
            sockets[inbox.url] = new WebSocket(
                addressee.replace('https', 'wss'),
                ['solid-0.1']
            );
            sockets[inbox.url].onopen = function() {
                this.send(`sub ${addressee}log.txt`);
                console.log("Open socket", addressee);
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

            const y = notification.text.trim().replace(/(?:\r\n|\r|\n)/g, '{{XXX}}').split('{{XXX}}').map(a => <div>{a}</div>)

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
                <div key='message' className={'chat-actions'}>
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
                </div>
            </div>})}</>
    }

    const getInbox = user => {
        const x = _.find(inboxes, inbox => {
            return inbox.url === user
        });


        return x;
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

    _.forEach(inboxes, inbox => {
        const target = _.find(groupedNotifications, (group, users) => {
            return _.includes(users, inbox.url)
        })
        if (_.isEmpty(target)) {
            groupedNotifications[id + ','+inbox.url] = [];
        }
    })

    return <div className={'chat-container'} key={'x'}>
        <div className={'chat-friends-list'}>
            <div className={'header'}>
                <Button onClick={() => {
                    refresh()
                }}><span className="material-icons">refresh</span></Button>
            </div>
            <div className={'content'}>
                {_.map(groupedNotifications, (n, group) => {
                    const users = group.split(',');
                    const user = users.find(u => u !== id) || id;
                    const inbox = getInbox(user);
                    const unread = _.filter(n, x => x.read === 'false').length

                    console.log(unread)
                    return <div className={(unread ? 'unread' : '') + ' friend ' + (_.isEqual(selectedInbox, inbox)? 'selected-friend' : '')} key={inbox.url} onClick={async () => {
                        setSelectedInbox(inbox);
                        setNotifications(notifications.map(n=>{n.read='true'; return n;}));
                        await setCache(notifications.map(n=>{n.read='true'; return n;}));
                        setError({})}
                    }><img src={inbox.photo} />{inbox.name}<span>{unread > 0 && ` (${unread})`}</span></div>
                })}
            </div>
        </div>
        <div className={'chat-message-list'}>
            <div className={'header'}>
                {!_.isEmpty(selectedInbox) && <img src={selectedInbox.photo} />}
                {selectedInbox.name}

            </div>
            <div className={!_.isEmpty(selectedInbox) ? 'content' : ''} style={{height: 'calc(100% - 60px - '+(height+50)+'px)'}}>
                {_.isEmpty(selectedInbox) && <div>Select an user to see the conversation</div>}
                {<>
                    {!_.isEmpty(error) && <div className={'error message'}>{error.message}</div>}
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
            <div className='message-text-input' style={{height: (height + 50)+'px'}} key={'text-field'}>
                <textarea type={'text'} value={text} style={{height: height+'px'}} onKeyDown={async e => {

                    if (text && text.trim() && !_.isEmpty(selectedInbox) && e.key === 'Enter' && e.shiftKey === false) {
                        setSending(true);
                        setText('');
                        setTitle('');
                        setFiles([]);
                        setSend(false);
                        const e = await sendNotification(text, 'xxx', selectedInbox.url, selectedInbox.inbox, files);
                        setError(e);
                        const n = await getNotificationsFromFolder(await getOutbox(), await getWebId(), notifications.map(n => _.last(n.url.split('/'))))
                        console.log(_.reverse(_.sortBy(_.concat(_.differenceBy(n, notifications, JSON.stringify), notifications), 'time')))
                        setNotifications(_.reverse(_.sortBy(_.concat(_.differenceBy(n, notifications, JSON.stringify), notifications), 'time')))
                        setSending(false)
                    } else {
                        setHeight(Math.min(e.target.scrollHeight, 300));
                    }

                }} onChange={e=> {
                    if (!sending) setText(e.target.value)
                }
                } />
                {<div className='message' key={'wth'}>

                    <div className="chat-actions">
                        <span style={{padding: '0!important' }} colSpan={1}><input onChange={e => setFiles(e.target.files)} className='btn btn-success' type="file" id="fileArea"  multiple/></span>
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
                    </div>
                </div>}
            </div>
        </div>
    </div>
}
export default Chat;
