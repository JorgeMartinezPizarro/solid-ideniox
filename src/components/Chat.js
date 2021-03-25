import React, { Component } from 'react';
import {getWebId} from "../api/explore";
import {getInboxes, sendNotification, createFriendDir, addValue, existFriendFolder} from "../api/things";
import {Button, Image, Spinner} from "react-bootstrap";
import Explore from './Explore'
import Profile from './Profile'
import MyImage from './Image'
import {AuthButton} from '@solid/react'
import _ from 'lodash'
import md5 from 'md5';

import {Notification} from "../api/notification";

let socket = undefined

const icons = ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '😗', '😙', '😚', '☺', '🙂', '🤗', '🤔', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴', '😌', '🤓', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '😬', '😰', '😱', '😳', '😵', '😡', '😠', '😇', '🤠', '🤡', '🤥', '😷', '🤒', '🤕', '🤢', '🤧', '😈', '👿', '👹', '👺', '💀', '☠', '👻', '👽', '👾', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👦', '👦🏻', '👦🏼', '👦🏽', '👦🏾', '👦🏿', '👧', '👧🏻', '👧🏼', '👧🏽', '👧🏾', '👧🏿', '👨', '👨🏻', '👨🏼', '👨🏽', '👨🏾', '👨🏿', '👩', '👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿', '👴', '👴🏻', '👴🏼', '👴🏽', '👴🏾', '👴🏿', '👵', '👵🏻', '👵🏼', '👵🏽', '👵🏾', '👵🏿', '👶', '👶🏻', '👶🏼', '👶🏽', '👶🏾', '👶🏿', '👼', '👼🏻', '👼🏼', '👼🏽', '👼🏾', '👼🏿', '👮', '👮🏻', '👮🏼', '👮🏽', '👮🏾', '👮🏿', '🕵', '🕵🏻', '🕵🏼', '🕵🏽', '🕵🏾', '🕵🏿', '💂', '💂🏻', '💂🏼', '💂🏽', '💂🏾', '💂🏿', '👷', '👷🏻', '👷🏼', '👷🏽', '👷🏾', '👷🏿', '👳', '👳🏻', '👳🏼', '👳🏽', '👳🏾', '👳🏿', '👱', '👱🏻', '👱🏼', '👱🏽', '👱🏾', '👱🏿', '🎅', '🎅🏻', '🎅🏼', '🎅🏽', '🎅🏾', '🎅🏿', '🤶', '🤶🏻', '🤶🏼', '🤶🏽', '🤶🏾', '🤶🏿', '👸', '👸🏻', '👸🏼', '👸🏽', '👸🏾', '👸🏿', '🤴', '🤴🏻', '🤴🏼', '🤴🏽', '🤴🏾', '🤴🏿', '👰', '👰🏻', '👰🏼', '👰🏽', '👰🏾', '👰🏿', '🤵', '🤵🏻', '🤵🏼', '🤵🏽', '🤵🏾', '🤵🏿', '🤰', '🤰🏻', '🤰🏼', '🤰🏽', '🤰🏾', '🤰🏿', '👲', '👲🏻', '👲🏼', '👲🏽', '👲🏾', '👲🏿', '🙍', '🙍🏻', '🙍🏼', '🙍🏽', '🙍🏾', '🙍🏿', '🙎', '🙎🏻', '🙎🏼', '🙎🏽', '🙎🏾', '🙎🏿', '🙅', '🙅🏻', '🙅🏼', '🙅🏽', '🙅🏾', '🙅🏿', '🙆', '🙆🏻', '🙆🏼', '🙆🏽', '🙆🏾', '🙆🏿', '💁', '💁🏻', '💁🏼', '💁🏽', '💁🏾', '💁🏿', '🙋', '🙋🏻', '🙋🏼', '🙋🏽', '🙋🏾', '🙋🏿', '🙇', '🙇🏻', '🙇🏼', '🙇🏽', '🙇🏾', '🙇🏿', '🤦', '🤦🏻', '🤦🏼', '🤦🏽', '🤦🏾', '🤦🏿', '🤷', '🤷🏻', '🤷🏼', '🤷🏽', '🤷🏾', '🤷🏿', '💆', '💆🏻', '💆🏼', '💆🏽', '💆🏾', '💆🏿', '💇', '💇🏻', '💇🏼', '💇🏽', '💇🏾', '💇🏿', '🚶', '🚶🏻', '🚶🏼', '🚶🏽', '🚶🏾', '🚶🏿', '🏃', '🏃🏻', '🏃🏼', '🏃🏽', '🏃🏾', '🏃🏿', '💃', '💃🏻', '💃🏼', '💃🏽', '💃🏾', '💃🏿', '🕺', '🕺🏻', '🕺🏼', '🕺🏽', '🕺🏾', '🕺🏿', '👯', '🕴', '🗣', '👤', '👥', '🤺', '🏇', '⛷', '🏂', '🏌', '🏄', '🏄🏻', '🏄🏼', '🏄🏽', '🏄🏾', '🏄🏿', '🚣', '🚣🏻', '🚣🏼', '🚣🏽', '🚣🏾', '🚣🏿', '🏊', '🏊🏻', '🏊🏼', '🏊🏽', '🏊🏾', '🏊🏿', '⛹', '⛹🏻', '⛹🏼', '⛹🏽', '⛹🏾', '⛹🏿', '🏋', '🏋🏻', '🏋🏼', '🏋🏽', '🏋🏾', '🏋🏿', '🚴', '🚴🏻', '🚴🏼', '🚴🏽', '🚴🏾', '🚴🏿', '🚵', '🚵🏻', '🚵🏼', '🚵🏽', '🚵🏾', '🚵🏿', '🏎', '🏍', '🤸', '🤸🏻', '🤸🏼', '🤸🏽', '🤸🏾', '🤸🏿', '🤼', '🤼🏻', '🤼🏼', '🤼🏽', '🤼🏾', '🤼🏿', '🤽', '🤽🏻', '🤽🏼', '🤽🏽', '🤽🏾', '🤽🏿', '🤾', '🤾🏻', '🤾🏼', '🤾🏽', '🤾🏾', '🤾🏿', '🤹', '🤹🏻', '🤹🏼', '🤹🏽', '🤹🏾', '🤹🏿', '👫', '👬', '👭', '💏', '👩‍❤️‍💋‍👨', '👨‍❤️‍💋‍👨', '👩‍❤️‍💋‍👩', '💑', '👩‍❤️‍👨', '👨‍❤️‍👨', '👩‍❤️‍👩', '👪', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👨‍👦', '👨‍👨‍👧', '👨‍👨‍👧‍👦', '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', '🏻', '🏼', '🏽', '🏾', '🏿', '💪', '💪🏻', '💪🏼', '💪🏽', '💪🏾', '💪🏿', '🤳', '🤳🏻', '🤳🏼', '🤳🏽', '🤳🏾', '🤳🏿', '👈', '👈🏻', '👈🏼', '👈🏽', '👈🏾', '👈🏿', '👉', '👉🏻', '👉🏼', '👉🏽', '👉🏾', '👉🏿', '☝', '☝🏻', '☝🏼', '☝🏽', '☝🏾', '☝🏿', '👆', '👆🏻', '👆🏼', '👆🏽', '👆🏾', '👆🏿', '🖕', '🖕🏻', '🖕🏼', '🖕🏽', '🖕🏾', '🖕🏿', '👇', '👇🏻', '👇🏼', '👇🏽', '👇🏾', '👇🏿', '✌', '✌🏻', '✌🏼', '✌🏽', '✌🏾', '✌🏿', '🤞', '🤞🏻', '🤞🏼', '🤞🏽', '🤞🏾', '🤞🏿', '🖖', '🖖🏻', '🖖🏼', '🖖🏽', '🖖🏾', '🖖🏿', '🤘', '🤘🏻', '🤘🏼', '🤘🏽', '🤘🏾', '🤘🏿', '🤙', '🤙🏻', '🤙🏼', '🤙🏽', '🤙🏾', '🤙🏿', '🖐', '🖐🏻', '🖐🏼', '🖐🏽', '🖐🏾', '🖐🏿', '✋', '✋🏻', '✋🏼', '✋🏽', '✋🏾', '✋🏿', '👌', '👌🏻', '👌🏼', '👌🏽', '👌🏾', '👌🏿', '👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿', '👎', '👎🏻', '👎🏼', '👎🏽', '👎🏾', '👎🏿', '✊', '✊🏻', '✊🏼', '✊🏽', '✊🏾', '✊🏿', '👊', '👊🏻', '👊🏼', '👊🏽', '👊🏾', '👊🏿', '🤛', '🤛🏻', '🤛🏼', '🤛🏽', '🤛🏾', '🤛🏿', '🤜', '🤜🏻', '🤜🏼', '🤜🏽', '🤜🏾', '🤜🏿', '🤚', '🤚🏻', '🤚🏼', '🤚🏽', '🤚🏾', '🤚🏿', '👋', '👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿', '👏', '👏🏻', '👏🏼', '👏🏽', '👏🏾', '👏🏿', '✍', '✍🏻', '✍🏼', '✍🏽', '✍🏾', '✍🏿', '👐', '👐🏻', '👐🏼', '👐🏽', '👐🏾', '👐🏿', '🙌', '🙌🏻', '🙌🏼', '🙌🏽', '🙌🏾', '🙌🏿', '🙏', '🙏🏻', '🙏🏼', '🙏🏽', '🙏🏾', '🙏🏿', '🤝', '🤝🏻', '🤝🏼', '🤝🏽', '🤝🏾', '🤝🏿', '💅', '💅🏻', '💅🏼', '💅🏽', '💅🏾', '💅🏿', '👂', '👂🏻', '👂🏼', '👂🏽', '👂🏾', '👂🏿', '👃', '👃🏻', '👃🏼', '👃🏽', '👃🏾', '👃🏿', '👣', '👀', '👁', '👁‍🗨', '👅', '👄', '💋', '💘', '❤', '💓', '💔', '💕', '💖', '💗', '💙', '💚', '💛', '💜', '🖤', '💝', '💞', '💟', '❣', '💌', '💤', '💢', '💣', '💥', '💦', '💨', '💫', '💬', '🗨', '🗯', '💭', '🕳', '👓', '🕶', '👔', '👕', '👖', '👗', '👘', '👙', '👚', '👛', '👜', '👝', '🛍', '🎒', '👞', '👟', '👠', '👡', '👢', '👑', '👒', '🎩', '🎓', '⛑', '📿', '💄', '💍', '💎', '🐵', '🐒', '🦍', '🐶', '🐕', '🐩', '🐺', '🦊', '🐱', '🐈', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦌', '🦄', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🐘', '🦏', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿', '🦇', '🐻', '🐨', '🐼', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊', '🦅', '🦆', '🦉', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🐳', '🐋', '🐬', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🦀', '🦐', '🦑', '🦋', '🐌', '🐛', '🐜', '🐝', '🐞', '🕷', '🕸', '🦂', '💐', '🌸', '💮', '🏵', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘', '🍀', '🍁', '🍂', '🍃', '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶', '🥒', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥞', '🧀', '🍖', '🍗', '🥓', '🍔', '🍟', '🍕', '🌭', '🌮', '🌯', '🥙', '🥚', '🍳', '🥘', '🍲', '🥗', '🍿', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🍡', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🍽', '🍴', '🥄', '🔪', '🏺', '🌍', '🌎', '🌏', '🌐', '🗺', '🗾', '🏔', '⛰', '🌋', '🗻', '🏕', '🏖', '🏜', '🏝', '🏞', '🏟', '🏛', '🏗', '🏘', '🏙', '🏚', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽', '⛪', '🕌', '🕍', '⛩', '🕋', '⛲', '⛺', '🌁', '🌃', '🌄', '🌅', '🌆', '🌇', '🌉', '♨', '🌌', '🎠', '🎡', '🎢', '💈', '🎪', '🎭', '🖼', '🎨', '🎰', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🚲', '🛴', '🛵', '🚏', '🛣', '🛤', '⛽', '🚨', '🚥', '🚦', '🚧', '🛑', '⚓', '⛵', '🛶', '🚤', '🛳', '⛴', '🛥', '🚢', '✈', '🛩', '🛫', '🛬', '💺', '🚁', '🚟', '🚠', '🚡', '🚀', '🛰', '🛎', '🚪', '🛌', '🛏', '🛋', '🚽', '🚿', '🛀', '🛀🏻', '🛀🏼', '🛀🏽', '🛀🏾', '🛀🏿', '🛁', '⌛', '⏳', '⌚', '⏰', '⏱', '⏲', '🕰', '🕛', '🕧', '🕐', '🕜', '🕑', '🕝', '🕒', '🕞', '🕓', '🕟', '🕔', '🕠', '🕕', '🕡', '🕖', '🕢', '🕗', '🕣', '🕘', '🕤', '🕙', '🕥', '🕚', '🕦', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜', '🌡', '☀', '🌝', '🌞', '⭐', '🌟', '🌠', '☁', '⛅', '⛈', '🌤', '🌥', '🌦', '🌧', '🌨', '🌩', '🌪', '🌫', '🌬', '🌀', '🌈', '🌂', '☂', '☔', '⛱', '⚡', '❄', '☃', '⛄', '☄', '🔥', '💧', '🌊', '🎃', '🎄', '🎆', '🎇', '✨', '🎈', '🎉', '🎊', '🎋', '🎍', '🎎', '🎏', '🎐', '🎑', '🎀', '🎁', '🎗', '🎟', '🎫', '🎖', '🏆', '🏅', '🥇', '🥈', '🥉', '⚽', '⚾', '🏀', '🏐', '🏈', '🏉', '🎾', '🎱', '🎳', '🏏', '🏑', '🏒', '🏓', '🏸', '🥊', '🥋', '🥅', '🎯', '⛳', '⛸', '🎣', '🎽', '🎿', '🎮', '🕹', '🎲', '♠', '♥', '♦', '♣', '🃏', '🀄', '🎴', '🔇', '🔈', '🔉', '🔊', '📢', '📣', '📯', '🔔', '🔕', '🎼', '🎵', '🎶', '🎙', '🎚', '🎛', '🎤', '🎧', '📻', '🎷', '🎸', '🎹', '🎺', '🎻', '🥁', '📱', '📲', '☎', '📞', '📟', '📠', '🔋', '🔌', '💻', '🖥', '🖨', '⌨', '🖱', '🖲', '💽', '💾', '💿', '📀', '🎥', '🎞', '📽', '🎬', '📺', '📷', '📸', '📹', '📼', '🔍', '🔎', '🔬', '🔭', '📡', '🕯', '💡', '🔦', '🏮', '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞', '📑', '🔖', '🏷', '💰', '💴', '💵', '💶', '💷', '💸', '💳', '💹', '💱', '💲', '✉', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳', '✏', '✒', '🖋', '🖊', '🖌', '🖍', '📝', '💼', '📁', '📂', '🗂', '📅', '📆', '🗒', '🗓', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇', '📏', '📐', '✂', '🗃', '🗄', '🗑', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝', '🔨', '⛏', '⚒', '🛠', '🗡', '⚔', '🔫', '🏹', '🛡', '🔧', '🔩', '⚙', '🗜', '⚗', '⚖', '🔗', '⛓', '💉', '💊', '🚬', '⚰', '⚱', '🗿', '🛢', '🔮', '🛒', '🏧', '🚮', '🚰', '♿', '🚹', '🚺', '🚻', '🚼', '🚾', '🛂', '🛃', '🛄', '🛅', '⚠', '🚸', '⛔', '🚫', '🚳', '🚭', '🚯', '🚱', '🚷', '📵', '🔞', '☢', '☣', '⬆', '↗', '➡', '↘', '⬇', '↙', '⬅', '↖', '↕', '↔', '↩', '↪', '⤴', '⤵', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐', '⚛', '🕉', '✡', '☸', '☯', '✝', '☦', '☪', '☮', '🕎', '🔯', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '⛎', '🔀', '🔁', '🔂', '▶', '⏩', '⏭', '⏯', '◀', '⏪', '⏮', '🔼', '⏫', '🔽', '⏬', '⏸', '⏹', '⏺', '⏏', '🎦', '🔅', '🔆', '📶', '📳', '📴', '♻', '📛', '⚜', '🔰', '🔱', '⭕', '✅', '☑', '✔', '✖', '❌', '❎', '➕', '➖', '➗', '➰', '➿', '〽', '✳', '✴', '❇', '‼', '⁉', '❓', '❔', '❕', '❗', '〰', '©', '®', '™', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '💯', '🔠', '🔡', '🔢', '🔣', '🔤', '🅰', '🆎', '🅱', '🆑', '🆒', '🆓', 'ℹ', '🆔', 'Ⓜ', '🆕', '🆖', '🅾', '🆗', '🅿', '🆘', '🆙', '🆚', '🈁', '🈂', '🈷', '🈶', '🈯', '🉐', '🈹', '🈚', '🈲', '🉑', '🈸', '🈴', '🈳', '㊗', '㊙', '🈺', '🈵', '▪', '▫', '◻', '◼', '◽', '◾', '⬛', '⬜', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔲', '🔳', '⚪', '⚫', '🔴', '🔵', '🏁', '🚩', '🎌', '🏴', '🏳', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇨', '🇨🇩', '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾', '🇨🇿', '🇩🇪', '🇩🇬', '🇩🇯', '🇩🇰', '🇩🇲', '🇩🇴', '🇩🇿', '🇪🇦', '🇪🇨', '🇪🇪', '🇪🇬', '🇪🇭', '🇪🇷', '🇪🇸', '🇪🇹', '🇪🇺', '🇫🇮', '🇫🇯', '🇫🇰', '🇫🇲', '🇫🇴', '🇫🇷', '🇬🇦', '🇬🇧', '🇬🇩', '🇬🇪', '🇬🇫', '🇬🇬', '🇬🇭', '🇬🇮', '🇬🇱', '🇬🇲', '🇬🇳', '🇬🇵', '🇬🇶', '🇬🇷', '🇬🇸', '🇬🇹', '🇬🇺', '🇬🇼', '🇬🇾', '🇭🇰', '🇭🇲', '🇭🇳', '🇭🇷', '🇭🇹', '🇭🇺', '🇮🇨', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇲', '🇮🇳', '🇮🇴', '🇮🇶', '🇮🇷', '🇮🇸', '🇮🇹', '🇯🇪', '🇯🇲', '🇯🇴', '🇯🇵', '🇰🇪', '🇰🇬', '🇰🇭', '🇰🇮', '🇰🇲', '🇰🇳', '🇰🇵', '🇰🇷', '🇰🇼', '🇰🇾', '🇰🇿', '🇱🇦', '🇱🇧', '🇱🇨', '🇱🇮', '🇱🇰', '🇱🇷', '🇱🇸', '🇱🇹', '🇱🇺', '🇱🇻', '🇱🇾', '🇲🇦', '🇲🇨', '🇲🇩', '🇲🇪', '🇲🇫', '🇲🇬', '🇲🇭', '🇲🇰', '🇲🇱', '🇲🇲', '🇲🇳', '🇲🇴', '🇲🇵', '🇲🇶', '🇲🇷', '🇲🇸', '🇲🇹', '🇲🇺', '🇲🇻', '🇲🇼', '🇲🇽', '🇲🇾', '🇲🇿', '🇳🇦', '🇳🇨', '🇳🇪', '🇳🇫', '🇳🇬', '🇳🇮', '🇳🇱', '🇳🇴', '🇳🇵', '🇳🇷', '🇳🇺', '🇳🇿', '🇴🇲', '🇵🇦', '🇵🇪', '🇵🇫', '🇵🇬', '🇵🇭', '🇵🇰', '🇵🇱', '🇵🇲', '🇵🇳', '🇵🇷', '🇵🇸', '🇵🇹', '🇵🇼', '🇵🇾', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇸', '🇷🇺', '🇷🇼', '🇸🇦', '🇸🇧', '🇸🇨', '🇸🇩', '🇸🇪', '🇸🇬', '🇸🇭', '🇸🇮', '🇸🇯', '🇸🇰', '🇸🇱', '🇸🇲', '🇸🇳', '🇸🇴', '🇸🇷', '🇸🇸', '🇸🇹', '🇸🇻', '🇸🇽', '🇸🇾', '🇸🇿', '🇹🇦', '🇹🇨', '🇹🇩', '🇹🇫', '🇹🇬', '🇹🇭', '🇹🇯', '🇹🇰', '🇹🇱', '🇹🇲', '🇹🇳', '🇹🇴', '🇹🇷', '🇹🇹', '🇹🇻', '🇹🇼', '🇹🇿', '🇺🇦', '🇺🇬', '🇺🇲', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇦', '🇻🇨', '🇻🇪', '🇻🇬', '🇻🇮', '🇻🇳', '🇻🇺', '🇼🇫', '🇼🇸', '🇽🇰', '🇾🇪', '🇾🇹', '🇿🇦', '🇿🇲', '🇿🇼'];

