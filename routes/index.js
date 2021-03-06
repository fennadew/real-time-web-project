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
    // res.send(bin);
});

module.exports = router;