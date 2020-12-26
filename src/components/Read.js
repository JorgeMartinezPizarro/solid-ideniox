import React from 'react';
import { useLDflex } from '@solid/react';

export default () => {
    const [name, pending, error] = useLDflex('user', false);

    return (
        <div>
            <p>{name && name.name}</p>
            <p>{name && name.toString()}</p>
            <p>{pending ? "loading" : "finished loading"}</p>
            <p>{error && error.toString()}</p>
        </div>
    );
}
