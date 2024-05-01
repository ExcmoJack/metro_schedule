import {messagesList} from './data/info_messages.js';
import {config} from './data/config.js';

// GENERAL FSM:
// 0. INIT  <----
// 1. RUNNING   |
// 2. EMPTY -----

class Train {
    // TRAIN FSM:
    // 0. HIDDEN <---
    // 1. SECOND    |
    // 2. FIRST     |
    // 3. NEXT      |
    // 4. LEFT ------
    constructor (line, destination, departureTime)
    {
        this.line = line;
        this.destination = destination;
        this.departureTime = departureTime;
        this.state = 0;
    }


}

class Timetable {
    constructor ()
    {
        this.trainList = [];
        this.index = 0;
        this.elements =
            {
                firstTrain: document.getElementById("first-train"),
                secondTrain: document.getElementById("second-train")
            };
        this.updated = false;
    }

    loadTimetable(timetable)
    {
        this.trainList = [];

        for (let trainIndex = 0; trainIndex < timetable.length; trainIndex++) {
            let trainObj = timetable[trainIndex];
            let train = new Train(trainObj.line, trainObj.destination, trainObj.hour);
            this.trainList.push(train)
        }
    }

    updateTimetable(clockData)
    {
        this.removePassedTrains(clockData);

        if(!this.updated) {
            this.elements.firstTrain.innerHTML = writeTrainData(this.trainList[0]);
            this.trainList[0].state = 2;
            this.elements.secondTrain.innerHTML = writeTrainData(this.trainList[1]);
            this.trainList[1].state = 1;
            this.updated = true;
        }

        let clockTime = clockData.split(':');
        let trainTime = this.trainList[0].departureTime.split(':');
        switch (this.trainList[0].state)
        {
            case 0:
            case 1:
                this.updated = false;
                break;
            case 2:
                if (((clockTime[0]) == (trainTime[0])) && ((clockTime[1]) == (trainTime[1]))) {
                    this.elements.firstTrain.className = "train first next";
                    console.log("class next added");
                    this.trainList[0].state = 3;
                }
                break;
            case 3:
                if (((clockTime[0]) != (trainTime[0])) || ((clockTime[1]) != (trainTime[1]))) {
                    this.trainList[0].state = 4;
                }
                break;
            case 4:
                this.elements.firstTrain.className = "train first";
                console.log("class next removed");
                this.trainList[0].state = 0;
                this.updated = false;
                break;
        }
                console.log(this.trainList[0].state);
    }

    removePassedTrains(clockData)
    {
        let clockTime = clockData.split(':');
        while (0 < this.trainList.length) {
            let trainTime = this.trainList[0].departureTime.split(':');
            if (parseInt(clockTime[0]) > parseInt(trainTime[0]))
            {
                this.trainList.shift();
            }

            else if (parseInt(clockTime[0]) == parseInt(trainTime[0]))
            {
                if (parseInt(clockTime[1]) > parseInt(trainTime[1]))
                {
                    this.trainList.shift();
                }
                else
                {
                    this.trainList.state == 1;
                    return;
                }
            }
            else {
                this.trainList.state == 1;
                return;
            }
        }
    }
}

class Stop {
    constructor () {
        this.id = null;
        this.stopName = null;
        this.stopType = null;
        this.lines = null;
        this.platform = null;
        this.element = document.getElementById("stop-name");
        this.timetable = new Timetable();
    }
    
    printStopName()
    {
        this.element.innerHTML = this.stopName;
    }

    initStopData() {
        let url = window.location.href;
        let location = url.split('#');
        this.platform = location[2];
        requestStopJson(location[1]);
    }

    loadStopData(stopData)
    {
        this.id = stopData.stop_id;
        this.stopName = stopData.stop_name;
        this.stopType = stopData.stop_type;
        this.lines = stopData.lines;
        this.timetable.loadTimetable(stopData.timetable.blue[stopObj.platform]);

        this.printStopName();
    }
}

class MessageInfo {
    constructor() {
        this.messageText = "";
        this.elementWidth = 0;
        this.parentWidth = 0;
        this.messageId = 0;
        this.element = document.getElementById("message");
        this.messageCount = messagesList.messages.length;
        this.nextMessageText = "";
    }

    setMessageText() {
        this.nextMessageText = messagesList.messages[this.messageId];
        if (this.messageText != this.nextMessageText) {
            this.element.innerHTML = this.nextMessageText;
            this.messageText = this.nextMessageText;
        }
    }

    setMessageElementSize() {
        this.element.style.opacity = 0;
        for (let i = 0; i < this.messageCount; i++)
        {
            this.messageId = i;
            this.setMessageText();
            this.elementWidth = (this.element.offsetWidth > this.elementWidth) ? this.element.offsetWidth: this.elementWidth;
            this.parentWidth = (this.element.parentElement.offsetWidth > this.parentWidth) ? this.element.parentElement.offsetWidth : this.parentWidth;
        }
        this.messageId = 0;
        this.element.style.opacity = 1;
    }

    startScrollingMessages() {
        let messageOffset = 0;
    
        setInterval(() => {
            this.element.style.marginLeft = --messageOffset + "px";
            if (this.elementWidth == -messageOffset) {
                this.messageId = ((this.messageId + 1) == this.messageCount) ? 0 : (this.messageId + 1);
                this.setMessageText();
                messageOffset = this.parentWidth;
            }
        }, 10)
    }
}

let time = new Date();
let currentTime = "00:00:00";

let messageObj = new MessageInfo();
let stopObj = new Stop();

setup();

function setup()
{
    messageObj.setMessageElementSize();
    messageObj.setMessageText();
    messageObj.startScrollingMessages();

    stopObj.initStopData();
    // Start main loop
    
    setTimeout(() => {
        setClock();
        stopObj.timetable.removePassedTrains(currentTime);
        setInterval(main, 500);
    }, 500);
}


function main() {
    setClock();

    stopObj.timetable.updateTimetable(currentTime);
}

function setClock() {
    // Get time object
    time = new Date();
    let hour = time.getHours();
    let min  = time.getMinutes();
    let sec  = time.getSeconds();

    // Format hour
    hour = hour < 10 ? "0" + hour : hour;
    min  = min  < 10 ? "0" + min  : min;
    sec  = sec  < 10 ? "0" + sec  : sec;

    // Set and print text
    currentTime = hour + ":" + min + ":" + sec;
    document.getElementById("clock").innerHTML = currentTime.toString();
}

async function requestStopJson(stopName)
{
    let stopJson = null;
    const requestURL = "./data/stops/" + stopName + ".json";
    const request = new Request(requestURL);
    const response = await fetch(request);
    stopJson = await response.json();
    stopObj.loadStopData(stopJson);
}
let swap_train = false;
let swapped = false;

function writeTrainData(trainData)
{
    let html =
    "                    <section class=\"line-num\">\n" +
    "                        <article class=\"icon L" + trainData.line + "\"></article>\n" +
    "                    </section>\n" +
    "                    <section class=\"destination\">\n" +
    "                        <span>" + trainData.destination + "</span>\n" +
    "                    </section>\n" +
    "                    <section class=\"departure-time\">\n" +
    "                        <span>" + trainData.departureTime + "</span>\n" +
    "                    </section>";

    return html;

    // <section class="line-num">
    //     <article class="icon L0"></article>
    // </section>
    // <section class="destination">
    //     <span>Sense servei</span>
    // </section>
    // <section class="departure-time">
    //     <span>00:00</span>
    // </section>
}