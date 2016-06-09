/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false */
/* jshint strict: false, -W117 */

app.Constructors.MessengerView = function(messenger){
    var that = this;
    
    this._messenger = messenger;
      
    //Renders home page
    this._renderHomePage = function(){ 
        this._messenger._checkFirstEnter();  
            
        var savedUserData = that._messenger._getUserDataStorage();
        var loginStatus = this._messenger._getUserLogInStatus();
        
        if(loginStatus === null || loginStatus.status === false){
            $(".btnLogOut").hide();
            $("#linkUserAccount").hide();
            
            //$(".linkDashboard").hide();
            this._hideDashboard();
            this._showHomePage();
        }else{
            $("#linkUserAccount").text(savedUserData.userName);           
            $(".btnLogIn").hide();
            $(".btnLogOut").css("display", "block");
            
            this._hideHomePage();
            
            this._addPlanshetCss();
            this._showDashboard();
            $(".linkDashboard").show();
            
            //this._messenger._renderAllMessagesLogined();
            this._messenger._renderAllMessagesLoginedSql();
                 
            //console.log("start from login home page");
            //var statusInitRequest = true;
            //this._messenger._saveStatusInitRequest(statusInitRequest);
                    
            //this._messenger._initRequestOverMinute();
            
            var saveNum = that._messenger._getCountSave();
            
            if(saveNum === 1){
                this._messenger._checkMessagesNew();
            }else{
                this._messenger._renderAllUsersAllMessages();
            }
            //
            
            //this._messenger._checkMessagesNew();
            //this._messenger._openSocket();
            this._messenger._openSocketSql();
        }
    };
    
    //Renders first enter page with username and password
    this._renderFirstEnterPage = function(response){
        $("#userNameServer").text(response.userName);
        $("#userPasswordServer").text(response.password);
        
        $("#linkOpenPanel").hide();
        $("#linkNavPopover").hide();
    };
    
    //Shows first enter page with username and password 
    this._showFirstEnterPage = function(){
        $("#firstEnterPage").show();
    };
    
    //Hides first enter page with username and password
    this._hideFirstEnterPage = function(){
        $("#firstEnterPage").hide();
    };
    
    //Adds css styles if app work on planshet
    this._addPlanshetCss = function(){
        var width = screen.width;
        var height = screen.height;
        
        if(width > 800 || height > 800){
            $("#dashboardBlockInset").css("margin-left", "18.5%");
            $("#dashboardBlockInner").css({"font-size":"16px", "width":"80%"});
            $(".dashboardInfo").css("margin-left", "4.5%");
            $("#dashboardBlockInner button").css("width", "70px");
            $("#dashboardTitle").css({"margin-left": "19%", "width":"63%"});
            $("#dashboardRankBtn").css("margin-left", "11%");
            $("#dashboardDownlineBtn").css("margin-left", "10.5%");
            
            //$("#dashBoard").addClass(".planshetDashboard");
        }
    };
    
    //Shows dash board
    this._showDashboard = function(){
        $("#dashBoard").show();
    };
    
    //Hides dash board
    this._hideDashboard = function(){
        $("#dashBoard").hide();
    };
    
    //Shows message if user hasn't messages 
    this._showNoMessagesInfo = function(){
        var message = "<li id='noMessagesInfo' style='text-align: center; background-color: #C3C0C0;'>No messages.</li>";
        $("#allUsersAllMessagesList").html(message);
    };
    
    //Shows meesage that nothing found
    this._showNoMessagesFound = function(){
        var message = "<li id='noMessagesFound' style='text-align: center; background-color: #C3C0C0;'>Nothing found.</li>";
        $("#allUsersAllMessagesList").html(message);
    };
    
    //Shows home page
    this._showHomePage = function(){
        $("#allUsersAllMessages").hide();
        $("#homePage").show();
    };
    
    //Hides home page
    this._hideHomePage = function(){
        $("#homePage").hide();
    };
    
    //Hides form
    this._hideForm = function(formName){  
        $("#" + formName).trigger("reset");        
        that._messenger._f7.closeModal();
    };
    
    //Shows link to user account
    this._showUserInfo = function(){
        $(".btnLogIn").hide();
        $(".btnLogOut").show();
        $("#linkUserAccount").show(); 
    };
    
    //Hides link to user account
    this._hideUserInfo = function(){       
        $(".btnLogOut").hide();        
        $("#linkUserAccount").hide();
        $(".btnLogIn").show();
    };
    
    //Adds to validation custom method "checkNicknameExist" for check nickname - exsist or not
    /*$.validator.addMethod("checkNicknameExist", function(val, elem){
        var savedUserData = JSON.parse(localStorage.getItem("user-data-access"));
        if(savedUserData !== null && val === savedUserData.nickname){
            return false;
        }else return true;
    }, "user with the same name already exists...");*/
    
    //Sets settings of form validation
    function setValidationSettings(namesValidate){
        var rules = {};
        var messages = {};
        var settings ={};

        namesValidate.forEach(function(item){
            switch(item){
                case "userName": {
                    rules.userName = {
                        required: true,
                        //checkNicknameExist: true
                    };
                    
                    messages.userName = {
                        required: "Field is required..."
                    };
                    
                    break;                       
                }
                    
                case "password": {
                    rules.password = {
                        required: true,
                        minlength: 4
                    };
                    
                    messages.password = {
                        required: "Field is required...",
                        minlength: "Password can't be less than 4 symbols..."
                    };
                    
                    break;
                }              
            }
        }); 
        
        settings.rules = rules;
        settings.messages = messages;
            
        return settings;
    }
    
    //Sets form validate
    this._setFormValidate = function(formName){
        var namesValidate = [];
        
        //Gets attributs names of all inputs of the form
        $("#" + formName + " input").each(function(){
            var attrName = $(this).attr("name");
            namesValidate.push(attrName);
        });
        
        var settings = setValidationSettings(namesValidate);
        
        /*if(formName === "logInForm"){
            settings.rules.nickname.checkNicknameExist = false;
        }*/
               
        $("#" + formName + "").validate({
            rules: settings.rules,
            messages: settings.messages
        });
    };
    
    //Checks errors of form validation
    this._checkValidateErrors = function (formName){
        var selector = "#" + formName + " input.error";
        var errors = $(selector); 
        
        var inputsValues = this._setUserData(formName);
        
        for(var i in inputsValues){
            if(inputsValues[i] === ""){return true;}
        }
        
        if(errors.length > 0){return true;}
        
        return false;
    };
    
    //Set object with info about nickname, password of user  
    this._setUserData = function(formName){
        var selector = "#" + formName + "";
        var arr = $(selector).serializeArray();

        var obj = {};
        $.each(arr, function(i, field){ 
            obj[field.name] = field.value;                       
        });
        
        return obj;
    };
        
    //Shows result of user registration
    /*this._showUserSignUpResults = function(response){       
        this._messenger._f7.alert("Registration successful!", "Messenger", this._hideForm("signUpForm"));
    };
    
    //Logs in user after successful registration
    this._logInAfterSignUp = function(){
        var userLogInStatus = {
            status: true
        };
        this._messenger._saveUserLogInStatus(userLogInStatus);
        
        var userData = this._messenger._getUserDataStorage();
        $("#linkUserAccount").text(userData.nickname);
        $("#userImgPanel").data("name", userData.nickname);
        that._showUserInfo();
    };*/
     
    //Logs out user
    this._userLogOut = function(){
        this._hideUserInfo();
        
        var userLogInStatus = {
            status: false
        };
        this._messenger._saveUserLogInStatus(userLogInStatus);
        
        //$("#userImgPanel").hide();
        
        this._showHomePage();
    };
       
    //Prepares name of sender for attribute data-user-name in template
    this._prepareAttrSenderName = function(item){
        //debugger;
        var tmpSender = item.sender.split(" ");
        //var tmpSender = item.sender_name.split(" ");
        var sender = "";
        
        tmpSender.forEach(function(item){
            sender += item + ".";
        });
        
        var length = sender.length;
        sender = sender.slice(0, length - 1);
        
        return sender;
    };
    
    //Prepares name of sender for Image in template
    this._prepareSenderNameImg = function(item){
        var senderImg = item.sender.split(" ");
        senderImg = senderImg[0];
        
        return senderImg;
    };
    
    //Prepares pub date for template
    /*this._preparePubDate = function(item){
        var pubDate = item.pub_date;
        var indx = pubDate.indexOf(".");
        pubDate = pubDate.slice(0, indx);
        indx = pubDate.lastIndexOf(":");
        pubDate = pubDate.slice(0, indx);
        
        //create array where [0] = YYYY-MM-DD and [1] = hours:minutes
        pubDate = pubDate.split(" ");
        
        var dateNow = new Date();
        var dayNow = dateNow.getDate();
        
        
        
        var daySaved = pubDate[0];
        daySaved = daySaved.split("-");
        daySaved = daySaved[2] * 1;
        
        //Returns YYYY-MM-DD or hours:minutes:seconds
        if(daySaved === dayNow){
            return pubDate[1];
        }else{
            return pubDate[0];
        }
    };*/
    this._preparePubDate = function(item){
        var pubDate = item.pub_date;
        var indx = pubDate.indexOf(".");
        pubDate = pubDate.slice(0, indx);
        indx = pubDate.lastIndexOf(":");
        pubDate = pubDate.slice(0, indx);
        
        //create array where [0] = YYYY-MM-DD and [1] = hours:minutes
        pubDate = pubDate.split(" ");
        
        var dateNow = new Date();
        var dayNow = dateNow.getDate();
           
        var daySaved = pubDate[0];
        daySaved = daySaved.split("-");
        var yearSaved = daySaved[0] * 1;
        var monthSaved = daySaved[1] * 1 - 1;
        daySaved = daySaved[2] * 1;
        
        var timeSaved = pubDate[1];
        timeSaved = timeSaved.split(":");
        var hourSaved = timeSaved[0] * 1;
        var minutesSaved = timeSaved[1] * 1;
        
        
        var dateSavedLocal = new Date(Date.UTC(yearSaved, monthSaved, daySaved, hourSaved, minutesSaved));
        dateSavedLocal = dateSavedLocal.toString();
        dateSavedLocal = dateSavedLocal.split(" ");
        daySaved = dateSavedLocal[2] * 1;
        
        var res;
        //Returns YYYY-MM-DD or hours:minutes:seconds
        if(daySaved === dayNow){
            //return pubDate[1];
            res = dateSavedLocal[4];
            res = res.split(":");
            
            return res[0] + ":" + res[1];
        }else{
            //return pubDate[0];
            res = dateSavedLocal[1] + "-" + dateSavedLocal[2] + "-" + dateSavedLocal[3];
            return res;
        }
    };
    
    //Prepares name of sender of template
    this._prepareSenderName = function(item){
        //debugger;
        var content, res;

        if(item.sender.length > 10){
            content = item.sender;
            res = content.slice(0,10) + "...";
            return res;
        }else{
            return item.sender;
        }
    };
    
    //Prepares title of message for template
    this._prepareMessageTitle = function(item){
        var content, res;

        if(item.subject.length > 10){
            content = item.subject;
            res = content.slice(0,10) + "...";
            return res;
        }else{
            return item.subject;
        }
    };
    
    //Prepares content of messasge for template
    this._prepareMessageContent = function(item){
        var content, res;
     
        if(item.contentBeforeImg.length > 10){
            content = item.contentBeforeImg;
            res = item.contentBeforeImg.slice(0,10) + "...";
            item.contentBeforeImg = res;
            item.contentAfterImg = "";
        }else if(item.imgSrc.length > 0){
            item.contentAfterImg = "...";
        }else if(item.contentAfterImg.length > 10){
            content = item.contentAfterImg;
            res = item.contentAfterImg.slice(0,10) + "...";
            item.contentAfterImg = res;
        }
        
        return item;
    };
     
    //Renders list of messages of all users
    this._renderAllUsersAllMessages = function(response){
        //debugger;
        var messages = response; 
        
        var allUsersAllMessagesHtml = "";
        
        messages.forEach(function(item, i){
            //debugger;
            var preparedData = {};
            preparedData.sender = that._prepareAttrSenderName(item);
            preparedData.senderImg = that._prepareSenderNameImg(item);
            preparedData.pubDate = that._preparePubDate(item);
            preparedData.previewSender = that._prepareSenderName(item);
            preparedData.previewTitle = that._prepareMessageTitle(item);
     
            var newContent = that._messenger._cutImage(item.textmessage);
            var previewContent = that._prepareMessageContent(newContent);
            
            var data = {            
                messageId: item.messageId,
                dataNameImg: preparedData.senderImg,
                sender: preparedData.previewSender,
                dataSender: preparedData.sender,
                pubDate: preparedData.pubDate,
                title: preparedData.previewTitle ,
                content: preparedData.previewContent,
                readStatus: item.readStatus,
                contentBeforeImg: newContent.contentBeforeImg,
                imgSrc: newContent.imgSrc,
                contentAfterImg: newContent.contentAfterImg
            };
            
            var template;
            if(newContent.contentBeforeImg.length > 10 || newContent.contentAfterImg.length > 10){
                template = $("#allMessagesWithoutImgTemplate").html();
                allUsersAllMessagesHtml += Mustache.render(template, data); 
            }else{
                template = $("#allUsersAllMessagesTemplate").html();
                allUsersAllMessagesHtml += Mustache.render(template, data); 
            }
        });
                                   
        return allUsersAllMessagesHtml;
    };
    
    //Renders all messages of all users for user logined
    /*this._renderMessagesLogined = function(){
        var messages = that._messenger._getMessages();
        var allUsersAllMessages = that._renderAllUsersAllMessages(messages);
        that._addAllUsersAllMessages(allUsersAllMessages);
        that._showAllUsersAllMessages();
    };*/
    
    //initializes user avatar with initial.js
    this._initUserImg = function(settings){
        $(".profile").initial({
            height: settings.heigth,
            width: settings.width,
            fontSize: settings.fontSize});
    };
    
    //Sets font-weight for messages in depend on it is readed or not
    this._setFontWeightMessage = function(){
        $("a").each(function(indx){
            var readStatus = $(this).data("message-read");
            
            if(readStatus !== "" || readStatus !== undefined || readStatus !== null){
                if(readStatus === "readNo"){
                    $(this).css("font-weight", "bold");
                }else{
                    $(this).css("font-weight", "normal");
                }
            }
        });
    };
       
    //Adds list of all messages of all users
    this._addAllUsersAllMessages = function(allUsersAllMessages){ 
        if(allUsersAllMessages === "" || allUsersAllMessages === undefined || allUsersAllMessages === null){
            this._showNoMessagesInfo();
            
            return false;
        }

        $("#allUsersAllMessagesList").empty();
        $("#allUsersAllMessagesList").append(allUsersAllMessages); 
        
        this._setFontWeightMessage();
        
        //Today
        
       /*$(".divContent").each(function(num, el){
            debugger;
            var messageId = $(this).data("message-id");
            
            var message = that._messenger._getOneMessage(messageId);
            var newContent = that._messenger._cutImage(message.textmessage);
            
            var content = that._prepareMessageContent(newContent); 
            
            var $pBeforeImg = $("<p>").html(content.contentBeforeImg);              
            var $pAfterImg = $("<p>").html(content.contentAfterImg);

            $(this)
                .prepend($pBeforeImg)
                .append($pAfterImg); 
        });*/
        
        //
     
        var settigs = {
            heigth: 44,
            width: 44,
            fontSize: 18
        };
        this._initUserImg(settigs);
    };
    
    //Shows list of all messages of users
    this._showAllUsersAllMessages = function(){
        $("#homePage").hide();
        $("#userMessage").hide();
        $("#firstEnterPage").hide();
        $("#allUsersAllMessages").show();
    };
    
    //Shows link open left panel
    this._showLinkOpenPanel = function(){
        var linkOpenPanel = $("<a href='#' id='linkOpenPanel' class='open-panel' style='font-size: 20px; color: black; margin-left: 10px; border-color: #DED9D9;'><i class='icon ion-navicon-round'></i></a>");
        $(".left").empty();
        $(".left").append(linkOpenPanel);
    };
  
    //Shows link back to list of all messages
    this._showLinkBackList = function(){
        var linkBackList = $("<a href='#' id='linkBackList' class='button' style='font-size: 20px; color: black; margin-right: 11px; border-color: #DED9D9;'><i class='icon ion-android-arrow-back' style='width: 13px;'></i></a>");
        $(".left").empty();
        $(".left").append(linkBackList);
    };
    
    //Shows link back to list of all messages from navbarSearch
    this._showLinkBackListFromSearch = function(){
        var linkBackList = $("<a href='#' id='linkBackListFromSearch' class='button' style='font-size: 20px; color: black; margin-left: 0px; border-color: white;'><i class='icon ion-android-arrow-back'  ></i></a>");
        $(".left").empty();
        $(".left").append(linkBackList);
    };
    
    //Shows link search in navbar Search
    this._showLinkSearch = function(){
        var linkSearch = $("<a href='#' id='linkSearchNavbar' class='button' style='font-size: 20px; color: black; border-color: white;'><i class='icon ion-android-search'></i> </a>");
        $(".right").empty();
        $(".right").append(linkSearch);   
    };
    
    //Shows link popover in navbar
    this._showLinkPopover = function(){
        var linkPopover = $("<a href='#' id='linkNavPopover' class='open-popover button' data-popover='.popover-actions' style='font-size: 20px; color: black;  border-color: #DED9D9;'><i class='icon ion-android-more-vertical'></i></a>");
        $(".right").empty();
        $(".right").append(linkPopover);
    };
    
    //Shows link delete messasge
    this._showLinkDeleteMessage = function(messageId){
        var linkDelete = $("<a href='#' id='linkDeleteMessage' class='button' data-message-id='' style='font-size: 20px; color: black;  border-color: #DED9D9; text-align: left;'><i class='icon ion-trash-b'></i></a>");
        $(".right").empty();
        $(".right").append(linkDelete);
        $("#linkDeleteMessage").data("message-id", messageId);
    };
          
    //Renders message of user
    /*this._renderUserMessage = function(messageId){
        var message = this._messenger._getOneMessage(messageId);
        
        var preparedData = {};
        
        preparedData.pubDate = this._preparePubDate(message);
        preparedData.senderImg = this._prepareSenderNameImg(message);
        
        var newContent = that._messenger._cutImage(message.textmessage);
        
        var data = {
            messageId: message.messageId,
            dataNameImg: preparedData.senderImg,
            userName: message.sender,
            title: message.subject,
            //content: message.textmessage,
            pubDate: preparedData.pubDate,
            //contentBeforeImg: newContent.contentBeforeImg,
            imgSrc: newContent.imgSrc,
            //contentAfterImg: newContent.contentAfterImg
        };
        
        //var template = $("#userMessageTemplate").html();
        var template;
        var userMessage;
        if(newContent.imgSrc.length > 0){
            template = $("#userMessageTemplate").html();
            userMessage = Mustache.render(template, data); 
        }else{
            template = $("#userMessageWithoutImgTemplate").html();
            userMessage = Mustache.render(template, data); 
        }
        
        //return Mustache.render(template, data);
        return userMessage;
    };*/
    
    //Renders message of user with Sqlite
    this._renderUserMessage = function(messageId){
        //debugger;
        var def = $.Deferred();
        
        var messageSql = this._messenger._getOneMessageSql(messageId);
        
        messageSql.done(function(message){
            //debugger;
            var preparedData = {};
        
            preparedData.pubDate = that._preparePubDate(message[0]);
            preparedData.senderImg = that._prepareSenderNameImg(message[0]);

            var newContent = that._messenger._cutImage(message[0].textmessage);

            var data = {
                messageId: message[0].messageId,
                dataNameImg: preparedData.senderImg,
                userName: message[0].sender,
                title: message[0].subject,
                //content: message.textmessage,
                pubDate: preparedData.pubDate,
                //contentBeforeImg: newContent.contentBeforeImg,
                imgSrc: newContent.imgSrc,
                //contentAfterImg: newContent.contentAfterImg
            };

            //var template = $("#userMessageTemplate").html();
            var template;
            var userMessage;
            if(newContent.imgSrc.length > 0){
                template = $("#userMessageTemplate").html();
                userMessage = Mustache.render(template, data); 
            }else{
                template = $("#userMessageWithoutImgTemplate").html();
                userMessage = Mustache.render(template, data); 
            }

            //return Mustache.render(template, data);
            def.resolve(userMessage, message); 
        });
        
        return def.promise();
    };
    
    //Adds user message
    /*this._addUserMessage = function(userMessage){
        debugger;
        $("#userMessage").empty();     
        $("#userMessage").append(userMessage);
        
        var $imgDiv = $("[data-image-div]");
        var messageId = $imgDiv.data("message-id");
            
        var message = this._messenger._getOneMessage(messageId);
        var newContent = that._messenger._cutImage(message.textmessage);
        
        var hasImageBefore = newContent.contentBeforeImg.indexOf("<img");
        var hasImageAfter = newContent.contentAfterImg.indexOf("<img");
        
        var $imgOneMessage = $("#imgMessageOne");
        //var width = $imgOneMessage.css("width");
        var width;
        var height;    
        var screenHeight = screen.height;
        
        var $pBeforeImg = $("<p id='pBeforeImg'>").html(newContent.contentBeforeImg);              
        var $pAfterImg = $("<p id='pAfterImg'>").html(newContent.contentAfterImg);
            
        $imgDiv
            .prepend($pBeforeImg)
            .append($pAfterImg); 
          
        $("#userMessage img").each(function(num, el){        
            if(num !== 0){// pass image of user name
                var widthImg = $(this).css("width");
                var heightImg = $(this).css("height");
            
                if(heightImg === "0px"){
                    if(screenHeight < 800){
                        height = 250;
                    }else{
                        height = 450;
                    }
                }
            
                if(widthImg === "0px"){
                    $(this).css("width", "100%");
                }
            }
        });
      
        //
           
        var settigs = {
            heigth: 44,
            width: 44,
            fontSize: 18
        };
        this._initUserImg(settigs);
    };*/
        //Adds user message
    this._addUserMessage = function(userMessage, message){
        //debugger;
        $("#userMessage").empty();     
        $("#userMessage").append(userMessage);
        
        var $imgDiv = $("[data-image-div]");
        //var messageId = $imgDiv.data("message-id");
            
        //var message = this._messenger._getOneMessage(messageId);
        var newContent = that._messenger._cutImage(message[0].textmessage);
        
        var hasImageBefore = newContent.contentBeforeImg.indexOf("<img");
        var hasImageAfter = newContent.contentAfterImg.indexOf("<img");
        
        var $imgOneMessage = $("#imgMessageOne");
        //var width = $imgOneMessage.css("width");
        var width;
        var height;    
        var screenHeight = screen.height;
        
        var $pBeforeImg = $("<p id='pBeforeImg'>").html(newContent.contentBeforeImg);              
        var $pAfterImg = $("<p id='pAfterImg'>").html(newContent.contentAfterImg);
        
        if($imgDiv.length > 0){
            $imgDiv
                .prepend($pBeforeImg)
                .append($pAfterImg);
        }else{
            $("#contentMassage").append($pBeforeImg).append($pAfterImg);
        }
                
        $("#userMessage img").each(function(num, el){        
            if(num !== 0){// pass image of user name
                var widthImg = $(this).css("width");
                var heightImg = $(this).css("height");
            
                if(heightImg === "0px"){
                    if(screenHeight < 800){
                        height = 250;
                    }else{
                        height = 450;
                    }
                }
            
                if(widthImg === "0px"){
                    $(this).css("width", "100%");
                }
            }
        });
      
        //
           
        var settigs = {
            heigth: 44,
            width: 44,
            fontSize: 18
        };
        this._initUserImg(settigs);
    };
       
    //Shows content of message of user
    this._showUserMessage = function(){
        $("#allUsersAllMessages").hide();
        $("#userMessage").show();
    };
    
    //Adds new user messsage to list of all messages of all users after checking
    this._addMessageNew = function(messagesParam){
        //debugger;
        var messages = this._renderAllUsersAllMessages(messagesParam);
        
        $("#noMessagesFound").remove();
        $("#noMessagesInfo").remove();     
        $("#allUsersAllMessagesList").prepend(messages);
                 
        //this._setFontWeightMessage();
        that._setFontWeightMessage();
        
        var settigs = {
            heigth: 44,
            width: 44,
            fontSize: 18
        };
        this._initUserImg(settigs);
    };
      
    //Sets forms validation
    $(function(){     
        var signUpForm = $("#signUpForm").attr("id");
        that._setFormValidate(signUpForm);
        
        var logInForm = $("#logInForm").attr("id");
        that._setFormValidate(logInForm);        
    });
    
    //Registers user
    /*$("#signUpForm").submit(function(e){
        e.preventDefault();

        var formName = $(this).attr("id");
        var errors =  that._checkValidateErrors(formName);         
        if(errors){return false;}

        var savedUserData = that._messenger._getUserDataStorage();       
        if(savedUserData){
            that._messenger._f7.confirm("You will lose your old nickname and old password!", "Messenger",
                function(){
                    var userData = that._setUserData(formName);
                    that._messenger._userSignUp(userData);
                    that._hideForm("signUpForm");
                    that._showUserSignUpResults();
                },
                function(){
                    that._hideForm("signUpForm");
            });  
        } else{
            var userData = that._setUserData(formName);         
            that._messenger._userSignUp(userData);
            that._showUserSignUpResults();
                       
            $(this).trigger("reset"); 
        }            
    });*/
    
    //Hides first enter page after click button close
    $("#btnFirstEnterPageClose").click(function(){
        var userData = that._messenger._getUserDataStorage();
        
        $("#linkOpenPanel").show();
        $(".btnLogIn").hide();
        $(".btnLogOut").css("display", "block");
        $("#linkUserAccount").text(userData.userName);
        $("#linkUserAccount").show();
        $("#linkNavPopover").show();
        
        that._hideFirstEnterPage();
        that._showAllUsersAllMessages();
        
        that._messenger._renderAllUsersAllMessages();
        
        that._addPlanshetCss();
        that._showDashboard();
        
       // var statusInitRequest = true;
       // that._messenger._saveStatusInitRequest(statusInitRequest);

        //that._messenger._initRequestOverMinute();
        
        //that._messenger._openSocket();
        that._messenger._openSocketSql();
    });
       
    //Authorizes user
    $("#logInForm").submit(function(e){
        e.preventDefault();
        
        var formName = $(this).attr("id");
        
        var errors =  that._checkValidateErrors(formName);      
        if(errors){return false;}
        
        var userData = that._setUserData(formName);
        var login = that._messenger._userLogIn(userData); 
        if(login){
            that._hideForm("logInForm");
            $("#linkUserAccount").text(userData.userName);
            //Adds imade of user to panel with data-name
            //$("#userImgPanel").data("name", userData.nickname);
            //$("#userImgPanel").show();
            //$("#linkClosePanel")[0].click();
            that._messenger._userLogInServer(userData);           
            that._showUserInfo(); 
            
            that._addPlanshetCss();
            that._showDashboard();
            $(".linkDashboard").show();
            
            //var statusInitRequest = true;
            //that._messenger._saveStatusInitRequest(statusInitRequest);
            //var messages = this._messenger._getMessages();
            
            //this._messenger._initRequestOverMinute();
            
            that._messenger._renderAllMessagesLoginedSql();
            that._messenger._checkMessagesNew();
            //this._messenger._openSocket();
            
            //that._messenger._openSocketSql();
        }else{
            $(this).trigger("reset");
            that._messenger._f7.alert("Invalid login or password!", "chpok.online");
        }     
    });
    
    //Clears log in Form after click on button log in
    $(".btnLogIn").click(function(){
        $("#logInForm label").hide();
        
        $("#linkClosePanel")[0].click();
    });
    
    //Clears log in Form after click on button log out
    $(".btnLogOut").click(function(){
        that._userLogOut();
        $(".btnLogIn").trigger("reset");
        
        $("#linkClosePanel")[0].click();
        
        $(".linkDashboard").hide();
        that._hideDashboard();
        
        var statusInitRequest = false;
        that._messenger._saveStatusInitRequest(statusInitRequest);
    });
    
    //Clear in sign up form label with class error
    /*$("#btnSignUp").click(function(){
        $("#signUpForm label").hide();
    });*/
    
    //Clears sign up form if user close form
    /*$("#btnSignUpFormClose").click(function(){
        $("#signUpForm").trigger("reset");
        $("#signUpForm label").hide();
    });*/
    
    //Clears log in form if user close form
    $("#btnsRowLogInForm").on("click", "a", function(){
        $("#logInForm").trigger("reset");
        $("#logInForm label").hide();
    });
    
    //Renders info of user in account form
    $("#linkUserAccount").click(function(){
        var savedUserData = that._messenger._getUserDataStorage();
        $("#userNameAccount").text(savedUserData.userName);
        //$("#userEmailAccount").text(savedUserData.email);
        $("#userPasswordAccount").text(savedUserData.password);
        
    });
      
    //Shows content of the messsage of concrete user
    /*$("#allUsersAllMessagesList").on("click", ".messageView", function(){
        debugger;
        var userName = $(this).data("user-name");
        var messageId = $(this).data("message-id");
        console.log(userName);
        console.log(messageId);

        //Check exists or not navar Search
        var navbarExist = $("#navbarMain").css("display");
        if(navbarExist === "none"){
            return false;
        }

        var message = that._renderUserMessage(messageId);
        that._addUserMessage(message);
        that._showUserMessage();
        
        that._showLinkBackList();
        $("#centerMain").css("margin-right", "12px");
        
        //Sets attribute message-read is "read" and saves meassage with property readStatus = "read" to local storage
        var readStatus = $(this).data("message-read");
        if(readStatus === "readNo"){
            $(this).find("div").css("font-weight", "normal");
        }

        //Chanes property readStatus on read because message is readed
        var messages = that._messenger._getMessages();
        messages.forEach(function(item){
            if(messageId === item.messageId){
                item.readStatus = "read";
                       
                return false;
            }
        });
        that._messenger._saveMessages(messages);
          
        that._showLinkDeleteMessage(messageId);
        //$("#linkDeleteMessage").data("message-id", messageId);
        //that._showLinkDeleteMessage();// Change method!!!!
        
    });  */
    
    //Shows content of the messsage of concrete user
    $("#allUsersAllMessagesList").on("click", ".messageView", function(){
        //debugger;
        var userName = $(this).data("user-name");
        var messageId = $(this).data("message-id");
        console.log(userName);
        console.log(messageId);

        //Check exists or not navbar Search
        var navbarExist = $("#navbarMain").css("display");
        if(navbarExist === "none"){
            return false;
        }
        
        //Sets attribute message-read is "read" and saves meassage with property readStatus = "read" to local storage
        var readStatus = $(this).data("message-read");
        if(readStatus === "readNo"){
            $(this).find("div").css("font-weight", "normal");
        }

        var messageSql = that._renderUserMessage(messageId);
        
        messageSql.done(function(messageHtml, message){
            //debugger;
            that._addUserMessage(messageHtml, message);
            that._showUserMessage();

            that._showLinkBackList();
            $("#centerMain").css("margin-right", "12px");

            that._showLinkDeleteMessage(messageId); 
            
            //Chanes property readStatus on read because message is readed
            message[0].readStatus = "read";
            
            var tmpMessage = [{
                messageId: message[0].messageId,
                sender: message[0].sender,
                subject: message[0].subject,
                textmessage: message[0].textmessage,
                pub_date: message[0].pub_date,
                readStatus: "read",
                srcImg: message[0].srcImg
            }];
            
            var deleteSql = that._messenger._deleteMessageSql(message[0].messageId);
            deleteSql.done(function(){
                
                var saveMessageSql = that._messenger._saveMessagesSql(tmpMessage);
                    saveMessageSql.done(function(){
                    console.log("save message after render one message");
                });
            });
        });
    });  
     
    //Deletes message from list of all messages
    /*$("#allUsersAllMessagesList").on("click", ".linkDeleteMessage", function(){
        //Check exists or not navar Search
        var navbarExist = $("#navbarMain").css("display");
        if(navbarExist === "none"){
            return false;
        }
        
        var messageId = $(this).data("message-id");
        console.log("messageId - " + messageId);     
        that._messenger._deleteMessage(messageId);

        var messages = that._messenger._getMessages();
        if(messages.length === 0 || messages === undefined || messages === null){
            that._showNoMessagesInfo();
        }           
    });*/  
    //Deletes message from list of all messages
    $("#allUsersAllMessagesList").on("click", ".linkDeleteMessage", function(){
        //Check exists or not navar Search
        var navbarExist = $("#navbarMain").css("display");
        if(navbarExist === "none"){
            return false;
        }
 
        var messageId = $(this).data("message-id");     
        var deleteMessageSql = that._messenger._deleteMessageSql(messageId);
        
        deleteMessageSql.done(function(){  
            var messagesSql = that._messenger._getMessagesSql();
            
            messagesSql.done(function(messages){
                if(messages.length === 0 || messages === undefined || messages === null){
                    that._showNoMessagesInfo();
                } 
            });
        });      
    });
        
    //Deletes all messages from list of all messages
    /*$("#linkDeleteAllMessages").click(function(){
        var messages = that._messenger._getMessages();
        
        if(messages.length === 0 || messages === undefined || messages === null){
            return false;
        }
        
        that._messenger._f7.confirm("Delete all messages?", "Connect Me",
            function(){
                that._messenger._f7.closeModal();
                that._messenger._deleteAllMessages();
                that._renderMessagesLogined();
            },
            function(){
                that._messenger._f7.closeModal();
            }
        );
    });*/  
    //Deletes all messages from list of all messages with Sqlite from popover
    $("#linkDeleteAllMessages").click(function(){
        var loginStatus = that._messenger._getUserLogInStatus();
        if(loginStatus.status === false){
            return false;
        }
        
        var messagesSql = that._messenger._getMessagesSql();
        
        messagesSql.done(function(messages){
            if(messages.length === 0 || messages === undefined || messages === null){
                return false;
            }
        
            that._messenger._f7.confirm("Delete all messages?", "Chpok online",
                function(){
                    that._messenger._f7.closeModal();

                    var deletemessagesSql = that._messenger._deleteAllMessagesSql();
                    
                    deletemessagesSql.done(function(){
                        var messagesSql = that._messenger._getMessagesSql();

                        messagesSql.done(function(messages){
                            if(messages.length === 0 || messages === undefined || messages === null){
                                that._showNoMessagesInfo();
                                that._showAllUsersAllMessages();
                            }else{
                                that._messenger._renderAllMessagesLoginedSql();
                            }    
                        });
                    });
                },
                function(){
                    that._messenger._f7.closeModal();
                }
            );
        });
    });
    
    //Deletes message when open view message content
    /*$(".right").on("click", "#linkDeleteMessage", function(){
        var messageId = $("#linkDeleteMessage").data("message-id");
        that._messenger._deleteMessage(messageId);

        var messages = that._messenger._getMessages();
        if(messages.length === 0 || messages === undefined || messages === null){
            that._showNoMessagesInfo();
            that._showAllUsersAllMessages();
        }else{
            that._renderMessagesLogined();
        }  
        
        that._showLinkOpenPanel();
        that._showLinkPopover();
    });*/   
    //Deletes message when open view message content with Sqlite
    $(".right").on("click", "#linkDeleteMessage", function(){
        var messageId = $("#linkDeleteMessage").data("message-id");
     
        var deleteMessageSql = that._messenger._deleteMessageSql(messageId);
        
        deleteMessageSql.done(function(){   
            var messagesSql = that._messenger._getMessagesSql();
            
            messagesSql.done(function(messages){
                if(messages.length === 0 || messages === undefined || messages === null){
                    that._showNoMessagesInfo();
                    that._showAllUsersAllMessages();
                }else{
                    //that._renderMessagesLogined();
                    that._messenger._renderAllMessagesLoginedSql();
                }  

                that._showLinkOpenPanel();
                that._showLinkPopover();  
            });
        });
    });
           
    //Closes content of message
    $(".left").on("click", "#linkBackList", function(){
        $("#centerMain").css("margin-right", "0");
        
        that._showLinkPopover();
        that._showLinkOpenPanel();
        that._showAllUsersAllMessages();
    });
    
    //Redirects to home page
    /*$("#linkHomePage").click(function(){
        $("#linkClosePanel")[0].click();
        that._showAllUsersAllMessages ();
    });*/
    
    //Shows new navbar for search messages by userName
    $("#linkSearch").click(function(){
        var loginStatus = that._messenger._getUserLogInStatus();
        if(loginStatus.status === false){
            return false;
        }
        
        $("#closeDashboard")[0].click();
        
        $("#navbarMain").hide();
        $("#navbarSearh").show(); 
        
        $("#pageContent").css("background-color", "#999999");
        $("#allUsersAllMessagesList").css("background-color", "#999999");
        
        that._messenger._f7.closeModal();     
        that._showLinkBackListFromSearch();  
        that._showLinkSearch();
    });
     
    //Closes navbar for search messages and shows navbar main
    $(".left").on("click", "#linkBackListFromSearch", function(){
        $("#inputSearchNavbar").val("");
        $("#navbarSearh").hide();
        $("#navbarMain").show();
        
        //$("#pageContent").css("background-color", "#EFEFF4");
        $("#allUsersAllMessagesList").css("background-color", "#C3C0C0");
        
        that._showLinkPopover();
        that._showLinkOpenPanel();
    });
    
    //Finds result of search
    /*$(".right").on("click", "#linkSearchNavbar", function(){
        var searchConditions = $("#inputSearchNavbar").val();
        $("#inputSearchNavbar").val("");
        
        that._messenger._findMessages(searchConditions);
        
        $("#navbarSearh").hide();
        $("#navbarMain").show();
        
        $("#pageContent").css("background-color", "#EFEFF4");
        $("#allUsersAllMessagesList").css("background-color", "#fff");
        
        that._showLinkPopover();
        that._showLinkOpenPanel();
    });*/
    //Finds result of search
    $(".right").on("click", "#linkSearchNavbar", function(){
        var searchConditions = $("#inputSearchNavbar").val();
        $("#inputSearchNavbar").val("");
        
        that._messenger._findMessagesSql(searchConditions);
        
        $("#navbarSearh").hide();
        $("#navbarMain").show();
        
        $("#pageContent").css("background-color", "#EFEFF4");
        $("#allUsersAllMessagesList").css("background-color", "#fff");
        
        that._showLinkPopover();
        that._showLinkOpenPanel();
    });
    
    //Shows all messages from popover
    /*$("#linkAllMessages").click(function(){
        that._messenger._f7.closeModal();
        that._renderMessagesLogined();
    });*/
    //Shows all messages from popover
    $("#linkAllMessages").click(function(){
        var loginStatus = that._messenger._getUserLogInStatus();
        if(loginStatus.status === false){
            return false;
        }
        
        that._messenger._f7.closeModal();
        that._messenger._renderAllMessagesLoginedSql();
    });
    
    //Shows dashboard
    $(".linkDashboard").click(function(){
        var loginStatus = that._messenger._getUserLogInStatus();
        if(loginStatus.status === false){
            return false;
        }
        
        that._messenger._f7.closeModal();
        $("#linkClosePanel")[0].click();
        that._showDashboard();    
    });
    
    //Hides dashboard
    $("#closeDashboard").click(function(){
        that._hideDashboard();
    });
         
    $("#test").click(function(){            
        //that._messenger._deleteMessagesOld();
        
        that._messenger._renderAllUsersAllMessages();
        
        //that._messenger._checkMessagesNew();
        //that._messenger._deleteAllMessagesSql();
        //that._messenger._deleteMessagesOldSql();
        //that._messenger._renderAllMessagesLoginedSql();
        //that._renderHomePage();
    });
    
    $("#test2").click(function(){   
        that._messenger._deleteMessageSql(572);
        that._messenger._deleteMessageSql(573);

    });
};