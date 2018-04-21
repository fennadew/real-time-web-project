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
};

const options = {
    enableHighAccuracy: true,
    timeout: 5000,
};

const callBackNavigator = {
    success(position) {
        const positionUser = position.coords;
        htmlElements.lonInput.value = positionUser.longitude;
        htmlElements.latInput.value = positionUser.latitude;
        htmlElements.retrievingMessage.classList.add('hidden');
        htmlElements.errorMessage.classList.add('hidden');
        htmlElements.loader.classList.add('hidden');
        console.log(positionUser.longitude, positionUser.latitude)
    },
    error(err) {
        console.log(err.message);
        htmlElements.errorMessage.classList.remove('hidden');
        htmlElements.retrievingMessage.classList.add('hidden');
        htmlElements.loader.classList.add('hidden');
    }

};

navigator.geolocation.getCurrentPosition(callBackNavigator.success, callBackNavigator.error, options);


if (htmlElements.nextStationInput && htmlElements.nextStationInput.addEventListener) {
    showList(htmlElements.nextStationInput, htmlElements.nextList);
    showList(htmlElements.lastStationInput, htmlElements.lastList);

    function showList(input, list) {
        input.addEventListener("input", () => {
            htmlElements.loader.classList.remove('hidden');
            fetch('/api?nextStation=' + input.value)
                .then(function (response) {
                    return response.json();
                })
                .then(function (myJson) {
                    htmlElements.loader.classList.add('hidden');
                    createList(myJson, input, list);
                });
        });
    }

    function createList(data, input, list) {
        clearList(list);

        const val = input.value;
        if (val.length > 0) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].name.substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                    const listItem = document.createElement("li");
                    listItem.classList.add("autocomplete-items");
                    listItem.innerHTML = "<span>" + data[i].name.substr(0, val.length) + "</span>";
                    listItem.innerHTML += data[i].name.substr(val.length);
                    listItem.addEventListener("click", (function (e) {
                        return function () {
                            input.value = data[i].name;
                            clearList(list);
                        }
                    })(i));
                    list.appendChild(listItem);
                }
            }
        }
    }

    function clearList(list) {
        const elements = document.getElementsByClassName("autocomplete-items");
        if (elements) {
            while (list.firstChild) {
                list.removeChild(list.firstChild);
            }
        }
    }
}
