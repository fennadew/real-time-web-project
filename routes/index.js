const express = require('express');
const router = express.Router();
require('dotenv').config();
const fetch = require('node-fetch');

const ns = require('ns-api')({
    username: process.env.API_USER,
    password: process.env.API_PASS
});

let stationData = {};
let stationDataArray = [];
let locations = [];
let locationsNL = [];
ns.stations('Type', callBackStations);

function callBackStations(err, data) {
    if (err) {
        console.log(err);
    } else {
        stationData = data, {
            depth: null,
            colors: true
        };
        stationData = Object.values(stationData);
        for (let i = 0; i < stationData.length; i++) {
            Array.prototype.push.apply(stationDataArray, Object.values(stationData[i]));
        }
        locationsNL = stationDataArray.filter((obj) => {
            return obj.Land === 'NL'
        });
        locations = locationsNL.map((obj) => {
            return {
                name: obj.Namen.Lang,
                lat: Number(obj.Lat),
                lon: Number(obj.Lon),
                land: obj.Land
            }
        });
    }
}

router.get('/', (req, res) => {
    res.render('index', {title: 'NS Updates'})
});

router.get('/api', (req, res) => {
    const val = req.query.nextStation;
    const availableLocations = locations.filter((obj) => {
        const name = obj.name.toLowerCase();
        return name.startsWith(val);
    });
    res.json(availableLocations)
});


router.post('/', (req, res) => {
    const params = {
        fromStation: req.body.nextStation,
        toStation: req.body.finalStation
    };

    const selectionLocation = locations.filter((obj) => {
        const name = obj.name.toLowerCase();
        return name === req.body.nextStation.toLowerCase();
    });


    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + req.body.lat + ',' + req.body.lon + '&destinations=' + selectionLocation[0].lat + ',' + selectionLocation[0].lon + '&key=' + process.env.API_GOOGLE_KEY;

    const dataUser = {
        time: ''
    };

    fetch(url)
        .then(res => {
            return res.json();
        })
        .then(myJson => {
            const miles = myJson.rows[0].elements[0].distance.text.replace(/[^\d.-]/g, '');
            const km = Number(miles) / 0.62137;
            const speed = 120;
            const duration = (km / speed) * 60;

            const date = new Date();
            const hours = date.getHours();
            const minutes = "0" + (date.getMinutes() + parseInt(duration));

            dataUser.time = hours + minutes.substr(-2);
            ns.reisadvies(params, myCallback);

        });


    function myCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            let dataTrains = [];
            dataTrains = data, {
                depth: null,
                colors: true
            };
            extractData(dataTrains)
        }
    }

    function extractData(data) {
        const newArray = data.filter((obj) => {
            return obj.AantalOverstappen === '0';
        });

        for (let i = 0; i < newArray.length; i++) {
            newArray[i].ActueleVertrekTijd = timeConverter(newArray[i].ActueleVertrekTijd)
        }

        filterTrains(newArray);
    }

    function timeConverter(unix_timestamp) {
        const date = new Date(unix_timestamp);
        const hours = date.getHours();
        const minutes = "0" + date.getMinutes();
        return hours + minutes.substr(-2);
    }

    function filterTrains(data) {
        function findClosest (num, arr) {
            var mid;
            var lo = 0;
            var hi = arr.length - 1;
            while (hi - lo > 1) {
                mid = Math.floor ((lo + hi) / 2);
                if (Number(arr[mid].ActueleVertrekTijd) < num) {
                    lo = mid;
                } else {
                    hi = mid;
                }
            }
            if (num - Number(arr[lo].ActueleVertrekTijd) <= Number(arr[hi].ActueleVertrekTijd) - num) {
                return Number(arr[lo].ActueleVertrekTijd);
            }
            return Number(arr[hi].ActueleVertrekTijd);
        }
        const closest = findClosest(dataUser, data);


        const newArray = data.filter((obj) => {
            return obj.ActueleVertrekTijd === String(closest);
        });

        console.log(newArray[0]);

    }


    // res.send(data);
});

module.exports = router;