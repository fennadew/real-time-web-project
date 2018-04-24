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
            htmlElements.loader.classList.remove('hidden');
            fetch('/api?nextStation=' + input.value)
                .then((response) => {
                    return response.json();
                })
                .then((myJson) => {
                    htmlElements.loader.classList.add('hidden');
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
    init(){
        socketIo.init();
            htmlElements.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    let allFilled = true;
                    for(let i = 0; i < htmlElements.requiredInputs.length; i++) {
                        if (htmlElements.requiredInputs[i].value === "") {
                            allFilled = false;
                            htmlElements.requiredInputs[i].classList.add('error-input');
                        } else {
                            htmlElements.requiredInputs[i].classList.remove('error-input');
                        }
                    }
                const select = document.getElementsByTagName("select")[0];
                const option = select.options[select.selectedIndex].value;


                    if(allFilled) {
                        const values = Object.values(htmlElements.form).reduce((obj,field) => { obj[field.name] = field.value; return obj }, {});
                        values.notifications = option;
                        console.log(values)
                        socketIo.socket.emit('submit', values);
                    }
            });
    },
    showMessage(output, msg){
        const msgDisplay = document.querySelector('.msg');
        if (msgDisplay) {
            htmlElements.form.removeChild(msgDisplay);
        }
        let p = document.createElement("p");
        let text = document.createTextNode(msg);
        p.appendChild(text);
        htmlElements.form.appendChild(p);
        p.classList.add("msg");
        if(output === "success") {
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
        });
        this.socket.on('warning', function (error) {
            console.log(error);
            formHandler.showMessage("warning", error);
        });
        this.socket.on('success', function (msg) {
            console.log(msg);
            formHandler.showMessage("success", msg);
        });
        this.socket.on('notificationsHistory', function (noti) {
            content.showNotifications(noti)
        });
    }
};

const content = {
    showNotifications(notifications) {
        console.log(notifications)
        const ul = document.createElement('ul');
        for(let i = notifications.length - 1; i >= 0; i--) {
            const li = document.createElement('li');
            const l = notifications[i].ReisDeel[0].ReisStop.length - 1;
            const text = document.createTextNode(notifications[i].ReisDeel[0].VervoerType + notifications[i].ReisDeel[0].ReisStop[l].Naam);
            li.appendChild(text);
            ul.appendChild(li);
        }
        htmlElements.notifications.appendChild(ul);
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
    loader: document.querySelector('.loader'),
    form: document.querySelector("form"),
    requiredInputs: document.querySelectorAll('.required'),
    empty: document.querySelector('.empty'),
    notifications: document.querySelector('.notifications')
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
},{"./htmlElements":4}]},{},[1,2,3,4,5,6]);
