import React, {useState, useEffect} from 'react';

import { Card, Button, Container, Row, Spinner } from 'react-bootstrap';

import _ from 'lodash';

import Profile from './Profile';

import {
    getFriends, getWebId,
} from "../api/friends";

import {
    getCard
} from "../api/user";


const User = () => {

    const [userData, setUserData] = useState({});
    const [friendsData, setFriendsData] = useState([]);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        getWebId().then(webId=>getFriends(webId).then(setFriendsData))
    }, []);

    useEffect(() => {
        getCard().then(setUserData);
    }, [])

    if (editing) {
        return <Container>
            <Row style={{display: 'flex', flexDirection: 'row-reverse'}}><Button onClick={() => setEditing(!editing)}><span className="material-icons">arrow_back</span></Button></Row>
            <Row><Profile /></Row>
        </Container>
    }

    return <Container>
        <Row style={{display: 'flex', flexDirection: 'row-reverse'}}><Button onClick={() => setEditing(!editing)}><span className="material-icons">edit</span></Button></Row>
        <Row key={'1'}>User</Row>
        {_.isEmpty(userData) && <Row><Spinner animation="border" /></Row>}
        {!_.isEmpty(userData) && <Row>
            <ul className={'user-list'}>
                <li key={'image'}><img alt='' src={userData.image.values[0]} /></li>
                <li key={'name'}>{userData.name.values[0]}</li>
                <li key={'role'}>{userData.role.values[0]}</li>
                <li key={'organization'}>{userData.organization.values[0]}</li>
                <li key={'address'}>Address</li>
                {_.map(userData.address.values, (a, key) => <li key={'address-'+key}>
                    <ul>{_.map(a, (b, key2) => {
                        return <li key={key2}>{b}</li>
                    })}</ul>
                </li>)}
                <li key={'phone'}>Phone</li>
                {_.map(userData.phone.values, (a, key) => <li key={'phone-'+key}>
                    <ul>{_.map(a, (b, key2) => {
                        return <li key={key2}>{b}</li>
                    })}</ul>
                </li>)}
                <li key={'mail'}>Mail</li>
                {_.map(userData.email.values, (a, key) => <li key={'email-'+key}>
                    <ul>{_.map(a, (b, key2) => {
                        return <li key={key2}>{b}</li>
                    })}</ul>
                </li>)}
            </ul>
        </Row>}
        <Row>Friends</Row>
        {_.isEmpty(friendsData) && <Row key={'loading-friends'}><Spinner key='2' animation="border" /></Row>}
        {!_.isEmpty(friendsData) && <Row key={'friends-data'}>{friendsData.map(friend => {
            return <Card className='ml_friend-foto'>
                    <Card.Img  variant="top" src={friend.image} />
                    <Card.Body>
                        <Card.Title>{friend.name}</Card.Title>
                        <Card.Text>
                            Friends ({_.size(friend.friends)})
                        </Card.Text>
                        <a href={friend.url} ><Button variant="primary">View</Button></a>
                    </Card.Body>
            </Card>


        })}</Row>}

    </Container>
}
export default User;
