const nextStationInput = document.getElementById('nextStation');
const nextList = document.querySelector(".nextstation-autocomplete");
const lastStationInput = document.getElementById('lastStation');
const lastList = document.querySelector(".laststation-autocomplete");
const loader = document.querySelector('.loader');

if (nextStationInput && nextStationInput.addEventListener) {
    showList(nextStationInput, nextList);
    showList(lastStationInput, lastList);
    function showList(input, list) {
        input.addEventListener("input", () => {
            loader.classList.remove('hidden');
            fetch('/api?nextStation=' + input.value)
                .then(function (response) {
                    return response.json();
                })
                .then(function (myJson) {
                    loader.classList.add('hidden');
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
                    const listItem = document.createElement("div");
                    listItem.classList.add("autocomplete-items");
                    listItem.innerHTML = "<b>" + data[i].name.substr(0, val.length) + "</b>";
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
