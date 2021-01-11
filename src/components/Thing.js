import React, {useState, useEffect} from 'react';

import { Table, Container, Row, Spinner, Button } from 'react-bootstrap';

import _ from 'lodash';

import {getResource} from "../api/things";

import {getWebId} from '../api/explore'

export default () => {

    const [profile, setProfile] = useState([])
    const [error, setError] = useState({})
    const [value, setValue] = useState('')

    useEffect(() => {
        const x = async () => {
            const webID = await getWebId();
            setValue(webID)
        }
        x()
    }, [])

    return <Container>
        <Table>
            <thead>
                <tr>
                    <th>Graph</th>
                    <th>Subject</th>
                    <th>Predicate</th>
                    <th>Object</th>
                </tr>
            </thead>
            <tbody>
            <tr>
                <td colSpan={3}><input style={{width: '100%'}} type={'text'} value={value} onChange={e=>{setValue(e.target.value)}} /></td>
                <td><Button onClick={async()=> {
                    const a = await getResource(value)
                    setProfile(a.values)
                    setError(a.error)
                }}>Load</Button></td>
            </tr>
            {!_.isEmpty(error) && <tr><td>{JSON.stringify(error, null, 2)}</td><td></td><td></td><td></td></tr>}
            {profile.map(p=> {
                return <tr>
                    <td>{p.graph}</td>
                    <td>{p.subject}</td>
                    <td>{p.predicate}</td>
                    <td>{p.object}</td>
                </tr>
            })}
            </tbody>
        </Table>
    </Container>
}
