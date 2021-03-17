import React, {useState, useEffect} from 'react';

import {Card, Button, Spinner, Image} from 'react-bootstrap';

import _ from 'lodash';

import {
    getCard
} from "../api/user";


const User = () => {

    const [userData, setUserData] = useState({});

    useEffect(() => {

    }, []);

    useEffect(() => {
        getCard().then(setUserData);
    }, [])


    return <div className='content'>
        <div key={'1'}>User</div>
        {_.isEmpty(userData) && <div><Spinner animation="border" /></div>}
        {!_.isEmpty(userData) && <Card className='ml_friend-foto'>
            <Image variant="top" src={userData.image.values[0]} roundedCircle />
            <Card.Body>
                <Card.Title>{userData.name.values[0]}</Card.Title>
                <Card.Text>
                    Friends ({userData.friends.values.length})
                </Card.Text>
                <a href={userData.id} ><Button variant="primary">View</Button></a>
            </Card.Body>
        </Card>}
    </div>
}
export default User;
