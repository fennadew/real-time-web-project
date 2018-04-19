(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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

},{}]},{},[1,2]);
