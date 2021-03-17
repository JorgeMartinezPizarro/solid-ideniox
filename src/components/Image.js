import React, { useState, useEffect } from 'react';
import {readFile} from "../api/explore";

export default Image = (props) => {
    const {url} = props;

    const [content, setContent] = useState(undefined);

    useEffect(() => {
        readFile(url).then(content => {
            if (typeof content === 'object') {
                const urlCreator = window.URL || window.webkitURL;
                const imageUrl = urlCreator.createObjectURL(content);
                setContent(<img style={{width: '100%', height: 'auto'}} src={imageUrl} />);
            }
        })

    }, [])

    if (content === undefined) {
        return <div>Loading</div>

    }
    else return content;

}
