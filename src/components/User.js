import React, {useState, useEffect} from 'react';

import {Card, Button, Container, Spinner, Image} from 'react-bootstrap';

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


    return <div className='content'>
        <div key={'1'}>User</div>
        {_.isEmpty(userData) && <div><Spinner animation="border" /></div>}
        {!_.isEmpty(userData) && <div>
            <ul className={'user-list'}>
                <li key={'image'}><Image src={userData.image.values[0]} roundedCircle /></li>
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
        </div>}
        <div>Friends</div>
        {_.isEmpty(friendsData) && <div key={'loading-friends'}><Spinner key='2' animation="border" /></div>}
        {!_.isEmpty(friendsData) && <div key={'friends-data'}>{friendsData.map(friend => {
            return <Card className='ml_friend-foto'>
                    <Image variant="top" src={friend.image} roundedCircle />
                    <Card.Body>
                        <Card.Title>{friend.name}</Card.Title>
                        <Card.Text>
                            Friends ({_.size(friend.friends)})
                        </Card.Text>
                        <a href={friend.url} ><Button variant="primary">View</Button></a>
                    </Card.Body>
            </Card>


        })}</div>}

    </div>
}
export default User;
