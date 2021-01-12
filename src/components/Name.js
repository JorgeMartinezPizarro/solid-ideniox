import React, { useState } from 'react';

import { Button, Container, Row, Table } from 'react-bootstrap';

import _ from 'lodash';

import {setValue, getValues} from '../api/user'

export default () => {
    const [document, setDocument] = useState('')
    const [path, setPath] = useState('')
    const [currentValue, setCurrentValue] = useState('')
    const [loadedValue, setLoadedValue] = useState([])

    return <Container>

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
