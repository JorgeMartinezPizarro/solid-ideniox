import React, {useState, useEffect} from 'react';

import { Card, Button, Container, Row, Spinner } from 'react-bootstrap';

import _ from 'lodash';

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

    return <Container>
        <Row>
            <input type={"text"} value={newFriend} onChange={e=>{setNewFriend(e.target.value)}}/>
            <Button variant={"primary"} onClick={async () => {
                await addFriend(newFriend);
                const webId = await getWebId();

                const friends = await getFriends(webId);

                const newUserData = await getFriendData(webId);

                setFriendsData(friends);

                setUserData(newUserData);
            }}>Add friend</Button>
        </Row>
        <Row>User</Row>
        {_.isEmpty(userData) && <Row><Spinner animation="border" /></Row>}
        {!_.isEmpty(userData) && <Row>
            <Card className='ml_friend-foto'>
                <Card.Img  variant="top" src={userData.image} />
                <Card.Body>
                    <Card.Title>{userData.name}</Card.Title>
                    <Card.Text>

                    </Card.Text>
                    <a href={userData.url+'me'} ><Button variant="primary">View</Button></a>
                </Card.Body>
            </Card>
        </Row>}
        <Row>Friends</Row>
        {_.isEmpty(friendsData) && <Row><Spinner animation="border" /></Row>}
        {!_.isEmpty(friendsData) && <Row>{friendsData.map(friend => {
            return <Card className='ml_friend-foto'>
                    <Card.Img  variant="top" src={friend.image} />
                    <Card.Body>
                        <Card.Title>{friend.name}</Card.Title>
                        <Card.Text>

                        </Card.Text>
                        <a href={friend.url+'me'} ><Button variant="primary">View</Button></a>
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


        })}</Row>}

    </Container>
}
