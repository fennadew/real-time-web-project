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

    fetch(url)
        .then(res => {
            return res.json();
        })
        .then(myJson => {
            const miles = myJson.rows[0].elements[0].distance.text.replace(/[^\d.-]/g, '');
            const km = Number(miles) / 0.62137;
            const speed = 120;
            const duration = (km / speed) * 60;
            console.log(parseInt(duration))
        })


    // ns.reisadvies(params, myCallback);
    //
    // function myCallback(err, data) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         let dataTrains = [];
    //         dataTrains = data, {
    //             depth: null,
    //             colors: true
    //         };
    //         extractData(dataTrains)
    //     }
    // }
    //
    // function extractData(data) {
    //     var newArray = data.filter((obj) => {
    //         return obj.AantalOverstappen === '0';
    //     });
    //
    //     console.dir(newArray);
    // }

    // res.send(data);
});

module.exports = router;