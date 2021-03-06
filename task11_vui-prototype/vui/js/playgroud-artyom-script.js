window.addEventListener("load", function () {
    console.log("loaded");

    // init artyom
    var artyom = new Artyom();
    var name = "Marc";
    var silent = false;

    document.getElementById("name").innerHTML = name;
    document.getElementById("mode").innerHTML = "Silent mode: deaktiviert";


    // start artyom
    startContinuousArtyom();

    // listen on button
    document.getElementById("activate").addEventListener("click", function () {
        toStart();
        document.getElementById("activate").style.display = "none";
    });

    artyom.redirectRecognizedTextOutput(function(recognized,isFinal){
        if(isFinal){
            document.getElementById("recognizedID").innerHTML = "Ich habe verstanden: <br><span>" + recognized+ "</span>";
        }else{
            document.getElementById("recognizedID").innerHTML = "Ich höre: <br><span>" + recognized+ "</span>";
        }
    });

    // All catchable artyom errors will be catched with this
    artyom.when("ERROR", function (error) {
        document.getElementById("error").style.display = "inline";
        if (error.code == "network") {
            document.getElementById("error").innerHTML = 'An error ocurred, artyom cannot work without internet connection !';
        }
        else if (error.code == "audio-capture") {
            document.getElementById("error").innerHTML = 'An error ocurred, artyom cannot work without a microphone';
        }
        else if (error.code == "not-allowed") {
            document.getElementById("error").innerHTML = 'An error ocurred, it seems the access to your microphone is denied';
        }
        else {
            document.getElementById("error").style.display = "none";
        }

        console.log(error.message);
    });

    if (artyom.recognizingSupported()) {
        // Artyom can process commands
    } else {
        document.getElementById("error").style.display = "inline-block";
        document.getElementById("error").innerHTML = 'Dieser Browser wird nicht von Artyom.js leider nicht unterstützt. <br>Bitte wechsle zum Google Chrome Browser!';
        document.getElementById("activate").style.display = "none";
    }

    // START FUNCTION
    function startContinuousArtyom() {
        artyom.fatality();
        setTimeout(function () {
            artyom.initialize({
                lang: "de-DE",
                continuous: true,
                listen: true,
                interimResults: false,
                debug: true,
                obeyKeyword: "Hallo Home",
            }).then(function () {
                console.log("Ready!");

                artyom.when("NOT_COMMAND_MATCHED", function () {

                });

                artyom.addCommands(initCommand);
                document.getElementById("commands").innerHTML = 'Sage <br><br><span class="sayings">"Hallo Home"</span><br><br>oder drücke den Button!';
                document.getElementById("activate").style.display = "inline-block";
            });
        }, 250);
    }

    function toStart() {
        var hour = new Date().getHours();
        var time;
        if (hour >= 0 && hour <= 12) {
            time = " Morgen ";
        } else if (hour >= 13 && hour <= 17) {
            time = " Tag ";
        } else if (hour >= 18 && hour <= 24) {
            time = " Abend ";
        }
        soundFeedback();
        artyom.say("Guten " + time + " " + name + ".");
        artyom.say("Was kann ich für dich tun?");
        displayFirstLevel();

        artyom.when("NOT_COMMAND_MATCHED", function () {
            artyom.say("Wiederhole deine Anfrage bitte.");
        });

    }

    // BACK TO FIRST LEVEL FUNTION
    function backToFirstLevel() {
        if (!silent) {
            artyom.say("Kann ich sonst noch etwas für dich tun?");
        }
        displayFirstLevel();
    }

    function displayFirstLevel() {
        artyom.emptyCommands();
        artyom.addCommands(firstLevelCommands);
        artyom.addCommands(endCommands);
        document.getElementById("commands").innerHTML = 'Du kannst folgende Befehle ausführen <br><br><span class="sayings">"Ich heiße nicht ' + name + '!"<br>"Was ist der Silent Mode?"<br>"De-/aktiviere den Silent Mode!"<br>"Ist das [Gerät] noch an?"<br>"Schalte [Gerät] an/aus!"<br>"Wie warm ist es im Raum [Raum]?"<br>"Stelle die Temperatur auf [Gradzahl]!"<br>"Ändere die Helligkeit auf [Prozentwert]!"<br>"Was sind meine Benachrichtigungen?"<br>"Neues Gerät verbinden!"</span><br><br> Beende das Gespräch mit <br><br> <span class="sayings">"Danke" </span> oder <span class="sayings">"Danke Home!"</span>';
    }

    function soundFeedback() {
        var audio = new Audio('confirm.wav');
        audio.play();
    }

    // INIT COMMANDS
    var initCommand = [
        {
            indexes: ["Hallo Home", "Hallo Hong", "Hallo Honk", "Home", "Hong", "Honk", "Hallo"],
            action: function (i) {
                toStart();
                document.getElementById("activate").style.display = "none";
                console.log(artyom.getAvailableCommands());
            }
        }
    ];

    // FIRST LEVEL COMMANDS
    var firstLevelCommands = [
        {
            indexes: ["Ich heiße nicht " + name,],
            action: function (i) {
                artyom.say("Okay, wie soll ich dich denn in Zukunft nennen?");
                artyom.emptyCommands();
                artyom.addCommands(endCommands);
                document.getElementById("commands").innerHTML = 'Antworte mit <br><br><span class="sayings">"Nenne mich [Name]" <br>"Abbrechen"</span> <br><br> Beende das Gespräch mit <br><br> <span class="sayings">"Danke"</span> oder <span class="sayings">"Danke Home!"</span>';
                artyom.addCommands([
                    {
                        smart: true,
                        indexes: ["Nenne mich *", "Ich heiße *"],
                        action: function (i, wildcard) {
                            artyom.say("Okay. Ich nenne dich absofort" + wildcard);
                            name = wildcard;
                            document.getElementById("name").innerHTML = name;
                            backToFirstLevel()

                        }
                    },
                    {
                        indexes: ["Abbrechen"],
                        action: function (i) {
                            artyom.say("Okay, ich nenne dich weiterhin " + name);
                            backToFirstLevel()
                        }
                    }
                ]);
            }
        },
        {
            smart: true,
            indexes: ["Ist * noch angeschaltet", "Ist das * noch angeschaltet", "Ist * noch eingeschaltet", "Ist das * noch eingeschaltet", "Ist * noch an", "Ist das * noch an",],
            action: function (i, wildcard) {
                var state = Math.floor(Math.random() * 10);
                console.log(state);
                if (state <= 7) {
                    artyom.say(wildcard + " ist noch an. Soll ich es für dich ausschalten?");
                    artyom.emptyCommands();
                    artyom.addCommands(endCommands);
                    document.getElementById("commands").innerHTML = 'Antworte mit <br><br><span class="sayings">"Nein, danke." <br>"Ja, bitte."</span> <br><br> Beende das Gespräch mit <br><br> <span class="sayings">"Danke"</span> oder <span class="sayings">"Danke Home!"</span>';
                    artyom.addCommands([
                        {
                            indexes: ["nein", "Nein danke"],
                            action: function (i) {
                                artyom.say("Okay.");
                                backToFirstLevel()

                            }
                        },
                        {
                            indexes: ["Ja", "Ja bitte"],
                            action: function (i) {
                                artyom.say("Ich habe es für dich ausgeschaltet.");
                                backToFirstLevel()
                            }
                        }
                    ]

                    );

                    console.log(artyom.getAvailableCommands());
                }
                else if (state >= 8) {
                    artyom.say(wildcard + " ist aktuell ausgeschalten.");
                }
            }
        },
        {
            smart: true,
            indexes: ["Wie viel Grad hat es im Raum *", "Wie viel Grad hat es in *", "Wie viel Grad hat es im *", "Wie warm ist es in *", "Wie warm ist es im Raum *",],
            action: function (i, wildcard) {
                var deg = Math.floor(Math.random() * 27) + 14;
                console.log(deg);
                artyom.say("In " + wildcard + " hat es aktuell " + deg + "Grad.");
                backToFirstLevel();
            }
        },
        {
            indexes: ["Was sind meine aktuellen Benachrichtigungen", "Was sind meine Benachrichtigungen"],
            action: function (i) {
                var state = Math.floor(Math.random() * 10);
                console.log(state);
                if (state <= 7) {
                    artyom.say("Das Licht in der Küche ist noch an. Jedoch befindet sich dort aktuell keine Person.",);
                    artyom.say("Soll ich es für dich ausschalten?");
                    artyom.emptyCommands();
                    document.getElementById("commands").innerHTML = 'Antworte mit <br><br><span class="sayings">"Nein, danke." <br>"Ja, bitte."</span> <br><br> Beende das Gespräch mit <br><br> <span class="sayings">"Danke"</span> oder <span class="sayings">"Danke Home!"</span>';
                    artyom.addCommands(endCommands);
                    artyom.addCommands([
                        {
                            indexes: ["nein", "Nein danke"],
                            action: function (i) {
                                artyom.say("Okay.");
                                backToFirstLevel()
                            }
                        },
                        {
                            indexes: ["Ja", "Ja bitte"],
                            action: function (i) {
                                artyom.say("Gut, ich habe das Licht für dich ausgeschaltet.");
                                backToFirstLevel()
                            }
                        }
                    ]);

                }
                else {
                    artyom.say("Du hast aktuell keine neuen Benachrichtigungen.");
                }
            }
        },
        {
            smart: true,
            indexes: ["Schalte * an", "* an"],
            action: function (i, wildcard) {
                if (silent) {
                    soundFeedback();
                }
                else {
                    artyom.say("Ich habe " + wildcard + " angeschaltet.");
                }
                backToFirstLevel();
            }
        },
        {
            smart: true,
            indexes: ["Schalte * aus", "* aus"],
            action: function (i, wildcard) {
                if (silent) {
                    soundFeedback();
                }
                else {
                    artyom.say("Ich habe " + wildcard + " ausgeschaltet.");
                }
                backToFirstLevel();
            }
        },
        {
            smart: true,
            indexes: ["Ändere die Helligkeit auf *", "Helligkeit *"],
            action: function (i, wildcard) {
                if (silent) {
                    soundFeedback();
                }
                else {
                    artyom.say("Ich habe die Helligkeit auf " + wildcard + " geändert.");

                }
                backToFirstLevel();
            }
        },
        {
            smart: true,
            indexes: ["Stelle die Temperatur auf *", "Temperatur *"],
            action: function (i, wildcard) {
                if (silent) {
                    soundFeedback();
                }
                else {
                    artyom.say("Ich habe die Temperatur auf " + wildcard + " gestellt.");
                }
                backToFirstLevel();
            }
        },
        {
            indexes: ["Ich möchte gerne mein neues Gerät verbinden", "neues Gerät verbinden", "* Gerät verbinden"],
            action: function (i) {
                artyom.say("Ich gehe auf die Suche nach deinem Gerät.");

                var textArray = [
                    'Klimaanlage 93R4',
                    'Nanoleafs',
                    'FritzBox 7490',
                    'HP Drucker 7100'
                ];
                var randomNumber = Math.floor(Math.random() * textArray.length);
                var device = textArray[randomNumber];
                console.log("+ ", device);

                artyom.say("Ich habe das Gerät " + device + " gefunden. Ist das richtig?");
                document.getElementById("commands").innerHTML = 'Antworte mit <br><br><span class="sayings">"Nein." <br>"Ja." </span><br><br> Beende das Gespräch mit <br><br> <span class="sayings">"Danke"</span> oder <span class="sayings">"Danke Home!"</span>';

                artyom.emptyCommands();

                artyom.addCommands(
                    [
                        {
                            indexes: ["Nein",],
                            action: function (i) {
                                artyom.say("Okay, ich suche weiter.");

                                randomNumber = Math.floor(Math.random() * textArray.length);
                                device = textArray[randomNumber];
                                console.log(device);

                                artyom.say("Ich habe das Gerät " + device + " gefunden. Ist das richtig?");
                            }
                        },
                        {
                            indexes: ["Ja",],
                            action: function (i) {
                                artyom.say("Gut, welchem Raum möchtest du das Gerät hinzufügen?");
                                artyom.emptyCommands();
                                artyom.addCommands(endCommands);
                                document.getElementById("commands").innerHTML = 'Sage <br><br><span class="sayings">"Füge es dem Raum [Raum] hinzu"</span> <br><br> Beende das Gespräch mit <br><br> <span class="sayings">"Danke"</span> oder <span class="sayings">"Danke Home!"</span>';
                                artyom.addCommands(
                                    [
                                        {
                                            smart: true,
                                            indexes: ["Füge es dem Raum * hinzu", "Füge es * hinzu",],
                                            action: function (i, wildcard) {
                                                console.log(device);
                                                artyom.say("Okay, ich habe dein neues Gerät " + device + " dem Raum " + wildcard + " hinzugefügt.");
                                                backToFirstLevel();
                                            }
                                        },
                                    ]
                                );
                            }
                        },
                    ]
                );

            }
        },

        {
            smart: true,
            indexes: ["Ist * ein Instrument",],
            action: function (i, wildcard) {
                artyom.say("Nein, " + name + " " + wildcard + "ist kein Instrument!");
                backToFirstLevel();

            }
        },

        {
            indexes: ["Was ist der Silent Mode",],
            action: function (i) {
                artyom.say("Wenn du den Silent Mode aktivierst werde ich dir nicht mehr bei jeder Anfrage eine Antwort geben. Ich werde dir stattdessen durch einen leisen Ton signalisieren dass ich deine Anfrage bearbeitet habe.");

                if (silent) {
                    artyom.say("Möchtest du den Silent Mode deaktivieren?");
                }
                else {
                    artyom.say("Möchtest du den Silent Mode aktivieren?");
                }

                artyom.emptyCommands();
                document.getElementById("commands").innerHTML = 'Antworte mit <br><br><span class="sayings">"Nein, danke." <br>"Ja, bitte."</span> <br><br> Beende das Gespräch mit <br><br> <span class="sayings">"Danke"</span> oder <span class="sayings">"Danke Home!"</span>';
                artyom.addCommands(endCommands);
                artyom.addCommands([
                    {
                        indexes: ["nein", "Nein danke"],
                        action: function (i) {
                            artyom.say("Okay.");
                            backToFirstLevel()
                        }
                    },
                    {
                        indexes: ["Ja", "Ja bitte"],
                        action: function (i) {
                            if (silent) {
                                artyom.say("Gut, Ich habe den Silent Mode für dich deaktiviert.");
                            }
                            else {
                                artyom.say("Gut, Ich habe den Silent Mode für dich aktiviert.");
                            }

                            silent = true;
                            document.getElementById("mode").innerHTML = "Silent mode: aktiviert";
                            console.log("mode", silent);

                            backToFirstLevel()
                        }
                    }
                ]);

            }
        },

        {
            indexes: ["Aktiviere den Silent Mode",],
            action: function (i, wildcard) {

                soundFeedback();

                silent = true;
                document.getElementById("mode").innerHTML = "Silent mode: aktiviert";

                backToFirstLevel();
            }
        },

        {
            indexes: ["Deaktiviere den Silent Mode",],
            action: function (i, wildcard) {
                if (silent) {
                    artyom.say("Gut, Ich habe den Silent Mode für dich deaktiviert.");
                }
                else {
                    artyom.say("Der Silent Mode ist aktuell schon ausgeschaltet.");
                }
                document.getElementById("mode").innerHTML = "Silent mode: deaktiviert";

                silent = false;
                backToFirstLevel();
            }
        },

        {
            indexes: ["Hallo Home", "Hallo *", "Hallo"],
            action: function (i, wildcard) {
                if (silent) {
                    soundFeedback();
                }
                else {
                }

                backToFirstLevel();
            }
        },


    ];

    // END COMMANDS
    var endCommands = [
        {
            smart: true,
            indexes: ["danke *"],
            action: function (i, wildcard) {
                console.log("Gespräch beendet!");
                artyom.say("gerne! Melde dich bitte sobald ich etwas tun kann. Bis zum nächsten mal");
                artyom.emptyCommands();
                startContinuousArtyom();
            }
        },
        {
            indexes: ["danke", "Stop", "Ich habe genug"],
            action: function (i) {
                console.log("Gespräch beendet!");
                artyom.say("Gerne! Melde dich bitte sobald ich etwas tun kann. Bis zum nächsten mal");
                artyom.emptyCommands();
                startContinuousArtyom();
            }
        },
    ];

});
//# sourceMappingURL=playgroud-artyom-script.js.map










