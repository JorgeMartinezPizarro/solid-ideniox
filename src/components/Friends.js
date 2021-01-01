import React, {useState, useEffect} from 'react';

import { Card, Button } from 'react-bootstrap';

import {
    addFriend,
    getFriendData, getFriends, getWebId, removeFriend,
} from "../api/friends";

export default () => {

    const [userData, setUserData] = useState([]);
    const [friendsData, setFriendsData] = useState([]);

    const [newFriend, setNewFriend] = useState('');

    useEffect(async () => {

        const webId = await getWebId();

        const friends = await getFriends(webId);

        const newUserData = await getFriendData(webId);

        setFriendsData(friends);

        setUserData(newUserData);

    }, []);

    return <>
        <pre>
            User
            {userData.url && <p>{userData.url}</p>}
            {userData.image && <img className={'ml_user-image'} src={userData.image} />}
        </pre>
        {friendsData && friendsData.map(friend => {
            return <Card style={{ width: '18rem' }}>
                    <Card.Img variant="top" src={friend.image} />
                    <Card.Body>
                        <Card.Title>{friend.name}</Card.Title>
                        <Card.Text>

                        </Card.Text>
                        <a href={friend.url} ><Button variant="primary">View</Button></a>
                        <Button variant="danger" onClick={async () => {
                            await removeFriend(friend.url);
                            const webId = await getWebId();

                            const friends = await getFriends(webId);

                            const newUserData = await getFriendData(webId);

                            setFriendsData(friends);

                            setUserData(newUserData);

                        }}>Unfriend</Button>
                    </Card.Body>
                </Card>


        })}
        <div>
            <input type={"text"} value={newFriend} onChange={e=>{setNewFriend(e.target.value)}}/>
            <Button variant={"primary"} onClick={async () => {
                await addFriend(newFriend);
                const webId = await getWebId();

                const friends = await getFriends(webId);

                const newUserData = await getFriendData(webId);

                setFriendsData(friends);

                setUserData(newUserData);
            }}>Add</Button>
        </div>
    </>
}
