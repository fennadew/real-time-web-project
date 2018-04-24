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