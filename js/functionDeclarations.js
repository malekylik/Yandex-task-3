function element(type, className, text) {
    var elem = document.createElement(type);

    if(className) {
        elem.classList.add(className);
    }

    if (text) {
        elem.innerText = text;
    }

    return elem;
}


function generateRandomNumbersWithoutDuplication() {

    var obj = [];

    for(var i = 0; i < 10; i++){
        obj[i] = {};
        obj[i].number = i;
        obj[i].randNumberForSort = Math.random();
    }

    obj.sort(function (a,b) {
        return b.randNumberForSort - a.randNumberForSort;
    });

    var res = [];

    for(var i = 0; i < 10; i++)
        res[i] = obj[i].number;

    return res;
}
//---------------ResultTable--------------
function ResultTable(resultTableElement){
    this.citiesListElement = resultTableElement.getElementsByClassName("citiesList")[0];
    this.numberListElement = resultTableElement.getElementsByClassName("numberList")[0];
}


ResultTable.prototype = {
    constructor: ResultTable,

    addCityOnTable: function addCityOnTable(city, count) {
        this.citiesListElement.appendChild(element("p","overflow-string",city));
        this.numberListElement.appendChild(element("p",null,count + ":"));
    },

    clearTable: function clearTable(){
        while(this.citiesListElement.children.length && this.citiesListElement.removeChild(this.citiesListElement.children[0]));
        while(this.numberListElement.children.length && this.numberListElement.removeChild(this.numberListElement.children[0]));
    }
};
//---------------Validation--------------

function ValidationManager() {
    this.errorMessage = new ErrorMessageConstructor();
    }

ValidationManager.prototype = {
    constructor: ValidationManager,

    validatePCGeneratedCities: function validatePCGeneratedCities(players,cities){
        var count = 0;

        while(count < cities.getLength()){
            if (players[1].massOfRandNumbers[count] <  cities.getLength()){
                if(!this.validateDuplication(players,cities.get(players[1].massOfRandNumbers[count]).name)) break;
            }
            count++;
        }

        if(count == cities.getLength()) return false;


        return players[1].massOfRandNumbers[count];
    },

    validate: function validate(players, inputSource,dataBaseRequestManager) {

        var value = inputSource.value.trim();

        if(this.validateInputField(value,inputSource))
            return false;


        if(this.validateDuplication(players,value,inputSource))
            return false;

        if(this.validateInputValue(value,inputSource,dataBaseRequestManager))
            return false;

        if(players[1].count > 0) {
            if (players[1].getLastCharacter() != value[0].toLowerCase()) {
                this.errorMessage.showError("Последняя буква только что добавленного города не " +
                    "совпадает с первой буквой городо, который Вы пытаетесь добавить!", inputSource);
                return false;
            }
        }

        return true;

    },

    validateInputField: function validateInputField(value,inputSource) {
        if(!value){
            this.errorMessage.showError("Поле недолжно быть пустым!",inputSource);
            return true;
        }
    },

    validateInputValue: function validateInputValue(value, inputSource, dataBaseRequestManager) {
        var dataBaseResult =  dataBaseRequestManager.getResultByCityName(value);

        if(!dataBaseResult.getLength()){
            this.errorMessage.showError("Название города введено неверно или такого города не существует!",inputSource);
            return true;
        }

    },

    validateDuplication: function validateDuplication(players,value,inputSource){
        for(var i = 0; i < players.length; i++) {
            if (players[i].isPresented(value.toLowerCase())) {
                if(inputSource != undefined) this.errorMessage.showError("Данный город уже был назван!", inputSource);
                return true;
            }
        }
    }
};


//---------------ErrorMessageConstructor--------------
function ErrorMessageConstructor() {
    this.message = {
        onScreen: false
    };

    this.message.element = element("span", "errorMessage", "");
    }

ErrorMessageConstructor.prototype = {
    constructor: ErrorMessageConstructor,

    showError: function showError(errorText,inputSource) {
        if(!this.message.onScreen) {

            this.message.element.innerText = errorText;

            this.setErrorPosition(this.message.element,inputSource);

            document.body.appendChild(this.message.element);

            this.message.onScreen = true;

            this.removeMessage(3000);
        }
    },

    setErrorPosition: function setErrorPosition(element,inputSource) {
        element.style.left = inputSource.getBoundingClientRect().right + 10 + pageXOffset + "px";
        element.style.top = inputSource.getBoundingClientRect().top + pageYOffset + "px";
    },

    removeMessage: function removeMessage(time) {
        setTimeout(() => {
            document.body.removeChild(this.message.element);
                this.message.onScreen = false;
        }, time);
    }
};

