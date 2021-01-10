import React, {useState, useEffect} from 'react';

import { Table, Container, Row, Spinner, Button } from 'react-bootstrap';

import {getResource} from "../api/things";


export default () => {

    const [profile, setProfile] = useState([])
    const [error, setError] = useState({})

    const [value, setValue] = useState('')

    useEffect(async ()=>{
        //setProfile(await getResource(va))
    }, [])

    return <Container>
        <Table>
            <tbody>
            <tr>
                <td></td>
                <td></td>
                <td><input type={'text'} value={value} onChange={e=>{setValue(e.target.value)}} /></td>
                <td><Button onClick={async()=> {
                    const a = await getResource(value)
                    setProfile(a.values)
                    setError(a.error)
                }}>Load</Button></td>
            </tr>
            {error && <tr><td>{JSON.stringify(error, null, 2)}</td><td></td><td></td><td></td></tr>}
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
