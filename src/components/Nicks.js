import React, {useState, useEffect} from 'react';
import { LiveUpdate, useLDflex } from '@solid/react';
import data from '@solid/query-ldflex';
import {Button, Spinner, Container, Row, Table} from 'react-bootstrap';
import {getNicks} from '../api/nicks'
import _ from 'lodash';

export default () => {

    const [newNick, setNewNick] = useState("");

    const [savedNickList, setSavedNickList] = useState([]);

    useEffect(async () => {
        getNicks().then(nicks => setSavedNickList(nicks))
    }, []);

    const addNick = async () => {
        await data.user.nick.add(newNick);

        setNewNick("");
        getNicks().then(nicks => setSavedNickList(nicks))
    };

    const deleteNick = async (nick) => {
        await data.user.nick.delete(nick);
        getNicks().then(nicks => setSavedNickList(nicks))
    };

    return (
        <Container>
            <Row>Nicknames</Row>
            <Table className={'ml_list'}>
                <tbody>
                    {savedNickList.map((nick, i) => (
                        <tr key={i}>
                            <td>{nick.toString()}</td>
                            <td><Button variant="danger" onClick={() => deleteNick(nick)}>delete</Button></td>
                        </tr>
                    ))}
                    <tr key='addNickname'>
                        <td><input type="text" value={newNick} onChange={e => setNewNick(e.target.value)}/></td>
                        <td><Button onClick={addNick}>add nickname</Button></td>
                    </tr>
                </tbody>
            </Table>

        </Container>
    );
}

