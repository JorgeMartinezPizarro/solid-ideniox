import React from 'react'
import {sendNotification} from "../api/things";
import {Button} from "react-bootstrap";
import {Picker} from "emoji-mart";
import _ from 'lodash';
class MessageForm extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            showIcons: false,
            height: 41,
            files: [],
            text: '',
            updateText: false,
        }
    }

    render()  {


        const {
            showIcons, height, text, files,
        } = this.state;


        console.log("Pr8 Load", files);

        const {
            appendNotification, selectedGroup, selectedGroupImage, selectedGroupTitle, selectedInbox, selectedInboxes, markAsRead
        } = this.props;

        return <div className='message-text-input' style={{height: (height + 70) + 'px'}} key={'text-field'}>
                {showIcons && <>
                    <div className={'chat-icon-list-wrapper'}
                         onClick={e => !e.shiftKey && this.setState({showIcons: false})}>
                        <Picker className={'picker-box'} onSelect={e => {

                            const icon = e.native;
                            const t = document.getElementById('message-text-area');
                            const p = t.value.slice(0, t.selectionStart) + icon + t.value.slice(t.selectionEnd)
                            const newState = {
                                text: p,
                            };

                            this.setState(newState);
                        }}/>
                    </div>
                </>}
                <textarea
                    id='message-text-area'
                    value={text}
                    style={{
                        height: height + 'px',
                        overflowY: height === 300 ? 'scroll' : "hidden"
                    }}
                    onFocus={async e => {
                        markAsRead()
                    }}
                    onPaste={async e => {
                        // consider the first item (can be easily extended for multiple items)
                        var item = e.clipboardData.items[0];
                        console.log(e)
                        if (item.type.indexOf("image") === 0) {
                            const blob = item.getAsFile();

                            const file = new File([blob], `screenshot_${files.length}.png`, {
                                type: "image/png",
                                lastModified: new Date().getTime()
                            })

                            this.setState({files: _.merge(files, [file])})
                        }

                    }}
                    onKeyDown={async e => {
                        if ((text && text.trim() || files.length > 0) && (!_.isEmpty(selectedInbox) || selectedGroup) && e.key === 'Enter' && e.shiftKey === false) {
                            this.setState({
                                updateText: false,
                                sending: true,
                                text: '',
                                height: 41,
                                files: [],
                                send: true,
                            })

                            const e = await sendNotification(encodeURI(text), selectedGroup || 'xxx', selectedGroup ? selectedInboxes.map(i => {
                                return {
                                    url: i,
                                    inbox: i.replace('/profile/card#me', '/pr8/')
                                }
                            }) : [selectedInbox], files, [], selectedGroup ? selectedGroupImage : '', selectedGroup ? selectedGroupTitle : '');

                            appendNotification(e);

                        } else {
                            this.setState({updateText: true});
                        }

                    }}

                    onChange={e => {
                        if (this.state.updateText)
                            this.setState({text: e.target.value, height: Math.min(e.target.scrollHeight, 300)})
                    }}
                />
                {<div className='chat-icons' key={'wth'}>

                    <div className="chat-actions">
                        <span>{files.length > 0 && files.length + ' files '}</span>

                        <Button onClick={e => {
                            this.setState({showIcons: true})
                            e.stopPropagation();
                        }} className='emoji' variant={'warning'}>
                            <span className={'selected-icon'}>😀</span>
                        </Button>

                        <Button style={{marginRight: '0'}} onClick={() => document.getElementById('fileArea').click()}
                                variant={'primary'}>
                            <span className="material-icons">attach_file</span>
                            <input onChange={e => this.setState({files: e.target.files})} className='btn btn-success'
                                   type="file" id="fileArea" multiple/>
                        </Button>

                        <Button key='button'
                                disabled={(!text && files.length === 0) || (!selectedInbox && !selectedGroup)}
                                onClick={async () => {
                                    this.setState({
                                        sending: true,
                                        text: '',
                                        height: 41,
                                        files: [],
                                    })
                                    const e = await sendNotification(encodeURI(text), selectedGroup || 'xxx', selectedGroup ? selectedInboxes.map(i => {
                                        return {
                                            url: i,
                                            inbox: i.replace('/profile/card#me', '/pr8/')
                                        }
                                    }) : [selectedInbox], files, [], selectedGroup ? selectedGroupImage : '', selectedGroup ? selectedGroupTitle : '');

                                    appendNotification(e);

                                }}><span className="material-icons">send</span></Button>
                    </div>
                </div>}
            </div>
    }
}

export default MessageForm;
