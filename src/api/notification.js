import {getNotifications, deleteNotification, markNotificationAsRead, setCache} from "./things";
import {getWebId} from "./friends";
import _ from "lodash";

export class Notification {
    constructor() {
        this.notifications = [];
    }

    async load() {
        this.notifications = await getNotifications();
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        await setCache(this.notifications)
        return this.notifications;
    }

    async delete(uri) {
        await deleteNotification(uri);
        this.notifications = this.notifications.filter(n => n.url !== uri);
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        await setCache(this.notifications)
        return this.notifications;
    }

    async markAsRead(userID) {
        const id = await getWebId();
        this.notifications.forEach(async n => {
            if (n.read === 'false' && _.includes(n.users, userID) && _.includes(n.users, id) && _.size(n.users) === 2) {
                await markNotificationAsRead(n.url)
            }
        });
        this.notifications = this.notifications.map(n=>{

            if (n.read === 'false' && _.includes(n.users, userID) && _.includes(n.users, id) && _.size(n.users) === 2) {
                n.read='true';
            }

            return n;
        });
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        await setCache(this.notifications)
        return this.notifications;
    }

    async reloadFolder(folder) {
        const e = await getNotifications(this.notifications.map(n => _.last(n.url.split('/'))), [folder]);
        const n = _.differenceBy(e, this.notifications, JSON.stringify);
        console.log("WTF", n)
        this.notifications = _.concat(this.notifications, n);
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        await setCache(this.notifications)
        return this.notifications;
    }

    async reload() {
        const e = await getNotifications(this.notifications.map(n => _.last(n.url.split('/'))))
        const n = _.reverse(_.sortBy(_.concat(_.differenceBy(e, this.notifications, JSON.stringify), this.notifications), 'time'));
        this.notifications = n;
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        await setCache(this.notifications)
        return this.notifications;
    }
}
