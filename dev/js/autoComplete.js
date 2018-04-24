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