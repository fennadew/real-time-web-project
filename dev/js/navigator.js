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