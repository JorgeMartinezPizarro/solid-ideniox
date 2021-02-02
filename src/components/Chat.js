import React, {useState, useEffect} from 'react';
import {getFolder, getWebId, uploadFile} from "../api/explore";
import {getInboxes, getNotifications, deleteNotification, markNotificationAsRead, sendNotification, createFriendsDir, getNotificationsFromFolder, getOutbox, setCache} from "../api/things";
import {Button, Container, Image, Dropdown, Spinner, Table} from "react-bootstrap";
import _ from 'lodash'
import md5 from 'md5';

const sockets = {}

const iconsString = '😀 😃 😄 😁 😆 😅 😂 🤣 🥲 ☺️ 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥸 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠 😈 👿 👹 👺 🤡 💩 👻 💀 ☠️ 👽 👾 🤖 🎃 😺 😸 😹 😻 😼 😽 🙀 😿 😾'
const icons = iconsString.split(' ');

const Chat = () => {

    const [inboxes, setInboxes] = useState([])

    const [id, setId] = useState('');

    const [files, setFiles] = useState([]);

    const [selectedInbox, setSelectedInbox] = useState('');

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [showIcons, setShowIcons] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState(icons[0])
    const [text, setText] = useState('')
    const [send, setSend] = useState(false)

    const [error, setError] = useState({})

    const [height, setHeight] = useState(41)
    const [sending, setSending] = useState(false)
    async function refresh() {
        const e = await getNotifications(notifications.map(n => _.last(n.url.split('/'))))
        const n = _.reverse(_.sortBy(_.concat(_.differenceBy(e, notifications, JSON.stringify), notifications), 'time'));
        setNotifications(n)
        await setCache(n)


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
                console.log("Connect socket", addressee);
            };
            sockets[inbox.url].onmessage = async function(msg) {
                if (msg.data && msg.data.slice(0, 3) === 'pub') {
                    const e = await getNotificationsFromFolder(addressee, inbox.url, notifications.map(n => _.last(n.url.split('/'))))
                    const n = _.reverse(_.sortBy(_.concat(e, notifications), 'time'))
                    setNotifications(n)
                    await setCache(n)

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

            //const t = Date.parse(notification.time);

            const now = new Date();

            const date = new Date(notification.time)

            const time = now.getDate() === date.getDate()
                ? (date.getHours() < 10 ? ('0'+date.getHours()) : date.getHours()) + ':' + (date.getMinutes() < 10 ? ('0'+date.getMinutes()) : date.getMinutes())
                : (date.getHours() < 10 ? ('0'+date.getHours()) : date.getHours()) + ':' + (date.getMinutes() < 10 ? ('0'+date.getMinutes()) : date.getMinutes())
                    + ' ' + date.getDate() + '.' + (date.getUTCMonth() + 1) + '.' + date.getFullYear();

            const y = notification.text.trim().replace(/(?:\r\n|\r|\n)/g, '{{XXX}}').split('{{XXX}}').map(a => <div>{a}</div>)

            return <div data-key={notification.url} key={notification.url} className={notification.read === 'false' ? 'unread-message message' : 'message'}>

                <div className={(notification.user === id ? 'own' : 'their') + ' message-text'}>
                    <span onClick={async () => {
                        await deleteNotification(notification.url);
                        const x = notifications.filter(n => n.url !== notification.url)
                        setNotifications(x);
                        await setCache(notifications);
                    }} className="delete material-icons" title={"Delete message " + notification.url}>close</span>
                    {y}
                    {_.map(notification.attachments, attachment => {
                        const isImage = (attachment.endsWith('.png') || attachment.endsWith('.jpg')|| attachment.endsWith('.jpeg'))

                        return <a title={attachment} target='_blank' className='attachment' href={attachment}><Button variant={'dark'}><span className="material-icons">{isImage ? 'photo' : 'file_present'}</span></Button></a>;
                    })}
                </div>
                <div style={{textAlign: 'right', fontSize: '70%'}}>{time}</div>

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
            return inbox.url !== id && _.includes(users, inbox.url);
        })
        if (_.isEmpty(target) && _.isEmpty(groupedNotifications[id + ','+inbox.url])) {
            groupedNotifications[id + ','+inbox.url] = [];
        }
    })

    console.log(showIcons)

    return <div className={'chat-container'} key={'x'}>
        {showIcons && <>
            <div className={'chat-icon-list-wrapper'} onClick={() => setShowIcons(false)} >
                <div className={'chat-icon-list'}>
                    {icons.map(icon => <div onClick={() => {
                        setSelectedIcon(icon)
                        const t = document.getElementById('message-text-area');
                        const p = t.value.slice(0, t.selectionStart) + icon+ t.value.slice(t.selectionEnd)
                        setText(p)
                        setShowIcons(false)
                    }} className={'chat-icon-item'}>{icon}</div>)}
                </div>
            </div>
        </>}
        <div className={'chat-friends-list'}>
            <div className={'header'}>
                <Button onClick={() => createFriendsDir()}><span className="material-icons">contact_mail</span></Button>
                <Button onClick={async () => {
                    await refresh()
                }}><span className="material-icons">refresh</span></Button>

            </div>
            <div className={'content'}>
                {_.map(groupedNotifications, (n, group) => {
                    const users = group.split(',');

                    let time = '';

                    if (n[0]) {
                        const date = new Date(n[0].time);
                        const now = new Date();

                        time = now.getDate() === date.getDate()
                            ? (date.getHours() < 10 ? ('0'+date.getHours()) : date.getHours()) + ':' + (date.getMinutes() < 10 ? ('0'+date.getMinutes()) : date.getMinutes())
                            : date.getDate() + '.' + (date.getUTCMonth() + 1) + '.' + date.getFullYear();
                    }

                    const user = users.find(u => u !== id) || id;
                    const inbox = getInbox(user);
                    const unread = _.filter(n, x => x.read === 'false').length
                    return <div className={(unread ? 'unread' : '') + ' friend ' + (_.isEqual(selectedInbox, inbox)? 'selected-friend' : '')} key={inbox.url} onClick={async () => {

                        setSelectedInbox(inbox);
                        const newN = notifications.map(n=>{
                            n.read='true';
                            return n;
                        });
                        _.forEach(notifications, async n => {
                            if (n.read === 'false') {
                                await markNotificationAsRead(n.url)
                            }
                        })
                        setNotifications(newN);
                        await setCache(newN);
                        setError({})}
                    }>
                        <div className={'friend-photo'}>
                            <Image src={inbox.photo} roundedCircle/>
                        </div>
                        <div className={'friend-text'}>
                            <div className={'friend-name'}>{inbox.name} {unread > 0 && ` (${unread})`}</div>
                            <div className={'friend-last'}>{n[0] && n[0].text}</div>
                        </div>
                        <div className={'friend-time'}>
                            {time}
                        </div>
                    </div>
                })}
            </div>
        </div>
        <div className={'chat-message-list'}>
            <div className={'header'}>
                {!_.isEmpty(selectedInbox) && <Image roundedCircle src={selectedInbox.photo} />}
                {selectedInbox.name}

            </div>
            <div className={!_.isEmpty(selectedInbox) ? 'content' : ''} style={{height: 'calc(100% - 60px - '+(height+70)+'px)'}}>
                {_.isEmpty(selectedInbox) && <div className={'no-user-selected'}>Select an user to see the conversation</div>}
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
            <div className='message-text-input' style={{height: (height + 70)+'px'}} key={'text-field'}>
                <textarea id='message-text-area' type={'text'} value={text} style={{height: height+'px', overflowY:height===300?'scroll':"hidden"}} onKeyDown={async e => {

                    if (text && text.trim() && !_.isEmpty(selectedInbox) && e.key === 'Enter' && e.shiftKey === false) {
                        setSending(true);
                        setText('');
                        setHeight(41);
                        setTitle('');
                        setFiles([]);
                        setSend(false);
                        const e = await sendNotification(text, 'xxx', selectedInbox.url, selectedInbox.inbox, files);
                        setError(e);
                        const n = await getNotificationsFromFolder(await getOutbox(), await getWebId(), notifications.map(n => _.last(n.url.split('/'))))
                        const x = _.reverse(_.sortBy(_.concat(_.differenceBy(n, notifications, JSON.stringify), notifications), 'time'));
                        setNotifications(x)
                        await setCache(x);
                        setSending(false)
                    } else {
                        setHeight(Math.min(e.target.scrollHeight, 300));
                    }

                }} onChange={e=> {
                    if (!sending) setText(e.target.value)
                }
                } />
                {<div className='chat-icons' key={'wth'}>

                    <div className="chat-actions">
                        <span>{files.length > 0 && files.length + ' files '}</span>
                        <Button onClick={e => {
                            setShowIcons(true)
                            e.stopPropagation();
                        }} className='emoji' variant={'warning'}>
                            <span className={'selected-icon'}>{selectedIcon}</span>
                        </Button>

                        <Button style={{marginRight: '0'}} onClick={() => document.getElementById('fileArea').click()} variant={'success'}>
                            <span className="material-icons">attach_file</span>
                            <input onChange={e => setFiles(e.target.files)} className='btn btn-success' type="file" id="fileArea"  multiple />
                        </Button>

                        <Button key='button' disabled={!text || !selectedInbox} onClick={async () => {
                            const e = await sendNotification(text, 'xxx', selectedInbox.url, selectedInbox.inbox, files);
                            setError(e);
                            setText('');
                            setHeight(41);
                            setTitle('');
                            setFiles([]);
                            setSend(false);
                            const x = await getNotificationsFromFolder(await getOutbox(), await getWebId(), notifications.map(n => _.last(n.url.split('/'))))
                            const y = _.reverse(_.sortBy(_.concat(_.differenceBy(e, notifications, JSON.stringify), notifications), 'time'))
                            setNotifications(y)
                            await setCache(y)

                        }}><span className="material-icons">send</span></Button>
                    </div>
                </div>}
            </div>
        </div>
    </div>
}
export default Chat;
