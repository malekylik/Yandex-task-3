/**
 * Список городов, в количесвте 10 штук, запрашивается во время хода компьютера.
 * Сохраняя города заранее или запрашивая их до начала игры, нужно решить: какие города сохранять/запрашивать.
 * Но самое главное, что при достаточо большом количестве, игроку придется долго ждать при скачке, а также
 * это будет грузить компьютер.
 * Минус подхода, когда во время хода компьютера запрашивается город, в том, что нужно ждать ответа от сервера,
 * который может быть нагружен.
 */

ymaps.ready(main);

var ENTER_KEY_CODE = 13;

function main(){
    var game = new Game();

    game.UI.textField.addEventListener('keypress',
        function(event) {
            if(event.keyCode == ENTER_KEY_CODE) {
                game.play();
            }
        }
    );


    game.UI.getRestartButton().addEventListener('click',
        function (event) {
        game.restartGame();
        }
    );

    game.UI.getEndButton().addEventListener('click',
        function (event) {
        game.gameOver();
        }
    );



    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

    var recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    var isWorking = false;
    game.UI.getMicroButton().addEventListener('click',
        function (event) {
                if(!isWorking) {
                    recognition.start();
                }else{
                    recognition.stop();
                }
        }
    );

    recognition.onstart = function (event) {
        game.UI.getMicroButton().classList.add("working");
        isWorking = true;
    };

    recognition.onend = function (event) {
        game.UI.getMicroButton().classList.remove("working");
        isWorking = false;
    };

    recognition.onresult = function(event) {
        if (event.results.length > 0) {
           game.UI.textField.value = event.results[0][0].transcript;
        }


    };

    recognition.onspeechend = function() {
        recognition.stop();
    };

    recognition.onerror = function(event) {
       console.log('Error occurred in recognition: ' + event.error);
       game.validationManager.errorMessage.showError("При определение речи возникла ошибка. Пожалуйста, повторите.",game.UI.getMicroButton());
     };


    document.body.removeChild(document.getElementsByClassName("loader")[0]);
    document.body.removeChild(document.getElementsByClassName("whiteScreen")[0]);

}









