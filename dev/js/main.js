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