import {getNotifications, setCache, deleteNotification, readFile} from "./things";
import {removeFile} from './explore';
import {getWebId} from "./friends";
import {readCache} from './things'
import _ from "lodash";

export class Notification {
    constructor() {
        this.notifications = [];
    }

    async load() {

        const id = await getWebId()

        const cache = id.replace('/profile/card#me','') + '/pr8/cache';

        try {
            this.notifications = await readCache(cache)
        }
        catch (e) {
            console.log("ERROR", e)
        }

        const x = _.cloneDeep(this.notifications);

        this.notifications = _.concat(
            this.notifications,
            await getNotifications(0)
        );

        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')

        if (!_.isEqual(x, this.notifications)) {
            const newNotifications = _.differenceBy(this.notifications, x, JSON.stringify);
            await setCache(this.notifications, newNotifications, "add");
            _.forEach(newNotifications, async notification => await removeFile(notification.url))
        }

        return this.notifications;
    }

    async add(notification) {
        this.notifications.push(notification)
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        await setCache(this.notifications, [notification], "add")
        await removeFile(notification.url)
        return this.notifications;
    }

    async delete(notification) {
        const deletedNotification = _.find(this.notifications, n => n.url === notification.url)
        this.notifications = this.notifications.filter(n => n.url !== notification.url);
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        await setCache(this.notifications, [deletedNotification], "delete");
        await deleteNotification(notification.attachments);
        return this.notifications;
    }

    async markAsRead(userID, groupID) {
        const id = await getWebId();
        let modified = false;
        const modifiedNotifications = [];

        this.notifications.forEach(async n => {
            if (n.read === false && _.isEqual(n.users.sort(),[id,userID].sort()) ) {
                const modifiedNotification = _.cloneDeep(n)
                modifiedNotification.read = true
                modifiedNotifications.push(modifiedNotification)
                modified = true;
            } else if (n.read === false && groupID !== undefined && groupID === n.title) {
                const modifiedNotification = _.cloneDeep(n)
                modifiedNotification.read = true
                modifiedNotifications.push(modifiedNotification)
                modified = true;
            }
        });



        const x = this.notifications.map(n=>{

            if (n.read === false && _.isEqual(n.users.sort(),[id,userID].sort()) ) {
                n.read=true;
                modified = true;
            } else if (n.read === false && groupID !== undefined && groupID === n.title) {
                n.read=true;
                modified = true;
            }

            return n;
        });
        const y  = _.uniqBy(_.reverse(_.sortBy(x, 'time')), 'url')
        if (modified) {
            await setCache(y, modifiedNotifications, "modify");
        }
        this.notifications = y;
        return this.notifications;
    }

    async reloadFolder(folder) {
        const x = _.cloneDeep(this.notifications);
        const e = await getNotifications(0, [folder]);
        const n = _.differenceBy(e, this.notifications, JSON.stringify);
        this.notifications = _.concat(this.notifications, n);
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        if (!_.isEqual(x, this.notifications) ) {
            const newNotifications = _.differenceBy(this.notifications, x, JSON.stringify)
            await setCache(this.notifications, newNotifications, "add");
            _.forEach(newNotifications, async notification => await removeFile(notification.url))
        }
        return this.notifications;
    }

    async reload() {

        const x = _.cloneDeep(this.notifications);
        const e = await getNotifications(0)
        const n = _.reverse(_.sortBy(_.concat(_.differenceBy(e, this.notifications, JSON.stringify), this.notifications), 'time'));
        this.notifications = n;
        this.notifications = _.uniqBy(_.reverse(_.sortBy(this.notifications, 'time')), 'url')
        if (!_.isEqual(x, this.notifications) ) {
            const newNotifications = _.differenceBy(this.notifications, x, JSON.stringify)
            await setCache(this.notifications, newNotifications, "add");
            _.forEach(newNotifications, async notification => await removeFile(notification.url))
        }
        return this.notifications;
    }
}
