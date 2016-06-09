/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false */
/* jshint strict: false, -W117 */

(function(){

    var framework7 = new Framework7({
        animateNavBackIcon: true,
        modalTitle: "Messenger",
        modalButtonOk: "OK",
        modalButtonCancel: "Cancel",
        cache: true
    }); 
             
    var $$ = Dom7;
        
    //Initializes main view
    mainView = framework7.addView('.view-main', {
        dynamicNavbar: true,
        domCache: true, //чтобы навигация работала без сбоев и с запоминанием scroll position в длинных списках
    });
    
    function onAppReady() {
        var messenger = new app.Constructors.Messenger(framework7, $$, mainView); 
        messenger.showHomePage();
           
        cordova.plugins.backgroundMode.setDefaults({
            title:  "chpok.online",
            ticker: "chpok.online",
            text:   "App is running.",
        });
                
        // Enable background mode
        cordova.plugins.backgroundMode.enable();
        
    }
    document.addEventListener("app.Ready", onAppReady, false) ; 
})();