class Chat extends Component {

    constructor(props) {
        super(props)

        this.state = {
            inboxes: [],
            id: '',
            files: [],
            selectedInbox: '',
            currentChatStarted: true,
            notifications: [],
            loading: true,
            title: '',
            showIcons: false,
            text: '',
            send: false,
            error: {},
            height: 41,
            sending: false,
            addingFriend: false,
            friendString: '',
            showFiles: false,
            showMenu: false,
            showSettings: false,
            reloading: false,
            showProfile: false,
        };

        this.notifications = new Notification();
        this.startSocket = this.startSocket.bind(this)
        this.refreshFolder = this.refreshFolder.bind(this);
    }
    async refresh() {
        this.setState({reloading: true})
        const n = await this.notifications.reload()
        this.setState({notifications: n, reloading: false});
    }

    refreshFolder(msg, folder) {
        if (msg.data && msg.data.slice(0, 3) === 'pub' && _.includes(msg.data, folder)) {
            this.setState({reloading: true})
            this.notifications.reloadFolder(folder).then(e => {
                if ( document.hasFocus() && !_.isEmpty(this.state.selectedInbox)){
                    const id = this.state.id
                    const f = this.state.selectedInbox.url === id
                        ? id.replace('/profile/card#me', '/pr8/sent/')
                        : id.replace('/profile/card#me', '/pr8/') + md5(this.state.selectedInbox.url) + '/'
                    if ( f === folder ){
                        this.notifications.markAsRead(this.state.selectedInbox.url).then(n => {
                            this.setState({reloading: false, notifications: n});
                        })
                    }else{
                        this.setState({reloading: false, notifications: e});
                    }
                }else {
                    this.setState({reloading: false, notifications: e});
                }
            })
        }
    }

