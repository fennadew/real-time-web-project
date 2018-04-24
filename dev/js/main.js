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