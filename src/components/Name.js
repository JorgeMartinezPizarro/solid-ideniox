import React, {useState, useEffect} from 'react';

import {Button, Spinner, Container, Row, Table} from 'react-bootstrap';

import _ from 'lodash';

import {getName, setName, getProfile, getValue, setValue, getValues} from '../api/user'

export default () => {
    const [userName, setUserName] = useState('')
    const [newName, setNewName] = useState('')
    const [document, setDocument] = useState('')
    const [path, setPath] = useState('')
    const [currentValue, setCurrentValue] = useState('')
    const [loadedValue, setLoadedValue] = useState([])

    useEffect(() => {
        getName().then(setUserName)
    }, []);



    return <Container>

        <Row>Set foaf:name in webID</Row>
        {_.isEmpty(userName) && <Row><Spinner animation="border" /></Row>}
        {!_.isEmpty(userName) && <Row>
            {userName}
            <input
                value={newName}
                onChange={e => {
                    setNewName(e.target.value);
                }}
                type={'text'}
            />
            <Button
                onClick={async () => {
                    await setName(newName);
                    setNewName('');
                    setUserName(newName);
                }}
            >
                Change
            </Button>
        </Row>}
        <Row>Define or read a generic path in a document</Row>
        <Row>
            <Table><tbody>
            <tr>
                <td>Document</td>
                <td>path</td>
                <td>value</td>
            </tr>
            <tr><td><input type={'text'} value={document} onChange={e => {
                setDocument(e.target.value)
            }} /></td><td>
            <input type={'text'} value={path} onChange={e => {
                setPath(e.target.value)
            }} /></td><td>
            <input type={'text'} value={currentValue} onChange={e => {
                setCurrentValue(e.target.value)
            }} /></td><td>
            <Button onClick={async ()=> {
                await setValue(currentValue, document, path)
            }}>Set</Button></td><td>
            <Button onClick={async ()=> {
                await getValues(document, path).then(response => setLoadedValue(response))
            }}>Search</Button></td>
            </tr>
            </tbody></Table>
        </Row>

        {loadedValue.map(v => <Row>{v}</Row>)}

    </Container>
}
