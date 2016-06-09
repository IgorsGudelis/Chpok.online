/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false */
/* jshint strict: false, -W117 */

var app = {
    Constructors: {}
};

app.Constructors.Messenger = function(framework7, $$, mainView){
    var that = this;
    var messengerView = new app.Constructors.MessengerView(this);
    
    this._f7 = framework7;
			
    this._$$ = $$;

    this._mainView = mainView;
       
    this._messages = [];
    
    //Checks first user enter to app
    this._checkFirstEnter = function(){
        var firstEnter = this._getFirstEnter();
        if(firstEnter === null || firstEnter !== false){
            this._sendFirstEnter();
        }
    };
     
    //Saves data of user in local storage
    this._saveUserDataStorage = function(userData){
        localStorage.setItem("user-data-access", JSON.stringify(userData));
    };
    
    //Gets data of user from local storage
    this._getUserDataStorage = function(){             
        return JSON.parse(localStorage.getItem("user-data-access"));
    };
    
    //Save log in user or not in local storage
    this._saveUserLogInStatus = function(userLogInStatus){
        localStorage.setItem("user-logIn-status", JSON.stringify(userLogInStatus));        
    };
    
    //Get log in user or not from local storage
    this._getUserLogInStatus = function(){
        return JSON.parse(localStorage.getItem("user-logIn-status"));        
    };
    
    //Saves first enter to app
    this._saveFirstEnter = function(userData){
        localStorage.setItem("first-enter", JSON.stringify(userData));
    };
    
    //Gets data of first enter to app of user
    this._getFirstEnter = function(){
        return JSON.parse(localStorage.getItem("first-enter"));
    };
    
    this._saveCountSave = function(count){
        localStorage.setItem("count-save", JSON.stringify(count));
    };
    
    this._getCountSave = function(){
        return JSON.parse(localStorage.getItem("count-save"));
    };
    
    //Sorts messages by messageId
    this._sortMessages = function(messages){  
        var n = messages.length;
        
        for (var i = n - 1; i >= 0; i--){ 
            for (var j = n - 1; j > 0; j--){
                if (messages[j-1].messageId < messages[j].messageId)
                { 
                    var tmpMessage = messages[j-1]; 
                    messages[j-1] = messages[j];
                    messages[j] = tmpMessage; 
                }
            }
        } 
       
        return messages;
    };
    
    //Saves messages to local storage
    this._saveMessages = function(messagesNew){    
        this._addMessages(messagesNew);
 
        localStorage.setItem("user-messages", JSON.stringify(this._messages));
    };
    
    //Gets messages from local storage
    this._getMessages = function(){
        var messages =  JSON.parse(localStorage.getItem("user-messages"));
        if(messages !== null){
            return messages;
        }
    };
    
    //Opens database in Web SQL
    this._openDatabase = function(){
        return openDatabase("connectMeDb", "1.0", "ConnectMe WebSQL Database", 65536);
    };
      
    //Creates table in Web SQL
    this._createTable = function(){
        //debugger;
        var def = $.Deferred();
        var db = this._openDatabase();
        
        db.transaction(function (tx) {
           //debugger;
           
        tx.executeSql('DROP TABLE IF EXISTS messages');
           
        tx.executeSql("CREATE TABLE IF NOT EXISTS messages (messageId integer primary key, sender TEXT, subject TEXT, textmessage TEXT, pub_date TEXT, readStatus TEXT, srcImg TEXT)");
        });
        
        //db.transaction(function(tx){
        //    tx.executeSql("DROP TABLE connectMeDb");
        //}); 
        
        /*db.transaction(function(tx){
           tx.executeSql("DELETE FROM messages");
        });*/
        
        return def.promise();
    };
       
    //Saves messages to Web SQL
    this._saveMessagesSql = function(messages){   
        this._addMessages(messages);

        var def = $.Deferred();       
        var db = this._openDatabase();
        var length = messages.length;
        
        messages.forEach(function(item, i){
            db.transaction(function (tx) {
                tx.executeSql("INSERT INTO messages (messageId, sender, subject, textmessage, pub_date, readStatus, srcImg) VALUES (?, ?, ?, ?, ?, ?, ?)", [item.messageId, item.sender, item.subject, item.textmessage, item.pub_date, item.readStatus, item.srcImg]);
                
                if(i === length - 1){
                    def.resolve();
                }
            });
        }); 
        
        return def.promise();
    };
      
    //Gets messages form Web SQL
    this._getMessagesSql = function(){
        //debugger;
        var def = $.Deferred();
        
        var db = that._openDatabase();
        var tmpMessages = [];
        
        db.transaction(function (tx) {
            tx.executeSql("SELECT * FROM messages", [], function(tx, results) {
                //debugger;
                if(results.rows.length > 0) {
                    for(var i = 0; i < results.rows.length; i++) {
                        tmpMessages.unshift(results.rows.item(i));
                        
                        console.log("Result -> " + results.rows.item(i).messageId + ". " + results.rows.item(i).sender + " " + results.rows.item(i).readStatus);
                    }
                }
                
                def.resolve(tmpMessages);
            });
        });
        
        return def.promise();
    };
    
    //Cuts last message in response of server becouse it already exsist
    /*this._cutMessageLast = function(messages){
        messages.pop();
        
        return messages;
    };*/
    
    //Cuts message that has existed already
    /*this._cutMessageEqual = function(messages){ 
        var messagesSaved = this._getMessages();
        var length = messagesSaved.length; 
        var lastMessageStatus = this._getLastMessageStatus();
        
        //Checks messages in local storage - if they were deleted so cuts last message in response
        if(lastMessageStatus !== "exist" || messagesSaved.length === 0 || messagesSaved === undefined || messagesSaved === null){
            messages.splice(messages.length - 1, 1);
        }else{
            messages.forEach(function(item, i){
                for(var j = 0; j < length; j++){
                    if(item.messageId === messagesSaved[j].messageId){
                        messages.splice(i, 1);

                        return messages;
                    }
                }
            });
        }
              
        return messages;
    };*/
    
    //Cuts message that has existed already with Sqlite
    this._cutMessageEqualSql = function(messages){ 
        var def = $.Deferred();
        
        //debugger;
        var lastMessageStatus = this._getLastMessageStatus();
        var messagesSavedSql = that._getMessagesSql();
        
        messagesSavedSql.done(function(messagesSaved){
           //debugger;
            var length = messagesSaved.length;
            var lengthNew = messages.length;
            //Checks messages in local storage - if they were deleted so cuts last message in response
            if(lastMessageStatus !== "exist" || messagesSaved.length === 0 || messagesSaved === undefined || messagesSaved === null){
                var pubDateLast = that._getPubDateLast();
                
                if(pubDateLast === messages[lengthNew - 1].pub_date){
                    messages.splice(lengthNew - 1, 1); 
                }
            }else{
                var tmpMessages = messages;
                
                messages.forEach(function(item, i){
                    //debugger;
                    
                    for(var j = 0; j < length; j++){
                        if(item.messageId === messagesSaved[j].messageId){
                            tmpMessages.splice(i, 1);
                        }
                    }
                });
                
                messages = [];
                tmpMessages.forEach(function(item, indx){
                    //debugger;
                    if(item!== undefined){
                        messages.push(item);
                    }
                });
            }

            def.resolve(messages);
        });
        
        return def.promise();
    };
    
    //Adds message to local variable this._messages
    this._addMessages = function(messages){
        var length = messages.length;
        this._messages = [];
        //debugger;
        for(var i = 0; i < length; i++){
            if(messages[i].length !== 0){           
                this._messages.push(messages[i]);
                
                if(!this._messages[i].hasOwnProperty("readStatus") || this._messages[i].readStatus === undefined || this._messages[i].readStatus === null){
                    this._messages[i].readStatus = "readNo";
                }
                
                if(!this._messages[i].hasOwnProperty("img")){
                    var newContent = that._cutImage(messages[i].textmessage);
                    var src = newContent.imgSrc; 
                    messages[i].srcImg = src;
                }           
            }
        }

    };
    
    //Get concrete message from local storage by Id
   /* this._getOneMessage = function(messageId){
        var messages = this._getMessages();
        var message = {};
    
        messages.forEach(function(item){               
            if(messageId === item.messageId){
                message = item;
            }
        });
        
        return message;
    };*/
    
    //Get concrete message from Web SQL by Id with Sqlite
    this._getOneMessageSql = function(messageId){
        var def = $.Deferred();
        var db = that._openDatabase();
        
        db.transaction(function(tx){
            tx.executeSql("SELECT * FROM messages WHERE messageId = ?", [messageId], function(tx, results){
                var message = [];
                
                if(results.rows.length > 0) {
                    message.push(results.rows.item(0));
                    
                    def.resolve(message);
                }
            });
        });
       
        return def.promise();
    };
    
    //Gets publish last date for message
    /*this._getMessageLastDate = function(){    
        var messages = this._getMessages();
        var messagesIds = [];
      
        if(messages === null || messages === undefined || messages.length === 0){
            var date = new Date();
            var year = date.getFullYear();
            var mounth = date.getMonth() + 1;
            if(mounth < 9){
                mounth = "0" + mounth;
            }
            
            var day = date.getDate();
            if(day < 9){
                day = "0" + day;
            }
            
            var hours = date.getHours();
            if(hours < 9){
                hours = "0" + hours;
            }
            
            var minutes = date.getMinutes();
            if(minutes < 10){
                minutes = "0" + minutes;
            }
            
            var seconds = date.getSeconds();
            if(seconds < 10){
                seconds = "0" + seconds;
            }
            var d = year + "-" + mounth + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
            
            return d;
        }
        
        messages.forEach(function(item){
            var id = item.messageId;
            messagesIds.push(id);
        });
        
        messagesIds.sort(function(a, b){return b-a;});     

        var pubDate;
        var id = messages[0].messageId;
        messages.forEach(function(item){
            if(id === item.messageId){
                pubDate = item.pub_date;
            }
        });
        
        return pubDate;
    };*/
    
    //Gets publish last date for message with Sqlite
    this._getMessageLastDateSql = function(){  
        var def = $.Deferred();
        var messagesSql = this._getMessagesSql();
        
        messagesSql.done(function(messages){
            var messagesIds = [];

            if(messages === null || messages === undefined || messages.length === 0){
                var date = new Date();
                var year = date.getFullYear();
                var mounth = date.getMonth() + 1;
                if(mounth < 9){
                    mounth = "0" + mounth;
                }

                var day = date.getDate();
                if(day < 9){
                    day = "0" + day;
                }

                var hours = date.getHours();
                if(hours < 9){
                    hours = "0" + hours;
                }

                var minutes = date.getMinutes();
                if(minutes < 10){
                    minutes = "0" + minutes;
                }

                var seconds = date.getSeconds();
                if(seconds < 10){
                    seconds = "0" + seconds;
                }
                var d = year + "-" + mounth + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

                def.resolve(d);
                
            }else{
                messages.forEach(function(item){
                    var id = item.messageId;
                    messagesIds.push(id);
                });

                messagesIds.sort(function(a, b){return b-a;});     

                var pubDate;
                var id = messages[0].messageId;
                messages.forEach(function(item){
                    if(id === item.messageId){
                        pubDate = item.pub_date;
                    }
                });

                def.resolve(pubDate);
            }
        });
        
        //return pubDate;
        return def.promise();
    };
    
    //Saves status to local storage for init start send rend request to get messages from server
    this._saveStatusInitRequest = function(statusInitRequest){
        localStorage.setItem("status-init-request", JSON.stringify(statusInitRequest));
    };
    
    //Gets status init request from local storage
    this._getStatusInitRequest = function(){
        return JSON.parse(localStorage.getItem("status-init-request"));
    };
    
    //Deletes message from local storage
    /*this._deleteMessage = function(messageId){
        var messages = this._getMessages();
        
        messages.forEach(function(item, i){
            if(messageId === item.messageId){
                if(i === 0){
                    var lastMessageStatus = "existNo";
                    that._saveLastMessageStatus(lastMessageStatus);
                }
                
                messages.splice(i, 1);
            }
        });
        
        this._saveMessages(messages);
    };*/
    
    //Deletes message from Web SQL 
    this._deleteMessageSql = function(messageId){
        var def = $.Deferred();
        
        var db = this._openDatabase();
        var maxId;
        
        db.transaction(function(tx){
            tx.executeSql("SELECT MAX(messageId) AS id FROM messages", [], function(tx, result){
                maxId = result.rows.item(0);
                
                if(maxId.id === messageId){
                    var lastMessageStatus = "existNo";
                    that._saveLastMessageStatus(lastMessageStatus);
                }
            });
        });
        
        db.transaction(function(tx){
            tx.executeSql("DELETE FROM messages WHERE messageId = ?", [messageId]);
            
            def.resolve();
        });
        
        return def.promise();
    };
    
    //Deletes all messages
    /*this._deleteAllMessages = function(){
        this._messages = [];
        this._saveMessages(this._messages);
    };*/
    
    //Deletes all messages from table in Web SQL
    this._deleteAllMessagesSql = function(){
        var def = $.Deferred();
        var db = this._openDatabase();
        
        db.transaction(function(tx){
            tx.executeSql("DELETE FROM messages");
            
            var lastMessageStatus = "existNo";
            that._saveLastMessageStatus(lastMessageStatus);
            
            def.resolve();
        });
        
        return def.promise();
    };
     
    //Save status delete of last message
    this._saveLastMessageStatus = function(status){
        localStorage.setItem("last-message-status", JSON.stringify(status));
    };
    
    //Gets status delete of last message 
    this._getLastMessageStatus = function(){
        var lastMessageStatus =  JSON.parse(localStorage.getItem("last-message-status"));
        if(lastMessageStatus !== null || lastMessageStatus !== undefined){
            return lastMessageStatus;
        }
    };
    
    //Creates date for convert in local from Utc
    /*this._createConvertDate = function(dateParam){
        var date = dateParam;         
        var indx = date.indexOf(".");
            
        if(indx !== undefined || indx !== null){
            date = date.slice(0, indx);
        }
    };*/
        
    //Delete messages older than 3 days
    /*this._deleteMessagesOld = function(){
        var date = new Date();
        var monthNow = date.getMonth() + 1;
        var dayNow = date.getDate();
        var messages = this._getMessages();
        var tmpMessages = [];
        
        if(messages.length === 0 || messages === undefined || messages === null){
            return false;
        }
        
        messages.forEach(function(item, i){
            var pubDate = item.pub_date;         
            var indx = pubDate.indexOf(".");
            
            if(indx !== undefined || indx !== null){
                pubDate = pubDate.slice(0, indx);
            }
            
            //create array where [0] = YYYY-MM-DD and [1] = hours:minutes
            pubDate = pubDate.split(" ");
            
            var yearSaved = pubDate[0];
            yearSaved = yearSaved.split("-");
            yearSaved = yearSaved[0] * 1;
            
            var monthSaved = pubDate[0];
            monthSaved = monthSaved.split("-");
            monthSaved = monthSaved[1] * 1;
            
            var daySaved = pubDate[0];
            daySaved = daySaved.split("-");
            daySaved = daySaved[2] * 1;
            
            //Add utc time for saved date
            var dateSavedLocal = new Date(Date.UTC(yearSaved, monthSaved, daySaved));
            var daySavedLocal = dateSavedLocal.getDate();
            var monthSavedLocal = dateSavedLocal.getMonth();
               
            var lastMessageStatus = "existNo";
            if(monthNow === monthSavedLocal){
                var messageTimeHold = dayNow - daySavedLocal;
                
                if(messageTimeHold <= 3 && messageTimeHold >= 0){
                    tmpMessages.push(item);
                }else if(i === 0){// if last message older than 3 days - delete and set lastMessageStatus - existNo
                    that._saveLastMessageStatus(lastMessageStatus);
                }
                
            }else if(monthNow !== monthSavedLocal){
                var different;
                              
                if(monthSavedLocal === 1){
                    different = 28 - dayNow;
                    
                    if(different >= 25){
                        tmpMessages.push(item);
                    }else if(i === 0){// if last message older than 3 days - delete and set lastMessageStatus - existNo             
                        that._saveLastMessageStatus(lastMessageStatus);
                    }
                    
                }else if(monthSavedLocal  === 4 || monthSavedLocal  === 6 || monthSavedLocal  === 9 || monthSavedLocal  === 11){
                    different = 30 - dayNow;
                    
                    if(different >= 27){
                        tmpMessages.push(item);
                    }else if(i === 0){// if last message older than 3 days - delete and set lastMessageStatus - existNo
                        that._saveLastMessageStatus(lastMessageStatus);
                    }
                    
                }else{
                    different = 31 - dayNow;
                    
                    if(different >= 28){
                        tmpMessages.push(item);
                    }else if(i === 0){// if last message older than 3 days - delete and set lastMessageStatus - existNo
                        that._saveLastMessageStatus(lastMessageStatus);
                    }
                }          
            }        
        });
        
        that._saveMessages(tmpMessages);
        console.log(tmpMessages);
    };*/
    
    //Delete messages older than 3 days with Sqlite
    this._deleteMessagesOldSql = function(){
        //debugger;
        var date = new Date();
        var monthNow = date.getMonth() + 1;
        var dayNow = date.getDate();
        
        var def = $.Deferred();
        
        var messagesSql = this._getMessagesSql();
        
        messagesSql.done(function(messages){
            //debugger;
            var tmpMessages = [];

            if(messages.length === 0 || messages === undefined || messages === null){
                def.resolve();
                
                return false;
            }

            messages.forEach(function(item, i){
                //debugger;
                var pubDate = item.pub_date;         
                var indx = pubDate.indexOf(".");

                if(indx !== undefined || indx !== null){
                    pubDate = pubDate.slice(0, indx);
                }

                //create array where [0] = YYYY-MM-DD and [1] = hours:minutes
                pubDate = pubDate.split(" ");

                var yearSaved = pubDate[0];
                yearSaved = yearSaved.split("-");
                yearSaved = yearSaved[0] * 1;

                var monthSaved = pubDate[0];
                monthSaved = monthSaved.split("-");
                monthSaved = monthSaved[1] * 1;

                var daySaved = pubDate[0];
                daySaved = daySaved.split("-");
                daySaved = daySaved[2] * 1;

                //Add utc time for saved date
                var dateSavedLocal = new Date(Date.UTC(yearSaved, monthSaved, daySaved));
                var daySavedLocal = dateSavedLocal.getDate();
                var monthSavedLocal = dateSavedLocal.getMonth();

                var lastMessageStatus = "existNo";
                if(monthNow === monthSavedLocal){
                    var messageTimeHold = dayNow - daySavedLocal;

                    if(messageTimeHold <= 3 && messageTimeHold >= 0){
                        tmpMessages.push(item);
                    }else if(i === 0){// if last message older than 3 days - delete and set lastMessageStatus - existNo
                        that._saveLastMessageStatus(lastMessageStatus);
                    }

                }else if(monthNow !== monthSavedLocal){
                    var different;

                    if(monthSavedLocal === 1){
                        different = 28 - dayNow;

                        if(different >= 25){
                            tmpMessages.push(item);
                        }else if(i === 0){// if last message older than 3 days - delete and set lastMessageStatus - existNo             
                            that._saveLastMessageStatus(lastMessageStatus);
                        }

                    }else if(monthSavedLocal  === 4 || monthSavedLocal  === 6 || monthSavedLocal  === 9 || monthSavedLocal  === 11){
                        different = 30 - dayNow;

                        if(different >= 27){
                            tmpMessages.push(item);
                        }else if(i === 0){// if last message older than 3 days - delete and set lastMessageStatus - existNo
                            that._saveLastMessageStatus(lastMessageStatus);
                        }

                    }else{
                        different = 31 - dayNow;

                        if(different >= 28){
                            tmpMessages.push(item);
                        }else if(i === 0){// if last message older than 3 days - delete and set lastMessageStatus - existNo
                            that._saveLastMessageStatus(lastMessageStatus);
                        }
                    }          
                }        
            });
            
            //var deleteMessagesSql = that._deleteAllMessagesSql();
            
            //deleteMessagesSql.done(function(){
                var saveMessagesSql = that._saveMessagesSql(tmpMessages);
                
                saveMessagesSql.done(function(){
                    console.log("save messages from delete old messages"); 
                
                    def.resolve();
                });
            //});
        });
        
        return def.promise();
    };
       
    //Saves publish date last to local storage
    this._savePubDateLast = function(pubDate){
        localStorage.setItem("pub-date-last", JSON.stringify(pubDate));
    };
    
    //Gets publish date last from local storage
    this._getPubDateLast = function(){
        return JSON.parse(localStorage.getItem("pub-date-last"));
    };
        
    //Converts the image to a Base64 sting:
    /*this._getBase64Image = function(src){
        var $img = $("<img>").css("width", "30px").css("height", "30px");
        $img.attr("src", src);
        
        var canvas = document.createElement("canvas");
        canvas.width = $img.width;
        canvas.height = $img.height;
        
        var ctx = canvas.getContext("2d");
        ctx.drawImage($img, 0, 0, $img.width, $img.height);
        
        var dataURL = canvas.toDataURL("image/png");

        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    };
    
    //Saves image to local storage
    this._saveImage = function(imgData){
        
    };
    
    //Gets image from local storage
    this._getImage = function(){
        
    };*/
    
    //Cuts image from response string
    this._cutImage = function(content){
        //debugger;
        var newContent = {};
        var firstImgPosition, lastImgPosition = -1, imgTag = "";
        var contentLength = content.length;
        var contentBeforeImg, contentAfterImg;
        
        firstImgPosition = content.indexOf("<img");
        
        if(firstImgPosition !== -1){
            for(var i = firstImgPosition; i < contentLength; i++){
                if(content[i] === ">"){
                    imgTag += content[i];
                    lastImgPosition = i;
                    break;
                }
                
                imgTag += content[i];
            }
            
            newContent.contentBeforeImg = content.substring(0, firstImgPosition);
            
            if(lastImgPosition === -1){
                newContent.contentAfterImg = "";
            }else{
                newContent.contentAfterImg = content.substring(lastImgPosition + 1);
                if(newContent === undefined || newContent === null){
                    newContent = "";
                }
            }

            newContent.imgSrc = that._getImgSrc(imgTag);
            
        }else{
            newContent.contentBeforeImg = content;
            newContent.contentAfterImg = "";
            newContent.imgSrc = "";
        }
             
        return newContent;
    };
    
    //Gets source of image
    this._getImgSrc = function(img){   
        //debugger;
        var hasSingleQuaates = img.indexOf("src='");
        
        if(hasSingleQuaates === -1){
            //Adds single quotes for attribute src because in response aren't exist
            var firstIndx = img.indexOf("src=") + 4;
            var lastIndx = img.lastIndexOf("jpeg") + 4 || img.lastIndexOf("png") + 3;

            var tmp = "";
            var length = img.length;
            for(var j = 0; j < length; j++){
                if(j === firstIndx || j === lastIndx){
                    tmp += "'";
                }

                tmp += img[j];
            }

            img = tmp;
        }
        
        var firstSrcPosition, lastSrcPosition = -1, src= "";
        var imgLength = img.length;
        
        firstSrcPosition = img.indexOf("src='") + 5;// 5 - first index of src 
        
        if(firstSrcPosition !== -1){
            for(i = firstSrcPosition; i < imgLength; i++){
                if(img[i] === "'"){
                    break;
                }
                
                src += img[i];
            }       
        }
        
        return src;
    };
        
    //Send Post request to server if user enter to app on first time
    this._sendFirstEnter = function(){
        var url = "http://128.199.37.189/register/";
         
        var firstEnterValue = {
            firstEnter: "True"
        };
        
        var settings = {
            url: url,
            method: "POST",
            data: firstEnterValue,
            dataType: "json",
            success: function(response){
                messengerView._hideHomePage();
                
                messengerView._renderFirstEnterPage(response);
                messengerView._showFirstEnterPage();

                var firstEnter = false;
                that._saveFirstEnter(firstEnter);
                
                var userData = {
                    userName: response.userName,
                    password: response.password
                };        
                that._saveUserDataStorage(userData);
                
                var logInStatus = true;
                that._saveUserLogInStatus(logInStatus);
                
                var status = "existNo";
                that._saveLastMessageStatus(status);
                
                console.log(response.userName);
            }
        };
        
        $.ajax(settings);
        
        //today
        var createTable = that._createTable();
        createTable.done(function(){
            console.log("table is created");
        });
        //
    };
      
    //Renders list of all messages of all users
    this._renderAllUsersAllMessages = function(){
        var url = "http://128.199.37.189/allmessages/";
        var userData = that._getUserDataStorage();
        //debugger;
        var settings = {
            url: url,
            method: "GET",
            dataType: "json",
            data: {userName: userData.userName},
            success: function(response){
                //debugger;
                var status;

                var messages = that._sortMessages(response);        
                //that._saveMessages(messages);
                var count = 0;
                
                if(response.length === 0 || response === undefined || response === null){
                    messengerView._showNoMessagesInfo();
                    
                    status = "existNo";
                    that._saveLastMessageStatus(status);
                    
                    count = 0;
                    that._saveCountSave(count);
                }else{                  
                    var allUsersAllMessages = messengerView._renderAllUsersAllMessages(messages);
                    messengerView._addAllUsersAllMessages(allUsersAllMessages);
                    messengerView._showAllUsersAllMessages();  
                    
                    status = "exist";
                    that._saveLastMessageStatus(status);
                    
                    count = 1;
                    that._saveCountSave(count);
                }
                            
                //var pubDatelast = that._getMessageLastDate();
                /*var pubDatelast = that._getMessageLastDateSql();
                
                that._savePubDateLast(pubDatelast);
                
                console.log("start from success ajax");
                var statusInitRequest = true;
                that._saveStatusInitRequest(statusInitRequest);
           
                var saveMessagesSql = that._saveMessagesSql(messages);
                saveMessagesSql.done(function(){
                    messages = [];
                    
                    that._saveMessages(messages);
                });  */ 
                var pubDatelastSql = that._getMessageLastDateSql();
                
                pubDatelastSql.done(function(pubDateLast){
                    that._savePubDateLast(pubDateLast);
                
                    //console.log("start from success ajax");
                    //var statusInitRequest = true;
                    //that._saveStatusInitRequest(statusInitRequest);

                    var saveMessagesSql = that._saveMessagesSql(messages);
                    saveMessagesSql.done(function(){
                        messages = [];

                        that._saveMessages(messages);
                    });                 
                });
            }
        };
        
        $.ajax(settings);
    };
    
    //Registers user
    /*this._userSignUp = function(userData){  
        this._saveUserDataStorage(userData);       
        messengerView._logInAfterSignUp();
        this.showHomePage();
    };*/
             
    //Authorizes user    
    this._userLogIn = function(userData){
        var savedUserData = this._getUserDataStorage();
        if(savedUserData === null || userData.userName !== savedUserData.userName || userData.password !== savedUserData.password){        
            return false;
        } 
        
        var userLogInStatus = {
            status: true
        };
        this._saveUserLogInStatus(userLogInStatus);
        
        return true;
    };
    
    //Authorizes user by server
    this._userLogInServer = function(userData){     
        var url = "http://128.199.37.189/login/";
        var mobile = "true";
        
        var settings = {
            url: url,
            method: "POST",
            dataType: "json",
            data: {userName: userData.userName, password: userData.password, mobile: mobile},
            success: function(response){           
                that._renderAllMessagesLoginedSql();
            }
        };
        
        $.ajax(settings);
    };
    
    //Renders all messages for user after log in
    /*this._renderAllMessagesLogined = function(){ 
        var messages = that._getMessages();
        var allUsersAllMessages = messengerView._renderAllUsersAllMessages(messages);
        messengerView._addAllUsersAllMessages(allUsersAllMessages);
        messengerView._showAllUsersAllMessages();
    };*/
    
    //Renders all messages for user after log in with Sqlite
    this._renderAllMessagesLoginedSql = function(){ 
        var deleteMessagesSql = this._deleteMessagesOldSql();
        
        deleteMessagesSql.done(function(){
            var messagesSql = that._getMessagesSql();
        
            messagesSql.done(function(messages){
                //debugger;
                var allUsersAllMessages = messengerView._renderAllUsersAllMessages(messages);
                messengerView._addAllUsersAllMessages(allUsersAllMessages);
                messengerView._showAllUsersAllMessages();
            });
        });
    };
        
    //Inits request over 1 minute
    /*this._initRequestOverMinute = function(){
        setInterval(function(){
            //debugger;
            var statusInitRequest = that._getStatusInitRequest();

            if(statusInitRequest === false || statusInitRequest === undefined || statusInitRequest === null){
                return false;
            }else{
                var countSaveMessage = that._getCountSave();

                if(countSaveMessage === 0 || countSaveMessage === null || countSaveMessage === undefined){
                    that._renderAllUsersAllMessages();
                }else{
                    that._checkMessagesNew();
                }
            }
        }, 8000); //Sets 60 000 !!!!
    };*/
    
    //Checks new messages
    /*this._checkMessagesNew = function(){  
        debugger;
        var lastDate = that._getPubDateLast(); 
        //var messagesSaved = that._getMessages();    
        var userData = that._getUserDataStorage();             
        var url = "http://128.199.37.189/checknewmessages/";
        //var lastMessageStatus = that._getLastMessageStatus();
        
        var settings = {
            url: url,     
            method: "GET",
            dataType: "json",
            data: {userName: userData.userName, timeStamp: lastDate},
            success: function(response){
                debugger;
                if(response.length === 0 || response === undefined || response === null){
                    messengerView._showNoMessagesInfo();
                }else{
                    //Cuts last message in response because it has been already existed
                    that._messages = [];
                    var messages = that._sortMessages(response); 
                    
                    var count = that._getCountSave();
                    if(count !== 0){
                        messages = that._cutMessageEqualSql(messages);
                    }
                                   
                    if(messages !== null && messages.length !== 0){             
                        var savedMessages = that._getMessages();  
                        
                        count = 1;
                        that._saveCountSave(count);
                        
                        messages.forEach(function(item){
                            savedMessages.unshift(item);
                        });                               
                        that._saveMessages(savedMessages);

                        //Save current publish last date of message
                        var pubDatelast = that._getMessageLastDate();
                        that._savePubDateLast(pubDatelast);
                        
                        var status = "exist";
                        that._saveLastMessageStatus(status);
                        
                        messengerView._addMessageNew(messages);
                    }
                }               
            }
        };

        $.ajax(settings);
    };*/
    
    this._checkMessagesNew = function(){  
        //debugger;
        var lastDate = that._getPubDateLast(); 
        var userData = that._getUserDataStorage();             
        var url = "http://128.199.37.189/checknewmessages/";
        
        var settings = {
            url: url,     
            method: "GET",
            dataType: "json",
            data: {userName: userData.userName, timeStamp: lastDate},
            success: function(response){
                //debugger;
                if(response.length === 0 || response === undefined || response === null){
                    messengerView._showNoMessagesInfo();
                }else{
                    //Cuts last message in response because it has been already existed
                    that._messages = [];
                    var messages = that._sortMessages(response); 
                    var pubDatelast;
                    var length = messages.length;
                    
                    var count = that._getCountSave();
                    if(count !== 0){
                        var messagesCutSql = that._cutMessageEqualSql(messages);
                        
                        messagesCutSql.done(function(messagesCut){
                            //debugger;
                            messages = messagesCut;
                            
                            if(messages !== null && messages.length !== 0){             

                                //Save current publish last date of message
                                count = 1;
                                that._saveCountSave(count);

                                pubDatelast = messages[0].pub_date;
                                that._savePubDateLast(pubDatelast);
                                
                                var status = "exist";
                                that._saveLastMessageStatus(status);
                                
                                messages.forEach(function(item){
                                    item.readStatus = "readNo";
                                });
                                
                                messengerView._addMessageNew(messages);
                                
                                var saveMessageSql = that._saveMessagesSql(messages);
                                saveMessageSql.done(function(){
                                    //debugger;
                                    console.log("save messages from checkMessagesNew");
                                });    
                            }
                        });
                        
                    }else{
                        if(messages !== null && messages.length !== 0){             
                            count = 1;
                            that._saveCountSave(count);
                                
                                //debugger;
                                pubDatelast = messages[messages.length - 1].pub_date;
                                that._savePubDateLast(pubDatelast);
                                
                                var status = "exist";
                                that._saveLastMessageStatus(status);
                                
                                messages[0].readStatus = "readNo";
                                messengerView._addMessageNew(messages);
                                
                                var saveMessageSql = that._saveMessagesSql(messages);
                                saveMessageSql.done(function(){
                                    //debugger;
                                    console.log("save messages from checkMessagesNew");
                                });    
                        }
                    }
                }               
            }
        };

        $.ajax(settings);
    };
    
    //Opens socket
    /*this._openSocket = function(){           
       var ws = new WebSocket('ws://128.199.37.189/ws/');
        
        ws.onopen = function () {
            console.log('Socket opened from messenger');
        };
        
        ws.onmessage = function(response){
            debugger;
            var background = cordova.plugins.backgroundMode.isActive();
            
            if(background){
                cordova.plugins.notification.local.schedule({
                    ticker: "Connect Me - you have a new message.",
                    title: "Connect Me",
                    text: "You have a new message.",
                    //icon: "../icons/messages.png"
                });   
            }
            
            var messages = JSON.parse(response.data);

            that._messages = [];
                    
            if(messages !== null && messages.length !== 0){             
                var savedMessages = that._getMessages();  
              
                messages.forEach(function(item){
                    savedMessages.unshift(item);
                });                               
                that._saveMessages(savedMessages);
                
                messengerView._addMessageNew(messages);  
                
                var count = 1;
                that._saveCountSave(count);
                
                var pubDatelast = that._getMessageLastDate();
                that._savePubDateLast(pubDatelast);
                
                var status = "exist";
                that._saveLastMessageStatus(status);
            }     
        }; 
        
        ws.onclose = function(){
            console.log("socket close");
            
            that._openSocket();
        };   
    };*/
    
    //Opens socket with Sqlite
    this._openSocketSql = function(){           
       var ws = new WebSocket('ws://128.199.37.189/ws/');
        
        ws.onopen = function () {
            console.log('Socket opened from messenger');
        };
        
        ws.onmessage = function(response){
            //debugger;
            var background = cordova.plugins.backgroundMode.isActive();
            
            if(background){
                cordova.plugins.notification.local.schedule({
                    ticker: "chpok.online - you have a new message.",
                    title: "chpok.online",
                    text: "You have a new message.",
                    //icon: "../icons/messages.png"
                });   
            }
            
            var messages = JSON.parse(response.data);      
            var isArray = Array.isArray(messages);
            
            if(!isArray){
                var tmpMessages = messages;
                messages = [];
                messages.push(tmpMessages);
            }
            
            that._messages = [];
                    
            if(messages !== null && messages.length !== 0){             
                var savedMessasgeSql = that._getMessagesSql();
                
                savedMessasgeSql.done(function(savedMessages){
                    //debugger;
                    
                    messages.forEach(function(item){
                        savedMessages.unshift(item);
                    }); 
                         
                    var saveMessagesSql = that._saveMessagesSql(savedMessages);
                    
                    saveMessagesSql.done(function(){
                        //debugger;
                        messengerView._addMessageNew(messages);   

                        var count = 1;
                        that._saveCountSave(count);

                        var pubDatelast = messages[messages.length - 1].pub_date;
                        that._savePubDateLast(pubDatelast);

                        var status = "exist";
                        that._saveLastMessageStatus(status);
                    });
                });
            }    
        }; 
        
        ws.onclose = function(){
            console.log("socket close");
            
            that._openSocketSql();
        };   
    };
    
    //Finds and renders result of search 
    /*this._findMessages = function(condition){
        var searchResults;
        var messages = this._getMessages();
        var length = condition.length;
        
        if(condition === "" || condition === undefined || condition === null){
            searchResults = messengerView._renderAllUsersAllMessages(messages);
        }else{
            for(var i = 0; i < length; i++){
                messages.forEach(function(item, indx){             
                    if(item.sender[i] !== undefined || item.sender[i] !== null){
                        if(condition[i] !== item.sender[i]){
                            messages[indx].sender = "";
                        }
                    }else{
                        messages[indx].sender = "";
                    }
                    
                });
            }
            
            var tmpResult = [];
            messages.forEach(function(item, indx){
                if(item.sender !== ""){
                   tmpResult.push(item);
                }
            });
            
            if(tmpResult.length === 0){
                messengerView._showNoMessagesInfo();
            }else{
                searchResults = messengerView._renderAllUsersAllMessages(tmpResult);
            }
        }
        
       messengerView._addAllUsersAllMessages(searchResults);
    };*/ 
    
    //Finds and renders result of search 
    this._findMessagesSql = function(condition){
        //debugger;
        var searchResults;
        var length = condition.length;
        var messagesSql = that._getMessagesSql();
        
        messagesSql.done(function(messages){
            //debugger;      
            var messagesLength = messages.length;
            
            if(condition === "" || condition === undefined || condition === null){
                searchResults = messengerView._renderAllUsersAllMessages(messages);
                messengerView._addAllUsersAllMessages(searchResults);
            }else{
                var tmpIds = [];
                var wrongResults = new Array(messagesLength);
                
                for(var i = 0; i < length; i++){
                    
                    for(var j = 0; j < messagesLength; j++){
                        if(messages[j].sender !== undefined || messages[j].sender !== null){                
                            if(condition[i] !== messages[j].sender[i]){
                                
                                if(wrongResults[j] !== true){
                                    tmpIds.push(messages[j].messageId);
                                    wrongResults[j] = true;
                                }                          
                            }
                        }else{
                            tmpIds.push(messages[j].messageId);
                        }
                    }
                    
                }

                var tmpResult = [];
                var wrongId = false;
                var idsLength = tmpIds.length;
                
                for(i = 0; i < messagesLength; i++){

                    for(var k = 0; k < idsLength; k++){
                        if(messages[i].messageId === tmpIds[k]){
                            wrongId = true;
                            
                            break;
                        }   
                    }
                    
                    if(wrongId === false){
                       tmpResult.push(messages[i]); 
                    }
                }

                if(tmpResult.length === 0){
                    messengerView._showNoMessagesFound();
                }else{
                    searchResults = messengerView._renderAllUsersAllMessages(tmpResult);           
                    messengerView._addAllUsersAllMessages(searchResults);
                }
            }
        });
    };
               
    //Shows home page
    this.showHomePage = function(){
        messengerView._renderHomePage();           
    };
};