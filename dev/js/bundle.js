(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const htmlElements = require('./htmlElements');

const autoComplete = {
    init() {
        if (htmlElements.nextStationInput && htmlElements.nextStationInput.addEventListener) {
            this.showList(htmlElements.nextStationInput, htmlElements.nextList);
            this.showList(htmlElements.lastStationInput, htmlElements.lastList);
        }
    },
    showList(input, list) {
        input.addEventListener("input", () => {
            fetch('/api?nextStation=' + input.value)
                .then((response) => {
                    return response.json();
                })
                .then((myJson) => {
                    this.createList(myJson, input, list);
                });
        });
    },
    createList(data, input, list) {
        this.clearList(list);
        const val = input.value;
        if (val.length > 0) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].name.substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                    const listItem = document.createElement("li");
                    listItem.classList.add("autocomplete-items");
                    listItem.innerHTML = "<span>" + data[i].name.substr(0, val.length) + "</span>";
                    listItem.innerHTML += data[i].name.substr(val.length);
                    listItem.addEventListener("click", ((e) => {
                        return  () => {
                            input.value = data[i].name;
                            this.clearList(list);
                        }
                    })(i));
                    list.appendChild(listItem);
                }
            }
        }
    },
    clearList(list) {
        const elements = document.getElementsByClassName("autocomplete-items");
        if (elements) {
            while (list.firstChild) {
                list.removeChild(list.firstChild);
            }
        }
    }
};

module.exports = autoComplete;
},{"./htmlElements":4}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
const htmlElements = require('./htmlElements');

