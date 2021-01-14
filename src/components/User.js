import React, {useState, useEffect} from 'react';

import { Card, Button, Container, Row, Spinner, Table } from 'react-bootstrap';

import _ from 'lodash';

import {
    getFriends, getWebId, removeFriend,
} from "../api/friends";

import {
    getCard
} from "../api/user";


export default () => {

    const [userData, setUserData] = useState({});
    const [friendsData, setFriendsData] = useState([]);

    useEffect(async () => {
        setFriendsData(await getFriends(await getWebId()));
    }, []);

    useEffect(async () => {
        setUserData(await getCard());
    }, [])

    return <Container>
        <Row>User</Row>
        {_.isEmpty(userData) && <Row><Spinner animation="border" /></Row>}
        {!_.isEmpty(userData) && <Row>
            <ul className={'user-list'}>
                <li><img src={userData.image.values[0]} /></li>
                <li>{userData.name.values[0]}</li>
                <li>{userData.role.values[0]}</li>
                <li>{userData.organization.values[0]}</li>
                <li>Address</li>
                {_.map(userData.address.values, a => <li>
                    <ul>{_.map(a, b => {
                        return <li>{b}</li>
                    })}</ul>
                </li>)}
                <li>Phone</li>
                {_.map(userData.phone.values, a => <li>
                    <ul>{_.map(a, b => {
                        return <li>{b}</li>
                    })}</ul>
                </li>)}
                <li>Mail</li>
                {_.map(userData.email.values, a => <li>
                    <ul>{_.map(a, b => {
                        return <li>{b}</li>
                    })}</ul>
                </li>)}
            </ul>
        </Row>}
        <Row>Friends</Row>
        {_.isEmpty(friendsData) && <Row><Spinner animation="border" /></Row>}
        {!_.isEmpty(friendsData) && <Row>{friendsData.map(friend => {
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
