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
                    if(allFilled) {
                        const values = Object.values(htmlElements.form).reduce((obj,field) => { obj[field.name] = field.value; return obj }, {});
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
            console.log(data);
        });
        this.socket.on('warning', function (error) {
            console.log(error);
            formHandler.showMessage("warning", error);
        });
        this.socket.on('success', function (msg) {
            console.log(msg);
            formHandler.showMessage("success", msg);
        });
    }
};

module.exports = formHandler;