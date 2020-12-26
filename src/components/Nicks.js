import React, {useState, useEffect} from 'react';
import { LiveUpdate, useLDflexList } from '@solid/react';
import data from '@solid/query-ldflex';
import { Button } from 'react-bootstrap';
import _ from 'lodash';

const Nicks = () => {
    const savedNicks = useLDflexList('user.nick');

    const [newNick, setNewNick] = useState("");

    const [savedNickList, setSavedNickList] = useState(savedNicks);

    useEffect(() => {
        setSavedNickList(savedNicks);
    });

    const addNick = async () => {
        await data.user.nick.add(newNick);
        setNewNick("");
        setSavedNickList(_.merge(savedNickList, [newNick]))
    }
    const deleteNick = async (nick) => {
        await data.user.nick.delete(nick);
        setSavedNickList(_.filter(savedNickList, savedNick => savedNick !== newNick))
    }

    return (
        <>
            <h3>cool nicknames:</h3>
            <table className={'ml_list'}>
                {savedNickList.map((nick, i) => (
                    <tr key={i}>
                        <td>{nick.toString()}</td>
                        <td><Button variant="danger" onClick={() => deleteNick(nick)}>delete</Button></td>
                    </tr>
                ))}
            </table>
            <input type="text" value={newNick} onChange={e => setNewNick(e.target.value)}/>
            <Button onClick={addNick}>add nickname</Button>
        </>
    );
}

export default () => (
    <LiveUpdate><Nicks/></LiveUpdate>
)
