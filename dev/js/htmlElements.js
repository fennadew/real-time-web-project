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