const formHandler = {
    init() {
        socketIo.init();
        htmlElements.addButton.addEventListener('click', (e) => {
            htmlElements.formContainer.classList.remove('hide');
            htmlElements.body.classList.add('fixed');
        });

        htmlElements.closeButton.addEventListener('click', (e) => {
            htmlElements.formContainer.classList.add('hide');
            htmlElements.body.classList.remove('fixed');
        });


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
            setTimeout(() => {
                htmlElements.formContainer.classList.add('hide');
                htmlElements.body.classList.remove('fixed');
            }, 200)


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
            const timeText = document.createTextNode("First notification on: " + this.timeConverter(notifications[i].Notificaties[0].time));
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

            let divNot = document.createElement('div');
            divNot.classList.add('noti');
            for(let a = 0; a < notifications[i].Notificaties.length; a++) {
                let name = document.createElement('div');
                let timeNot = document.createElement('div');
                let timeTextNot = document.createTextNode("Posted on: " + this.timeConverter(notifications[i].Notificaties[a].time));
                let nameNot = document.createTextNode(notifications[i].Notificaties[a].message);
                let divNotContainer = document.createElement('div');
                timeNot.appendChild(timeTextNot);
                name.appendChild(nameNot);
                divNotContainer.appendChild(name);
                divNotContainer.appendChild(timeNot);
                divNot.appendChild(divNotContainer);
            }

            divBig.appendChild(text);
            divSmall.appendChild(textSmallNode);
            li.appendChild(divBig);
            li.appendChild(divSmall);
            li.appendChild(time);
            li.appendChild(updates);
            li.appendChild(divNot);
            li.addEventListener('click', () => {
                li.classList.toggle('open');
            });
            ul.appendChild(li);
        }
        htmlElements.notifications.appendChild(ul);
    },
    updateNotications(obj) {
        let li = document.querySelectorAll('.notifications li');
        const updateList = li[(li.length -1) - obj.index];
        const count = updateList.querySelector('span');
        count.innerHTML = obj.train.Notificaties.length + " Notifications";

        const noti = updateList.getElementsByClassName('noti');
        let child = noti[0].firstChild;

        while( child ) {
            noti[0].removeChild( child );
            child = noti[0].firstChild;
        }

        for(let a = 0; a < obj.train.Notificaties.length; a++) {
            console.log(obj.train.Notificaties)
            let name = document.createElement('div');
            let timeNot = document.createElement('div');
            let timeTextNot = document.createTextNode("Posted on: " + this.timeConverter(obj.train.Notificaties[a].time));
            let nameNot = document.createTextNode(obj.train.Notificaties[a].message);
            let divNotContainer = document.createElement('div');
            timeNot.appendChild(timeTextNot);
            name.appendChild(nameNot);
            divNotContainer.appendChild(name);
            divNotContainer.appendChild(timeNot);
            noti[0].appendChild(divNotContainer);
        }

        updateList.appendChild(noti[0]);
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

        let divNot = document.createElement('div');
        divNot.classList.add('noti');
        for(let a = 0; a <notification.Notificaties.length; a++) {
            let name = document.createElement('div');
            let timeNot = document.createElement('div');
            let timeTextNot = document.createTextNode("Posted on: " + this.timeConverter(notification.Notificaties[a].time));
            let nameNot = document.createTextNode(notification.Notificaties[a].message);
            let divNotContainer = document.createElement('div');
            timeNot.appendChild(timeTextNot);
            name.appendChild(nameNot);
            divNotContainer.appendChild(name);
            divNotContainer.appendChild(timeNot);
            divNot.appendChild(divNotContainer);
        }

        divBig.appendChild(text);
        divSmall.appendChild(textSmallNode);
        li.appendChild(divBig);
        li.appendChild(divSmall);
        li.appendChild(time);
        li.appendChild(updates);
        li.appendChild(divNot);
        li.addEventListener('click', () => {
            li.classList.toggle('open');
        });
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
},{"./htmlElements":4}],4:[function(require,module,exports){
const htmlElements = {
    nextStationInput: document.getElementById('nextStation'),
    nextList: document.querySelector(".nextstation-autocomplete"),
    lastStationInput: document.getElementById('lastStation'),
    lastList: document.querySelector(".laststation-autocomplete"),
    retrievingMessage: document.querySelector('.retrieving'),
    errorMessage: document.querySelector('.error'),
    lonInput: document.getElementById('lon'),
    latInput: document.getElementById('lat'),
    body: document.querySelector('body'),
    loader: document.querySelector('.loader'),
    form: document.querySelector("form"),
    formContainer: document.querySelector('.report'),
    requiredInputs: document.querySelectorAll('.required'),
    empty: document.querySelector('.empty'),
    notifications: document.querySelector('.notifications'),
    addButton: document.querySelector('main > button'),
    closeButton: document.querySelector('.report > button')
};

module.exports = htmlElements;

},{}],5:[function(require,module,exports){
const navigatorGeo = require('./navigator');
const autoComplete = require('./autoComplete');
const formHandler = require('./formHandler');

const app = {
    init() {
        autoComplete.init();
        navigatorGeo.init();
        formHandler.init();
        window.addEventListener('load', function() {
            function updateOnlineStatus(event) {
                const condition = navigator.onLine ? "Live" : "Currently offline";
                document.querySelector('.offline').classList.remove('hidden');
                document.querySelector('.offline').innerHTML = condition;
                setTimeout(() => {
                    document.querySelector('.offline').classList.add('hidden');
                },5000);
            }

            window.addEventListener('online',  updateOnlineStatus);
            window.addEventListener('offline', updateOnlineStatus);
        });
    }
};

app.init();
},{"./autoComplete":1,"./formHandler":3,"./navigator":6}],6:[function(require,module,exports){
const htmlElements = require('./htmlElements');

const navigatorGeo = {
    options: {
        enableHighAccuracy: true,
        timeout: 5000,
    },
    callBackNavigator: {
        success(position) {
            const positionUser = position.coords;
            htmlElements.lonInput.value = positionUser.longitude;
            htmlElements.latInput.value = positionUser.latitude;
            htmlElements.retrievingMessage.classList.add('hidden');
            htmlElements.errorMessage.classList.add('hidden');
            htmlElements.loader.classList.add('hidden');
        },
        error(err) {
            console.log(err.message);
            htmlElements.errorMessage.classList.remove('hidden');
            htmlElements.retrievingMessage.classList.add('hidden');
            htmlElements.loader.classList.add('hidden');
        }
    },
    init() {
        navigator.geolocation.getCurrentPosition(this.callBackNavigator.success, this.callBackNavigator.error, this.options);
    }
};

module.exports = navigatorGeo;
},{"./htmlElements":4}],7:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}]},{},[1,2,3,4,5,6,7]);