    startSocket(inboxes, id) {

        console.log("CREATE SOCKET")

        socket = new WebSocket(
            id.replace('https', 'wss').replace('/profile/card#me', ''),
            ['solid-0.1']
        );
        socket.onopen = function() {
            _.forEach(inboxes, inbox => {
                const addressee = inbox.url === id
                    ? inbox.inbox
                    : id.replace('/profile/card#me', '/pr8/') + md5(inbox.url) + '/';
                this.send(`sub ${addressee}log.txt`)
            })
        }
        socket.onmessage = msg => {
            const folder = msg.data.replace('/log.txt', '/').replace('pub ', '')
            this.refreshFolder(msg, folder);
        }

        socket.onerror = error => console.log("SOCKET FAILED", error)
        socket.onclose = close => {
            console.log("SOCKET UNEXPECTEDLY CLOSED", close)
            this.startSocket(inboxes, id)
        }

    }

    componentDidMount() {
        getWebId().then(id => {
            this.setState({id})
            getInboxes().then(inboxes => {
                this.startSocket(inboxes, id)
                this.notifications.load().then(notifications => {

                    this.setState({
                        inboxes,
                        notifications,
                        loading: false,
                    })
                })

            }).catch(e=> this.setState({loading:false , error:e}))

        })
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        const unreadOld = prevState.notifications.filter(n => n.read === 'false').length;
        const unreadNew = this.state.notifications.filter(n => n.read === 'false').length;
        if (unreadOld !== unreadNew) {
            window.document.title = unreadNew ? (unreadNew + ' unread messages') : 'Pod Explorer';
            const audio = new Audio('/notification.mp3');
            try {
                audio.play();
            } catch(e) {}
        }
        if (unreadNew === 0)
            window.document.title = 'Pod Explorer';
    }

