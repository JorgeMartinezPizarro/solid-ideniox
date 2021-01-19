import React, { useState, useEffect } from 'react';

import { Button, Container, Row, Table } from 'react-bootstrap';

import _ from 'lodash';

import {getProfile} from '../api/things'

export default () => {

    const [currentCard, setCurrentCard] = useState({});

    useEffect(() => {
        getProfile().then(card => {
            setCurrentCard(card)
        })
    }, [])

    const renderObject = (card) => {
        return <Table className={'explore-table'}>
            <tbody>
                {_.map(card, (values, property) => {
                    return <>
                        <tr>
                            <td>{property}</td>
                            <td></td>
                        </tr>
                        {_.map(values, value => {
                            if (value.type === 'Literal')
                                return <tr>
                                    <td></td>
                                    <td>{value.value}</td>
                                </tr>
                            else if (value[value.value]){
                                return <tr>
                                    <td>&nbsp;{value.value}</td>
                                    <td>{_.map(value[value.value], renderObject)}</td>
                                </tr>
                            }
                            else {
                                return <tr>
                                    <td></td>
                                    <td><a href={value.value}>{value.value}</a></td>
                                </tr>
                            }
                        })}
                    </>

                })}
            </tbody>
        </Table>
    }

    return <Container>
        <div>Edit your contact information</div>
        {_.map(currentCard, (card, webId) => {
            return renderObject(card)
        })}
    </Container>
}
