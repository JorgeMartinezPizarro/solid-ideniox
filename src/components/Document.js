import {Table} from "react-bootstrap";

import React from "react";

import _ from 'lodash';

export default ({profile}) => {

    const groupedProfile = _.groupBy(profile, 'subject');

    return <>
        <div>Show {profile.length}</div>
        <Table className={'document-view'}>
            <thead>
            </thead>
            <tbody>
                {_.map(groupedProfile, (profile, key) => {
                    console.log(profile)
                    return <>
                        <tr>
                            <td colSpan={3}>{key}</td>
                        </tr>
                        {_.map(profile, p => {
                            return <tr>
                                <td></td>
                                <td>{p.predicate}</td>
                                <td>{p.object}</td>
                            </tr>
                        })}
                    </>
                })}
            </tbody>
        </Table>
    </>
}