//---------------DataBaseResult--------------
function DataBaseResult(JSONstring) {
    this.resultObject = JSON.parse(JSONstring);
}

DataBaseResult.prototype = {
    constructor:DataBaseResult,
    getLength: function getLength() {
        return this.resultObject.geonames.length;
    },
    get: function get(number) {
        return this.resultObject.geonames[number];
    },

    getGeoCoord: function getGeoCoord(number){
        return [+this.get(number).lat,+this.get(number).lng]
    }
};

//---------------DataBaseRequestManager--------------
function DataBaseRequestManager() {
    this.xhr = new XMLHttpRequest();

    this.maxRows = 10;
}


DataBaseRequestManager.prototype = {
    constructor:DataBaseRequestManager,

    SEARCH_BY_CITY_NAME: "name_equals",
    SEARCH_BY_FIRST_LETTER_CITY_NAME: "name_startsWith",

    getResult: function getResult(value, parameter,startPosition = 0) {
        this.xhr.open('GET',
            'http://api.geonames.org/searchJSON?'+parameter+'='+value+'&cities=cities1000&lang=ru&maxRows='
            +this.maxRows+'&username=malekylik',
            false);

        this.xhr.send();

        if (this.xhr.status != 200) {
            alert( this.xhr.status + ': ' + this.xhr.statusText );
        } else {

            return new DataBaseResult(this.xhr.responseText);
        }
    },

    getResultByCityName: function getResultByCityName(cityName){

        return this.getResult(cityName,this.SEARCH_BY_CITY_NAME);

    },

    getCitiesByFirstLetter: function getCitiesByFirstLetter(letter){
        return this.getResult(letter,this.SEARCH_BY_FIRST_LETTER_CITY_NAME);
    }

};


//---------------Player--------------

function Player(resultTable){
    this.count = 0;
    this.citiesList = [];

    this.resultTable = resultTable;
}

Player.prototype = {
  constructor: Player,

    addCity: function addCity(city) {
        this.count += 1;
        this.citiesList.push(city.toLowerCase());

        this.resultTable.addCityOnTable(city,this.count);
    },

    isPresented: function isPresented(city) {
        return this.citiesList.includes(city);
    },

    getLastAddedCity: function getLastAddedCity() {
        return this.citiesList[this.count - 1];
    },
    getLastCharacter: function getLastCharacter() {
      var i = 1;

      while(this.getLastAddedCity()[this.getLastAddedCity().length - i].toLowerCase() == "ь"
      || this.getLastAddedCity()[this.getLastAddedCity().length - i].toLowerCase() == "ъ") i++;

            return this.getLastAddedCity()[this.getLastAddedCity().length - i].toLowerCase();
    }
    ,

    clearAll: function clearAll(){
      this.count = 0;
      this.citiesList = [];

      this.resultTable.clearTable();
    }
};

function PlayerPC(resultTable) {
    Player.call(this,resultTable);

    this.massOfRandNumbers = generateRandomNumbersWithoutDuplication();
}

PlayerPC.prototype = Object.create(Player.prototype);
PlayerPC.prototype.constructor = PlayerPC;


PlayerPC.prototype.generateCity = function generateCity(dataBaseRequestManager,player){
    return dataBaseRequestManager.getCitiesByFirstLetter(player.getLastCharacter());
};

PlayerPC.prototype.clearAll = function clearAll(){
    Player.prototype.clearAll.call(this);
    this.massOfRandNumbers = generateRandomNumbersWithoutDuplication();
};


//---------------UI--------------

function UI() {

    this.textField = document.body.getElementsByTagName("input")[0];
    this.inputs = document.getElementsByClassName("input");

    this.map = new ymaps.Map ("map", {
        center: [55.76, 37.64],
        zoom: 1,
        behaviors: ['drag','scrollZoom'],
        type: 'yandex#satellite'

    });

    this.map.controls.add('zoomControl');

}

