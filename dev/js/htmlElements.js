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