window.onload = function () {
    "use strict";
    var paths = document.getElementsByTagName('path');
    var visualizer = document.getElementById('visualizer');
    var mask = visualizer.getElementById('mask');
    var h = document.getElementsByTagName('h1')[0];
    var path;
    var report = 0;
    
    var soundAllowed = function (stream) {
        //Audio stops listening in FF without // window.persistAudioStream = stream;
        //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
        //https://support.mozilla.org/en-US/questions/984179
        window.persistAudioStream = stream;
        // h.innerHTML = "Thanks";
        // h.setAttribute('style', 'opacity: 0;');
        var audioContent = new AudioContext();
        var audioStream = audioContent.createMediaStreamSource( stream );
        var analyser = audioContent.createAnalyser();
        audioStream.connect(analyser);
        analyser.fftSize = 1024;

        var frequencyArray = new Uint8Array(analyser.frequencyBinCount);
        visualizer.setAttribute('viewBox', '0 0 255 255');
      
		//Through the frequencyArray has a length longer than 255, there seems to be no
        //significant data after this point. Not worth visualizing.
        
        for (var i = 0 ; i < 255; i++) {
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('stroke-dasharray', '4,1');
            mask.appendChild(path);
        }
        var doDraw = function () {
            requestAnimationFrame(doDraw);
            analyser.getByteFrequencyData(frequencyArray);
          	var adjustedLength;
            for (var i = 0 ; i < 255; i++) {
              	adjustedLength = Math.floor(frequencyArray[i]) - (Math.floor(frequencyArray[i]) % 5);
                paths[i].setAttribute('d', 'M '+ (i) +',255 l 0,-' + adjustedLength);
            }

        }
        doDraw();
    }

    var soundNotAllowed = function (error) {
        // h.innerHTML = "You must allow your microphone.";
        console.log(error);
    }

    /*window.navigator = window.navigator || {};
    /*navigator.getUserMedia =  navigator.getUserMedia       ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia    ||
                              null;*/
    navigator.getUserMedia({audio:true}, soundAllowed, soundNotAllowed);

};