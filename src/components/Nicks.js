import React, {useState} from 'react';
import { LiveUpdate, useLDflexList } from '@solid/react';
import data from '@solid/query-ldflex';
import { Button } from 'react-bootstrap'

const Nicks = () => {
    const savedNicks = useLDflexList('user.nick');
    const [newNick, setNewNick] = useState("");
    const addNick = async () => {
        await data.user.nick.add(newNick);
        setNewNick("");
    }
    const deleteNick = async (nick) => {
        await data.user.nick.delete(nick);
    }
    return (
        <>
            <h3>cool nicknames:</h3>
            {savedNicks.map((nick, i) => (
                <div key={i}>
                    <span>{nick.toString()}</span>
                    <Button variant="danger" onClick={() => deleteNick(nick)}>delete</Button>
                </div>
            ))}
            <input type="text" value={newNick} onChange={e => setNewNick(e.target.value)}/>
            <Button onClick={addNick}>add nickname</Button>
        </>
    );
}

export default () => (
    <LiveUpdate><Nicks/></LiveUpdate>
)
