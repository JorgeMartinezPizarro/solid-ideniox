import React from 'react';
import {
    AuthButton, LoggedIn, LoggedOut,
    Value, Image, List, Link, Label,
    Like,
} from '@solid/react';

export default function App() {
    return (
        <div>
            <h2>Profile</h2>
            <Image src="user.image" defaultSrc="profile.svg" className="profile"/>
            <p>Welcome back, <Value src="user.name"/>.</p>
            <h2>Friends</h2>
            <List src="user.friends.firstName"/>
            <Label src="https://jorge.pod.ideniox.com/profile/#me"/> {' '}
            <Link href="[https://jorge.pod.ideniox.com/profile/#me].homepage"/>
        </div>
    );
}
