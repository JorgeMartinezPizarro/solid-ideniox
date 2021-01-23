import React, {useState, useEffect} from 'react';
import {Button, Container, Table} from 'react-bootstrap';
import _ from 'lodash';

import {getValues, addValue, removeValue} from '../api/user'

import {getResource} from "../api/things";

import Document from './Document';


const Resource = () => {

    const [document, setDocument] = useState('');

    const [path, setPath] = useState('');

    const [currentValues, setCurrentValues] = useState([]);

    const [typeValue, setTypeValue] = useState('');

    const [profile, setProfile] = useState([])

    const [error, setError] = useState({})



    useEffect(() => {
        getValues().then(values => setCurrentValues(values));
        setDocument('https://jorge.pod.ideniox.com/ejemplo.ttl');
        setPath('foaf:name');
    }, []);

    return (
        <Container>

            <Table className={'explore-table'}>
                <tbody>
                    <tr style={{height: '0'}}>
                        <td style={{width: '40%'}}>&nbsp;</td>
                        <td style={{width: '40%'}}>&nbsp;</td>
                        <td style={{width: '50px'}}>&nbsp;</td>
                    </tr>
                    {!_.isEmpty(error) && <tr><td colSpan={3}>{JSON.stringify(error)}</td></tr>}
                    <tr>
                        <td className={'resource-input'}>
                            <input type={'text'} value={document} onChange={e => {
                                setDocument(e.target.value)
                            }} />
                        </td>
                        <td className={'resource-input'}>
                            <input type={'text'} value={path} onChange={e => {
                            setPath(e.target.value)
                            }} />
                        </td>
                        <td className={'icons'}>
                            <Button onClick={async ()=> {
                                if (!_.isEmpty(document)) {
                                    const a = await getResource(document);
                                    setProfile(a.values)
                                    setError(a.error)
                                }
                                if (!_.isEmpty(path) && !_.isEmpty(document)) {
                                    const x = await getValues(document, path);
                                    setCurrentValues(x)
                                }
                            }}><span className="material-icons">search</span></Button>
                        </td>
                    </tr>
                    <tr key='addNickname'>
                        <td className={'resource-input'} colSpan={2}><input type="text" value={typeValue} onChange={e => setTypeValue(e.target.value)}/></td>
                        <td className={'icons'}><Button onClick={ async () => {
                            if (_.isEmpty(typeValue)) return;
                            await addValue(typeValue, document, path);
                            setCurrentValues(await getValues(document, path));
                            const a = await getResource(document);
                            setProfile(a.values)
                            setError(a.error)
                            setTypeValue('');
                        }}><span className="material-icons">add</span></Button></td>
                    </tr>
                    {currentValues.map((nick, i) => (
                        <tr key={i}>
                            <td colSpan={2}>
                                {JSON.stringify(nick)}
                            </td>
                            <td className={'icons'}>
                                <Button variant="danger" onClick={async () => {
                                    console.log('delete' , nick, document, path)
                                    await removeValue(nick, document, path)
                                    setCurrentValues(await getValues(document, path))
                                    const a = await getResource(document)
                                    setProfile(a.values)
                                    setError(a.error)
                                }}><span className="material-icons">delete</span></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {!_.isEmpty(profile) && <Document profile={profile}/>}
        </Container>
    );
}

export default Resource;
