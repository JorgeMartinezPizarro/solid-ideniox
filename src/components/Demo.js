import React from 'react';
import {
    AuthButton, LoggedIn, LoggedOut,
    Value, Image, List, Link, Label,
    Like, Follow
} from '@solid/react';

export default function App() {
    return (
        <div>
            <h2>Depiction</h2>
            <Image className='ml_image' src="user.image" defaultSrc="favicon.ico" height="100" width="100" />
            <h2>Profile</h2>
            <p>Hi, <Value src="user.name"/>.</p>
            <h2>Friends</h2>
            <List src="user.knows"/>
            <h2>Name</h2>
            <Value src="user.name"/>
            <ul>
                <li><Link href="user"/></li>
                <li><Link href="user.inbox">your Pod inbox</Link></li>
            </ul>
            <Follow object="https://ch1ch0.pod.ideniox.com/profile/card#me">Ch1ch0</Follow>
        </div>
    );
}
