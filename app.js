const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const index = require('./routes/index');
const http = require('http');
const sassMiddleware = require('node-sass-middleware');
const reload = require('reload');
require('dotenv').config();
const fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Use EJS and the views directory for view engine
app
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs');

// Make POST parameters available in request
app
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({
        extended: true
    }));

// Compiles SCSS to compressed CSS
app.use(sassMiddleware({
    src: path.join(__dirname, 'dev'),
    dest: path.join(__dirname, 'public'),
    debug: true,
    outputStyle: 'compressed',
}));

// Directory for static content
app.use(express.static('public'));


// Routes
app.use('/', index);

const server = http.createServer(app);
const io = require('socket.io')(server);


// Sockets

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

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'real-time-notifications';

// Use connect method to connect to the server
MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    const notificationsCollection = db.collection('notifications');

    io.on('connection', function (socket) {
        socket.on('submit', function (data) {
            const params = {
                fromStation: data.nextStation,
                toStation: data.finalStation,
            };

            const warnings = {
                fromStation: "No stations matched the input for the next station",
                toStation: "No stations matched the input for the last station",
                train: "Couldn't find train"

            };

            const selectionLocation = locations.filter((obj) => {
                const name = obj.name.toLowerCase();
                return name === data.nextStation.toLowerCase();
            });

            if (selectionLocation.length > 0) {
                const url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + data.lat + ',' + data.lon + '&destinations=' + selectionLocation[0].lat + ',' + selectionLocation[0].lon + '&key=' + process.env.API_GOOGLE_KEY;
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
                        const minutesToArrival = date.getMinutes() + parseInt(duration);
                        const minutesAtTime = date.getMinutes();
                        const minutesTotal = minutesToArrival > 9 ? "" + minutesToArrival : "0" + minutesToArrival;
                        const minutesAtTimeTotal = minutesAtTime > 9 ? "" + minutesAtTime : "0" + minutesAtTime;
                        dataUser.notificationTime = minutesAtTimeTotal > 9 ? hours + ":" + minutesAtTime : hours + ":" + ("0" + minutesAtTime);
                        dataUser.arrivalTime = hours + minutesTotal.substr(-2);
                        ns.reisadvies(params, myCallback);
                    });
            } else {
                socket.emit('warning', warnings.fromStation);
            }

            const dataUser = {
                arrivalTime: '',
                notificationTime: '',
                train: []
            };

            function myCallback(err, data) {
                if (err) {
                    console.log(err);
                    socket.emit('warning', warnings.toStation);
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

                if (newArray.length > 0) {
                    filterTrains(newArray);
                } else {
                    socket.emit('warning', warnings.train);
                }
            }

            function timeConverter(unix_timestamp) {
                const date = new Date(unix_timestamp);
                const hours = date.getHours();
                const minutes = "0" + date.getMinutes();
                return hours + minutes.substr(-2);
            }

            function filterTrains(data) {
                function findClosest(num, arr) {
                    let mid;
                    let lo = 0;
                    let hi = arr.length - 1;
                    while (hi - lo > 1) {
                        mid = Math.floor((lo + hi) / 2);
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

                dataUser.train = data.filter((obj) => {
                    return obj.ActueleVertrekTijd === String(closest);
                });

                dataReady();
            }

            function dataReady() {
                if (dataUser.train.length > 0) {
                    trainCheck(dataUser.train[0]);
                } else {
                    socket.emit('warning', warnings.train);
                }
            }

            function trainCheck(train) {
                let exist = false;
                notificationsCollection.find().toArray().then(function (docs) {
                    for (let i = 0; i < docs.length; i++) {
                        if (docs[i].ReisDeel[0].RitNummer === train.ReisDeel[0].RitNummer) {
                            exist = true;
                            notificationsCollection.findOneAndUpdate(
                                {"ReisDeel.RitNummer": train.ReisDeel[0].RitNummer},
                                {$push: {"Notificaties": {message: data.notifications, time: new Date()}}}
                            );
                            console.log(docs[i].Notificaties);
                            docs[i].Notificaties.push({message: data.notifications, time: new Date()});

                            const obj = {
                                train: docs[i],
                                index: i
                            };
                            io.sockets.emit('update', obj);
                        }
                    }
                    if (exist === false) {
                        train.Notificaties = [];
                        train.Notificaties.push({});
                        train.Notificaties[0].message = data.notifications;
                        train.Notificaties[0].time = new Date();
                        notificationsCollection.insertOne(train, function (err, res) {
                            if (err) {
                                console.log(err);
                            }
                        });
                        io.sockets.emit('notifications', train);
                    }
                });
                socket.emit('success', "Notification is recieved");
            }
        });

        notificationsCollection.find().toArray().then(function (docs) {
            socket.emit("notificationsHistory", docs);
        });
    });

    setInterval(() => {

    }, 500000);
});

server.listen(3000, () => console.log('Listening on port 3000'));

reload(app);