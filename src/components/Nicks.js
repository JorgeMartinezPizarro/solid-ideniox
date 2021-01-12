import React, {useState, useEffect} from 'react';
import { LiveUpdate, useLDflex } from '@solid/react';
import data from '@solid/query-ldflex';
import {Button, Spinner, Container, Row, Table} from 'react-bootstrap';
import {getValues, setValue, addValue, removeValue} from '../api/user'
import _ from 'lodash';

export default () => {

    const [document, setDocument] = useState('');

    const [path, setPath] = useState('');

    const [currentValues, setCurrentValues] = useState([]);

    const [typeValue, setTypeValue] = useState('');

    useEffect(async () => {
        getValues().then(values => setCurrentValues(values))
    }, []);

    return (
        <Container>

            <Table className={'ml_list'}>
                <tbody>
                    <tr>
                        <td>
                            <input type={'text'} value={document} onChange={e => {
                                setDocument(e.target.value)
                            }} />
                        </td>
                        <td>
                            <input type={'text'} value={path} onChange={e => {
                            setPath(e.target.value)
                            }} />
                        </td>
                        <td>
                            <Button onClick={async ()=> {
                                await getValues(document, path).then(response => setCurrentValues(response))
                            }}>Search</Button></td>
                    </tr>
                    {currentValues.map((nick, i) => (
                        <tr key={i}>
                            <td>{nick.toString()}</td>
                            <td><Button variant="danger" onClick={async () => {
                                await removeValue(nick, document, path)
                                setCurrentValues(await getValues(document, path))

                            }}>delete</Button></td>
                        </tr>
                    ))}
                    <tr key='addNickname'>
                        <td><input type="text" value={typeValue} onChange={e => setTypeValue(e.target.value)}/></td>
                        <td><Button onClick={ async () => {
                            await addValue(typeValue, document, path);
                            setCurrentValues(await getValues(document, path));
                            setTypeValue('');
                        }}>add nickname</Button></td>
                    </tr>
                </tbody>
            </Table>

        </Container>
    );
}