UI.prototype = {

    constructor:UI,

    setPointOnMap: function setPointOnMap(geocode) {
        var myGeocoder = ymaps.geocode(geocode, {kind: 'locality'});
        var map = this.map;
        myGeocoder.then(
            function (res) {
                if(res.geoObjects.getLength()) {
                    map.geoObjects.add(res.geoObjects.get(0));
                }
            },
            function (err) {
                alert('Ошибка');
            }
        );
    },

    disableInputs: function disableInputs() {
        for(var i = 0; i < this.inputs.length; i++)
            if(this.inputs[i] !== this.getRestartButton()) {
                this.inputs[i].disabled = true;
                this.inputs[i].classList.add("disabled");
            }
    },

    enableInputs: function enableInputs() {
        for(var i = 0; i < this.inputs.length; i++) {
            this.inputs[i].disabled = false;
            this.inputs[i].classList.remove("disabled");
        }
    },

    showStat: function showStat(players) {
        var gameStat = element("div","gameStat");
        var statTable = element("div","statTable");
        statTable.appendChild(element("h1",null,"Player:"));
        statTable.appendChild(element("p",null,"Amount: " + players[0].count));

        var statTablePC = element("div","statTable");
        statTablePC.appendChild(element("h1",null,"Computer:"));
        statTablePC.appendChild(element("p",null,"Amount: " + players[1].count));

        var gameStatTable = element("div","statTable");
        gameStatTable.appendChild(element("p",null,"Total Amount: " + (players[0].count + players[1].count)));

        gameStat.appendChild(gameStatTable);
        gameStat.appendChild(statTable);
        gameStat.appendChild(statTablePC);

        document.body.appendChild(gameStat);
    },

    hideStat: function hideStat(){
        var gameStat = document.getElementsByClassName("gameStat")[0];

        if(gameStat)
        document.body.removeChild(gameStat);
    }

    ,

    getMicroButton: function getEnterButton() {
        return this.inputs[1];
    },

    getRestartButton: function getEnterButton() {
        return this.inputs[2];
    },

    getEndButton: function getEnterButton() {
        return this.inputs[3];
    },

    clearMap: function clearMap() {
        this.map.geoObjects.each( (geoObject) => {
            this.map.geoObjects.remove(geoObject);
        });
    }






};

//---------------Game--------------

function Game() {
    this.UI = new UI();

    this.players = [];

    this.players.push(new Player(new ResultTable(document.getElementsByClassName("resultTable")[0])));
    this.players.push(new PlayerPC(new ResultTable(document.getElementsByClassName("resultTable")[1])));

    this.validationManager = new ValidationManager();

    this.dataBaseRequestManager = new DataBaseRequestManager();
}

Game.prototype = {
    constructor:Game,

    play: function play(){
            if(this.validationManager.validate(this.players,this.UI.textField,this.dataBaseRequestManager)){
                this.playerTurn(this.UI.textField.value.trim());

                for(var i = 1; i < this.players.length; i++)
                this.pcTurn(i);
          }


    },

    playerTurn: function playerTurn(value) {
        this.players[0].addCity(value);
        this.UI.setPointOnMap(value);
        this.UI.textField.value = "";
    },

    pcTurn: function pcTurn(pcNumber) {
        var res = this.players[pcNumber].generateCity(this.dataBaseRequestManager,this.players[pcNumber - 1]);
        var number = this.validationManager.validatePCGeneratedCities(this.players,res);

        if(number === false){
            this.gameOver();
        }else{
            this.players[pcNumber].addCity(res.get(number).name);
            this.UI.setPointOnMap(res.getGeoCoord(number));
        }

    },

    gameOver: function gameOver() {
        this.UI.disableInputs();
        this.UI.textField.placeholder = "Игра закончена";

        this.UI.showStat(this.players);

        window.scrollBy({
            left: 0,
            top: document.body.scrollHeight,
            behavior: "smooth"});
    },

    restartGame: function restartGame() {
        this.UI.enableInputs();
        this.UI.textField.placeholder = "Имя города";

        for(var i = 0; i < this.players.length; i++)
            this.players[i].clearAll();

        this.UI.clearMap();
        this.UI.hideStat();
    }
};