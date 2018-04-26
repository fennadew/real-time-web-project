# Real Time Web course repo

For this course I created a real conductor spotting application. To make this happen, I used the NS API, Google maps API, Node, Express, EJS and Socket.io. Users can send a notification when they spot a conductor. Other users get live updates. The notifications are removed once the train ride ended.

# Table of Content
- [Dependencies](#dependencies)
- [Features](#features)
- [Get started](#get-started)
- [Socket](#socket)
- [To do](#to-do)
- [Resources](#resources)

## Dependencies
*   [x] Server: [Node](https://nodejs.org/en/)
*   [x] Routing: [Express](https://expressjs.com/)
*   [x] Templating: [EJS](http://ejs.co/)
*   [x] CSS: [SASS](https://sass-lang.com/)
*   [x] Monitor: [https://nodemon.io/](https://nodemon.io/)
*   [x] Real time engine: [Sockets.io](https://socket.io/)
*   [x] Ns API: [NS API](https://www.npmjs.com/package/ns-api)
*   [x] Google Matrix API: [Google Matrix API](https://developers.google.com/maps/)
*   [x] Real time engine: [Sockets.io](https://socket.io/)

## Features
* Automatically calculates on which train you are
* Live notifications
* Add notifications
* Multiple user support
* Old notifications get removed

## Get started
* Run `$ git clone https://github.com/fennadew/real-time-web.git` in your terminal in the desired directory.
* `cd` to the repository and run `npm install` to install all dependencies.
* Run `npm run nodemon` start the server with automatic reload.
App listens on `http://localhost:3000/`.

## Socket.io, Node.js and Express
Socket.io is a real time engine that ensures that you can see the same information in real time or different browsers, can input and be updated in all browsers. This library works with Node.js and communicates changes to the server. Express is used for routing.

## To do
*   [ ] Better styling
*   [ ] More functionalities
*   [ ] Improve perfomance
*   [ ] Make available for mobile

