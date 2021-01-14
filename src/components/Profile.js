import React, { useState, useEffect } from 'react';

import { Button, Container, Row, Table } from 'react-bootstrap';

import _ from 'lodash';

import {getCard} from '../api/user'

export default () => {

    const [currentCard, setCurrentCard] = useState({});

    useEffect(() => {
        getCard().then(setCurrentCard)
    }, [])

    return <Container>

        <Table className={'explore-table'}>
            <tbody>
                <tr style={{height: '0'}}>
                    <td style={{width: '100px'}}>&nbsp;</td>
                    <td >&nbsp;</td>
                    <td style={{width: '75px'}}>&nbsp;</td>
                </tr>
                {_.map(currentCard, (value, key) => {
                    return <>
                        <tr>
                            <td>{key}</td>
                            <td/>
                            <td>{value.multi && <Button variant={'primary'} ><span className="material-icons">add</span></Button>}</td>
                        </tr>
                        {_.map(value.values, v => <tr>
                            <td></td>
                            <td>
                                {_.isObject(v) && <Table className={'profile-subtable'}>
                                    <tbody>
                                        {_.map(v, (value, key) => {
                                            return <>
                                                <tr>
                                                    <td>{key}</td>
                                                    <td>{!_.isArray(value) && value}</td>
                                                </tr>
                                                {_.isArray(value) && _.map(value, v => <tr>
                                                        <td></td>
                                                        <td>{v.toString()}</td>
                                                </tr>)}
                                            </>;
                                        })}
                                    </tbody>
                                </Table>}
                                {!_.isObject(v) && v}
                            </td>
                            <td><Button variant={'danger'}><span className="material-icons">delete</span></Button></td>
                        </tr>)}
                    </>
                })}
            </tbody>
        </Table>
    </Container>
}
