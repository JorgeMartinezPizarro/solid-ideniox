import React, {useState, useEffect} from 'react';

export default props => {


    const {file, content} = props;

    return <div>
        <div>{file}</div>
        <pre className={'explore-content'}>{content}</pre>
    </div>
}
