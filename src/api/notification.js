import {getNotifications, deleteNotification, markNotificationAsRead, setCache, readFile} from "./things";
import {getWebId} from "./friends";
import {readCache} from './things'
import _, { orderBy } from "lodash";
import data from "@solid/query-ldflex";

export class Notification {
    constructor() {
        this.notifications = [];
    }

    async load() {

        const id = await getWebId()

        const cache = id.replace('/profile/card#me','') + '/pr8/cache.json';

        try {
            this.notifications = await readCache(cache)
        }
        catch (e) {
            console.log("ERROR", e)
        }

        const x = this.notifications;

        this.notifications = _.merge(
            this.notifications,
            await getNotifications(this.notifications.map(n => _.last(n.url.split('/'))))
        );

        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')

        if (!_.isEqual(x, this.notifications)) {
            await setCache(this.notifications);
        }

        return this.notifications;
    }

    async add(notification) {
        this.notifications.push(notification)
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        await setCache(this.notifications)
        return this.notifications;
    }

    async delete(uri) {
        await deleteNotification(uri);
        this.notifications = this.notifications.filter(n => n.url !== uri);
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        await setCache(this.notifications);
        return this.notifications;
    }

    async markAsRead(userID, groupID) {
        const id = await getWebId();
        let modified = false;

        this.notifications.forEach(async n => {
            if (n.read === 'false' && _.isEqual(n.users.sort(),[id,userID].sort()) ) {
                await markNotificationAsRead(n.url)
                modified = true;
            } else if (n.read === 'false' && groupID !== undefined && groupID === n.title) {
                await markNotificationAsRead(n.url)
                modified = true;
            }
        });

        const x = this.notifications.map(n=>{

            if (n.read === 'false' && _.isEqual(n.users.sort(),[id,userID].sort()) ) {
                n.read='true';
                modified = true;
            } else if (n.read === 'false' && groupID !== undefined && groupID === n.title) {
                n.read='true';
                modified = true;
            }

            return n;
        });
        const y  = _.uniqBy(_.reverse(_.sortBy(x, 'time')), 'url')
        if (modified) {
            await setCache(y);
        }
        this.notifications = y;
        return this.notifications;
    }

    async reloadFolder(folder) {
        const x = this.notifications;
        const e = await getNotifications(this.notifications.map(n => _.last(n.url.split('/'))), [folder]);
        const n = _.differenceBy(e, this.notifications, JSON.stringify);
        this.notifications = _.concat(this.notifications, n);
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        if (!_.isEqual(x, this.notifications) ) {
            await setCache(this.notifications);
        }
        return this.notifications;
    }

    async reload() {
        const x = this.notifications;
        const e = await getNotifications(this.notifications.map(n => _.last(n.url.split('/'))))
        const n = _.reverse(_.sortBy(_.concat(_.differenceBy(e, this.notifications, JSON.stringify), this.notifications), 'time'));
        this.notifications = n;
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        if (!_.isEqual(x, this.notifications) ) {
            await setCache(this.notifications);
        }
        return this.notifications;
    }
}
