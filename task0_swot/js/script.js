let strength = ["Webentwicklung / Webdesign", "Konzeption von Webseiten", "WordPress und typo3 Development", "HTML, CSS / SCSS",]
let weak = ["Wenig Erfahrung mit JavaScript", "Konzeption von anderen Interface-Arten"]
let treath = ["Fehlende Inhalte aufgrund der kurzen Zeit"]
let opp = ["Die Möglichkeit neues Wissen anzueignen","Verschiedene Arten von Interfaces kennenlernen","Tiefer Einblick in den Aufbau von Interfaces"]

let strength_id = document.getElementById("strength_ul")
let weakness_id = document.getElementById("weakness_ul")
let threats_id = document.getElementById("threats_ul")
let opps_id = document.getElementById("opps_ul")

strength.forEach((item) => { strength_id.innerHTML += '<li>' + item + '</li>' })
weak.forEach((item) => { weakness_id.innerHTML += '<li>' + item + '</li>' })
treath.forEach((item) => { threats_id.innerHTML += '<li>' + item + '</li>' })
opp.forEach((item) => { opps_id.innerHTML += '<li>' + item + '</li>' })

AOS.init({
    disable: function() {
        var maxWidth = 787;
        return window.innerWidth < maxWidth;
      },
    duration: 2500,
});
