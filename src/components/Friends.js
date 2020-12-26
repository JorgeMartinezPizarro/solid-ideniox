import React, {useState, useEffect} from 'react';
import {LiveUpdate, useLDflexList, List, useLDflex} from '@solid/react';
import data from '@solid/query-ldflex';
import _ from 'lodash'
import {Button} from "react-bootstrap";
export default () => {

    const loadFriends = useLDflexList('user.knows', false);

    const [friends, setFriends] = useState(loadFriends);

    const [newFriend, setNewFriend] = useState("");

    const addFriend = () => {
        data.user.knows.add(newFriend).then(() => {
            setNewFriend("");
            setFriends(_.merge(friends, [newFriend]));
        }).catch(console.error)

    }

    const deleteFriend = async (friend) => {
        await data.user.knows.delete(friend);
    }

    useEffect(() => {
        setFriends(loadFriends);
    });

    return <>
        <table>
        {_.map(friends, friend => {
            return <tr>
                <td>{friend.toString()}</td>
                <td><Button variant="danger" onClick={() => deleteFriend(friend)}>delete</Button></td>
            </tr>
        })}

            <tr>
                <td><input type="text" value={newFriend} onChange={e => setNewFriend(e.target.value)}/></td>
                <td><Button onClick={addFriend}>add friend</Button></td>
            </tr>
        </table>
    </>
}
