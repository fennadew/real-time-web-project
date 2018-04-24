const htmlElements = require('./htmlElements');

const formHandler = {
    init() {
        socketIo.init();
        htmlElements.form.addEventListener('submit', (e) => {
            e.preventDefault();
            let allFilled = true;
            for (let i = 0; i < htmlElements.requiredInputs.length; i++) {
                if (htmlElements.requiredInputs[i].value === "") {
                    allFilled = false;
                    htmlElements.requiredInputs[i].classList.add('error-input');
                } else {
                    htmlElements.requiredInputs[i].classList.remove('error-input');
                }
            }
            const select = document.getElementsByTagName("select")[0];
            const option = select.options[select.selectedIndex].value;


            if (allFilled) {
                const values = Object.values(htmlElements.form).reduce((obj, field) => {
                    obj[field.name] = field.value;
                    return obj
                }, {});
                values.notifications = option;
                console.log(values)
                socketIo.socket.emit('submit', values);
            }
        });
    },
    showMessage(output, msg) {
        const msgDisplay = document.querySelector('.msg');
        if (msgDisplay) {
            htmlElements.form.removeChild(msgDisplay);
        }
        let p = document.createElement("p");
        let text = document.createTextNode(msg);
        p.appendChild(text);
        htmlElements.form.appendChild(p);
        p.classList.add("msg");
        if (output === "success") {
            p.classList.add("success-msg");
        } else {
            p.classList.add("warning-msg");
        }
    }
};

const socketIo = {
    socket: io(),
    init() {
        this.socket.on('notifications', function (data) {
            content.addNotifications(data);
        });
        this.socket.on('warning', function (error) {
            console.log(error);
            formHandler.showMessage("warning", error);
        });
        this.socket.on('success', function (msg) {
            console.log(msg);
            formHandler.showMessage("success", msg);
        });
        this.socket.on('update', function (obj) {
            content.updateNotications(obj);
        });
        this.socket.on('notificationsHistory', function (noti) {
            if (noti.length > 0) {
                content.showNotifications(noti);
            }
        });
    }
};

const content = {
    showNotifications(notifications) {
        const ul = document.createElement('ul');
        document.querySelector('.empty').classList.add('hidden');
        for (let i = notifications.length - 1; i >= 0; i--) {
            const li = document.createElement('li');
            const divBig = document.createElement('div');
            const divSmall = document.createElement('div');
            const time = document.createElement('div');
            const timeText = document.createTextNode("Posted on: " + this.timeConverter(notifications[i].Notificaties[0].time));
            const updates = document.createElement('span');
            const updatesCount = document.createTextNode(notifications[i].Notificaties.length + " Notifications");
            updates.appendChild(updatesCount);
            time.appendChild(timeText);
            divBig.classList.add('big');
            divSmall.classList.add('small');
            const l = notifications[i].ReisDeel[0].ReisStop.length - 1;
            const text = document.createTextNode(notifications[i].Notificaties[0].message + " " + notifications[i].ReisDeel[0].VervoerType + " " + notifications[i].ReisDeel[0].ReisStop[l].Naam);
            let textSmall = "";
            for (let a = 0; a <= l; a++) {
                if (a === l) {
                    textSmall += ' ' + notifications[i].ReisDeel[0].ReisStop[a].Naam;
                } else {
                    textSmall += ' ' + notifications[i].ReisDeel[0].ReisStop[a].Naam + ',';
                }
            }
            const textSmallNode = document.createTextNode(textSmall);

            divBig.appendChild(text);
            divSmall.appendChild(textSmallNode);
            li.appendChild(divBig);
            li.appendChild(divSmall);
            li.appendChild(time);
            li.appendChild(updates);
            ul.appendChild(li);
        }
        htmlElements.notifications.appendChild(ul);
    },
    updateNotications(obj) {
        let li = document.querySelectorAll('.notifications li');
        const updateList = li[(li.length -1) - obj.index];
        const count = updateList.querySelector('span');
        count.innerHTML = obj.train.Notificaties.length + " Notifications";
    },
    addNotifications(notification) {
        let ul = document.querySelector('.notifications ul');
        if (!ul) {
            ul = document.createElement('ul');
            htmlElements.notifications.appendChild(ul);
        }
        const li = document.createElement('li');
        const divBig = document.createElement('div');
        const divSmall = document.createElement('div');
        const time = document.createElement('div');
        const updates = document.createElement('span');
        const updatesCount = document.createTextNode(notification.Notificaties.length + " Notifications");
        updates.appendChild(updatesCount);
        const timeText = document.createTextNode("Posted on: " + this.timeConverter(notification.Notificaties[0].time));
        time.appendChild(timeText);
        divBig.classList.add('big');
        divSmall.classList.add('small');
        const l = notification.ReisDeel[0].ReisStop.length - 1;
        const text = document.createTextNode(notification.Notificaties[0].message + " " + notification.ReisDeel[0].VervoerType + " " + notification.ReisDeel[0].ReisStop[l].Naam);
        let textSmall = "";
        for (let a = 0; a <= l; a++) {
            if (a === l) {
                textSmall += ' ' + notification.ReisDeel[0].ReisStop[a].Naam;
            } else {
                textSmall += ' ' + notification.ReisDeel[0].ReisStop[a].Naam + ',';
            }
        }
        const textSmallNode = document.createTextNode(textSmall);

        divBig.appendChild(text);
        divSmall.appendChild(textSmallNode);
        li.appendChild(divBig);
        li.appendChild(divSmall);
        li.appendChild(time);
        li.appendChild(updates);
        ul.insertBefore(li, ul.firstChild);
    },
    timeConverter(unix_timestamp) {
    const date = new Date(unix_timestamp);
    const hours = date.getHours();
    const minutes = "0" + date.getMinutes();
    return hours + ':' + minutes.substr(-2);
}
};

module.exports = formHandler;