    render() {

        const {
            inboxes,
            id,
            files,
            selectedInbox,
            notifications,
            loading,
            showIcons,
            text,
            error,
            height,
            sending,
            addingFriend,
            friendString,

        } = this.state;

        if (loading || _.isEmpty(inboxes))
            return <div className={'app-loading-page'}><img src={'/Logo.png'} className={'app-loading-page-logo'} />
                <div className="lds-roller">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>

        const adding = addingFriend &&  <>
            <div className={'add-modal-wrapper'}/>
            <div className={'add-modal'}>
                <input style={{width: '75%'}}type={'text'} value={friendString} onChange={e => this.setState({friendString: e.target.value})}/>
                <Button onClick={async () => {
                    await addValue('NamedNode', id, 'http://xmlns.com/foaf/0.1/knows', 'NamedNode', friendString);
                    await createFriendDir(friendString);
                    const inboxes = await getInboxes();

                    await this.refresh()
                    this.setState({addingFriend: false, friendString: '', currentChatStarted: true, inboxes})
                }}>Add</Button>
                <Button onClick={() => this.setState({addingFriend: false, friendString: ''})}>Cancel</Button>
            </div>
        </>


        const renderNotifications = x => {

            return <>{x.map(notification => {

                const now = new Date();

                const date = new Date(notification.time)

                const time = now.getDate() === date.getDate()
                    ? (date.getHours() < 10 ? ('0'+date.getHours()) : date.getHours()) + ':' + (date.getMinutes() < 10 ? ('0'+date.getMinutes()) : date.getMinutes())
                    : (date.getHours() < 10 ? ('0'+date.getHours()) : date.getHours()) + ':' + (date.getMinutes() < 10 ? ('0'+date.getMinutes()) : date.getMinutes())
                    + ' ' + date.getDate() + '.' + (date.getUTCMonth() + 1) + '.' + date.getFullYear();

                const z = notification.text.trim().replace(/(?:\r\n|\r|\n)/g, '{{XXX}}').split('{{XXX}}').map(a => <div>{a}</div>)

                return <div key={JSON.stringify(notification)} className={notification.read === 'false' ? 'unread-message message' : 'message'}>

                    <div className={(notification.user === id ? 'own' : 'their') + ' message-text'}>
                        {z}

                        {_.map(notification.attachments, attachment => {
                            const isImage = (attachment.endsWith('.png') || attachment.endsWith('.jpg')|| attachment.endsWith('.jpeg') || attachment.endsWith('.gif'))
                            if (isImage) {
                                return <MyImage url={attachment}/>
                            }
                            return <a title={attachment} target='_blank' rel="noreferrer" className='attachment' href={attachment}><Button variant={'primary'}><span className="material-icons">{isImage ? 'photo' : 'file_present'}</span></Button></a>;
                        })}
                        {_.map(notification.links, attachment => {
                            const isImage = (attachment.endsWith('.png') || attachment.endsWith('.jpg')|| attachment.endsWith('.jpeg') || attachment.endsWith('.gif'))
                            if (isImage) {
                                return <MyImage url={attachment}/>
                            }
                            return <a title={attachment} target='_blank' rel="noreferrer" className='attachment' href={attachment}><Button variant={'primary'}><span className="material-icons">{isImage ? 'photo' : 'file_present'}</span></Button></a>;
                        })}
                        <span onClick={async () => {
                            const x = await this.notifications.delete(notification.url);
                            this.setState({notifications: x});
                        }} className="delete material-icons" title={"Delete message " + notification.url}>close</span>
                        <div style={{textAlign: 'right', fontSize: '70%'}}>{time}</div>
                    </div>
                </div>})}</>
        };

        const getInbox = user => {
            const x = _.find(inboxes, inbox => {
                return inbox.url === user
            });


            return x;
        }

        const groupedNotifications =_.groupBy(notifications, 'users');


        _.forEach(inboxes, inbox => {
            const target = _.find(groupedNotifications, (group, users) => {
                return inbox.url !== id && _.includes(users, inbox.url);
            })
            if (_.isEmpty(target) && _.isEmpty(groupedNotifications[id + ','+inbox.url])) {
                groupedNotifications[id + ','+inbox.url] = [];
            }
        })

        return <div className={'chat-container'} key={'x'}>
            {adding}
            {showIcons && <>
                <div className={'chat-icon-list-wrapper'} onClick={() => this.setState({showIcons: false})} >
                    <div className={'chat-icon-list'}>
                        {icons.map(icon => <div onClick={e => {

                            const t = document.getElementById('message-text-area');
                            const p = t.value.slice(0, t.selectionStart) + icon+ t.value.slice(t.selectionEnd)
                            const newState = {
                                text: p,
                                icon,
                            }

                            if (!e.shiftKey) {
                                newState['showIcons'] = false;
                            }

                            this.setState(newState);
                            e.stopPropagation()

                        }} className={'chat-icon-item'}>{icon}</div>)}
                    </div>
                </div>
            </>}
            <div className={'chat-friends-list'}>
                <div className={'header'}>
                    <Button className="chat-friends-header" onClick={() => {
                        this.setState({showMenu: !this.state.showMenu, showSettings: false, showFiles: false})
                    }} >{!_.isEmpty(id) && <Image roundedCircle src={inboxes.find(inbox=>inbox.url === id).photo} />}</Button>
                    <Button variant={'primary'} onClick={() => this.setState({showFiles: !this.state.showFiles, showMenu: false, showSettings: false})}>
                        <span className="material-icons">{this.state.showFiles ? 'textsms' : 'folder_shared'}</span>
                    </Button>
                    <Button onClick={() => {
                        this.setState({addingFriend: true})
                    }}><span className="material-icons">group_add</span></Button>

                </div>
                <div className={'content'}>
                    {!this.state.showMenu && _.map(groupedNotifications, (n, group) => {
                        const users = group.split(',');

                        let time = '';

                        if (n[0]) {
                            const date = new Date(n[0].time);
                            const now = new Date();

                            time = now.getDate() === date.getDate()
                                ? (date.getHours() < 10 ? ('0'+date.getHours()) : date.getHours()) + ':' + (date.getMinutes() < 10 ? ('0'+date.getMinutes()) : date.getMinutes())
                                : date.getDate() + '.' + (date.getUTCMonth() + 1) + '.' + date.getFullYear();
                        }

                        const user = users.find(u => u !== id) || id;
                        const inbox = getInbox(user);
                        const unread = _.filter(n, x => x.read === 'false').length
                        if (_.isEmpty(inbox) ) return false
                        return <div className={(unread ? 'unread' : '') + ' friend ' + (_.isEqual(selectedInbox, inbox)? 'selected-friend' : '')} key={inbox.url} onClick={async () => {
                            this.setState({selectedInbox: inbox, showFiles: false, showProfile: false,})

                            const currentChatStarted = inbox.url === id || await existFriendFolder(inbox.url);
                            const newN = await this.notifications.markAsRead(inbox.url)
                            this.setState({notifications: newN, error: {}, currentChatStarted});
                            this.setState({error: {}})
                        }}>
                            <div className={'friend-photo'}>
                                <Image src={inbox.photo} roundedCircle/>
                            </div>
                            <div className={'friend-text'}>
                                <div className={'friend-name'}>{inbox.name} {unread > 0 && ` (${unread})`}</div>
                                <div className={'friend-last'}>{n[0] && n[0].text}</div>
                            </div>
                            <div className={'friend-time'}>
                                {time}
                            </div>
                        </div>
                    })}
                    {this.state.showMenu && <div>
                        <div className={this.state.showSettings ? 'friend selected-friend' : 'friend'} onClick={() => this.setState({showSettings: true})}>
                            <div className="menu-title">Settings</div>
                        </div>
                        <div className={'friend'} >
                            <div className="menu-title">
                                <Button onClick={async () => {
                                    this.setState({showMenu: false, showSettings: false})
                                    await this.refresh()
                                }}>Refresh</Button>
                            </div>
                        </div>
                        <div className={'friend'} >
                            <div className="menu-title">
                                <AuthButton id="logout-main" popup="/popup.html" login='' logout='Logout'/>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>
            <div className={(this.state.showFiles || this.state.showMenu || this.state.showProfile) ? 'chat-message-list' : 'chat-message-list chat-message-list-reverse'}>
                {(!this.state.showFiles && !this.state.showMenu) && <div className={'header'}>
                    {!_.isEmpty(selectedInbox) && <Image style={{cursor: 'pointer'}} onClick={() => this.setState({showProfile: !this.state.showProfile})} roundedCircle src={selectedInbox.photo} />}
                    <span>{selectedInbox.name}</span>
                    { this.state.reloading &&
                        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                    }
                </div>}
                {!this.state.showFiles && !this.state.showMenu && !this.state.showProfile && <div className={!_.isEmpty(selectedInbox) ? 'content' : ''} style={{height: 'calc(100% - 60px - '+(height+70)+'px)'}}>
                    {_.isEmpty(selectedInbox) && <div className={'no-user-selected'}>Select an user to see the conversation</div>}
                    {<>
                        {!_.isEmpty(error) && <div className={'error message'}><div className={'message-text'}>{error.message}</div></div>}
                        {_.map(groupedNotifications, (notifications, users) => {
                            const a = _.sortBy(users.split(','))
                            const b = _.sortBy([selectedInbox.url, id])
                            if (!_.isEqual(a, b)) {
                                return;
                            }
                            return <>

                                {renderNotifications(notifications)}
                                {!this.state.currentChatStarted && <div className={'message'}>
                                    <div className={'message-text'}>
                                        <a onClick={async () => {
                                            try {
                                                await createFriendDir(selectedInbox.url);
                                            } catch(e) {console.error(e)}
                                            this.setState({currentChatStarted: true});
                                            return false;
                                        }} href={'/#'}>
                                            Click here to start a chat.
                                        </a>
                                    </div>
                                </div>}
                            </>
                        })}
                    </>}
                </div>}
                {!_.isEmpty(selectedInbox) && this.state.showProfile && <div className={'content'}>
                    <div>{selectedInbox.url}</div>
                    <Image roundedCircle src={selectedInbox.photo} style={{width: '250px', height: '250px'}}/>
                    <div>{selectedInbox.name}</div>

                </div>}
                {this.state.showFiles && <Explore inbox={selectedInbox} />}
                {this.state.showSettings && <Profile />}

                {!this.state.showFiles && !this.state.showMenu && !this.state.showProfile && <div className='message-text-input' style={{height: (height + 70)+'px'}} key={'text-field'}>
                <textarea
                    id='message-text-area'
                    type={'text'}
                    value={text}
                    style={{height: height+'px',
                        overflowY:height===300?'scroll':"hidden"}}
                    onFocus={async e => {
                        const newN = await this.notifications.markAsRead(selectedInbox.url);
                        this.setState({notifications: newN});
                    }}
                    onKeyDown={async e => {

                        if (text && text.trim() && !_.isEmpty(selectedInbox) && e.key === 'Enter' && e.shiftKey === false) {

                            this.setState({
                                sending: true,
                                text: '',
                                height: 41,
                                files: [],
                                send: true,
                            })
                            const e = await sendNotification(text, 'xxx', selectedInbox.url, selectedInbox.inbox, files);
                            this.setState({
                                send: false,
                                sending: false,
                                error: e
                            })

                        } else {
                            this.setState({height: Math.min(e.target.scrollHeight, 300)});
                        }

                    }} onChange={e=> {
                    if (!sending) this.setState({text: e.target.value})
                }
                } />
                    {<div className='chat-icons' key={'wth'}>

                        <div className="chat-actions">
                            <span>{files.length > 0 && files.length + ' files '}</span>

                            <Button onClick={e => {
                                this.setState({showIcons: true})
                                e.stopPropagation();
                            }} className='emoji' variant={'warning'}>
                                <span className={'selected-icon'}>{icons[0]}</span>
                            </Button>

                            <Button style={{marginRight: '0'}} onClick={() => document.getElementById('fileArea').click()} variant={'primary'}>
                                <span className="material-icons">attach_file</span>
                                <input onChange={e => this.setState({files: e.target.files})} className='btn btn-success' type="file" id="fileArea"  multiple />
                            </Button>

                            <Button key='button' disabled={!text || !selectedInbox} onClick={async () => {
                                this.setState({
                                    sending: true,
                                    text: '',
                                    height: 41,
                                    files: [],
                                })
                                const e = await sendNotification(text, 'xxx', selectedInbox.url, selectedInbox.inbox, files);
                                this.setState({
                                    send: false,
                                    sending: false,
                                    error: e,
                                })

                            }}><span className="material-icons">send</span></Button>
                        </div>
                    </div>}
                </div>}
            </div>
        </div>
    }
}
export default Chat;
