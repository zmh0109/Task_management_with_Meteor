(function(){Users = new Meteor.Collection("user");
Tasks = new Meteor.Collection("task");


////////////////////////////////////////////////////////////

if (Meteor.isClient) {

    //Template.body.isUser =  true;
    //Template.body.isTask =  false;
    //Template.body.isUserDetail =  false;
    //Template.body.isTaskDetail =  false;
    //Template.body.isTaskEdit = false;
    //Template.body.skip = 0;
    //Template.body.sort = 'dateCreated';

    Session.set("isUser" , true);
    Session.set("isTask" , false);
    Session.set("isUserDetail" ,  false);
    Session.set("isTaskDetail" ,  false);
    Session.set("isTaskEdit" , false);
    Template.body.skip = 0;
    Template.body.sort = 'dateCreated';
    Session.set('displayCompleted',"False");
    Session.set('pendingORcompleted',1);


    // This code only runs on the client
    Template.body.helpers({
        users: function () {
            if (Session.get("hideCompleted")) {
                // If hide completed is checked, filter tasks
                return Users.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
            } else {
                // Otherwise, return all of the tasks
                return Users.find({}, {sort: {createdAt: -1}});
            }
        },
        user_details:function () {
            var User_Id = Session.get("user_id");
            return Users.find({_id:User_Id});
        },
        tasks: function () {
            if (Session.get("pendingORcompleted")) {
                var sort_method = Session.get('sort') || 'dateCreated';

                if(sort_method=='name') {
                    return Tasks.find({completed: Session.get('displayCompleted')}, {skip: Session.get('skip'), limit:10, sort: {name: Session.get('ascending')}});
                }
                else if(sort_method=='dateCreated'){
                    return Tasks.find({completed: Session.get('displayCompleted')}, {skip: Session.get('skip'), limit:10, sort: {dateCreated: Session.get('ascending')}});
                }
            } else {
                var sort_method = Session.get('sort') || 'dateCreated';
                console.log(sort_method);
                if(sort_method=='name') {
                    return Tasks.find({}, {skip: Session.get('skip'), limit:10, sort: {name: Session.get('ascending')}});
                }
                else if(sort_method=='dateCreated'){
                    return Tasks.find({}, {skip: Session.get('skip'), limit:10, sort: {dateCreated: Session.get('ascending')}});
                }
            }
        },
        task_details:function () {
            var Task_Id = Session.get("task_id");
            return Tasks.find({_id:Task_Id});

        },
        hideCompleted: function () {
            return Session.get("hideCompleted");
        },

        isUser: function () {
            return Session.get("isUser");
        },
        isTask: function () {
            return Session.get("isTask");
        },
        isUserDetail: function () {
            return Session.get("isUserDetail");
        },
        isTaskDetail: function () {
            return Session.get("isTaskDetail");
        },
        isTaskEdit:function () {
            return Session.get("isTaskEdit");
        },

        Message:  function () {
            return Session.get("Message");
        }




    });
    Template.task_edit.helpers({
        users: function () {
            if (Session.get("hideCompleted")) {
                // If hide completed is checked, filter tasks
                return Users.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
            } else {
                // Otherwise, return all of the tasks
                return Users.find({}, {sort: {createdAt: -1}});
            }
        },
        Message:  function () {
            return Session.get("Message");
        }

    });
    Template.user_detail.helpers({
        pendingTaskNames:  function () {
            return Session.get("pendingTaskNames");
        }
        //pendingTask: function(){
        //    return Session.get('pendingTaskNames');
        //}

    });

    Template.body.events({
        "submit .update-task":function (event) {
            // This function is called when the new task form is submitted

            var taskname = event.target.taskname.value;
            var description  = event.target.description.value;
            var deadline = event.target.deadline.value;
            var completed = event.target.completed.value;
            var assignedUserName = event.target.assignedUser.value;
            var assignedUser = Users.findOne({name:assignedUserName})._id;
            var TaskID = Session.get("task_id");

            Meteor.call('editTask',TaskID, taskname, description, deadline, completed, assignedUser, assignedUserName, function(err, msg){
                Session.set("Message",msg);

            });

            event.target.taskname.value = "";
            event.target. description.value = "";
            // Prevent default form submit
            return false;
        },
        "click .setComp": function(){
            Meteor.call('markComplete', this._id, function(err, msg){

            });
            Meteor.call('getTaskName', this.parentid, function(err, ret){
                Session.set("pendingTaskNames",ret);
            });
            //var task = Tasks.findOne({_id: this._id});
            //console.log(task);
            //Session.set('complete', task.completed);
            //Session.get('pendingTask');
            //Meteor.call('getTaskName', )
        },
        "click .ascending": function(){
            Session.set('ascending', 1);
        },
        'click .descending': function(){
            Session.set('ascending', -1);
        },
        "click .pending": function(){
            Session.set('pendingORcompleted', 1);
            Session.set('displayCompleted', "False");
        },
        "click .completed": function(){
            Session.set('pendingORcompleted', 1);
            Session.set('displayCompleted', "True");
        },
        "click .all": function(){
            Session.set('pendingORcompleted', 0);
        },
        "click .prev": function(){
            //var vSkip = Session.get('skip');
            var length = Tasks.find().fetch().length;
            if(Template.body.skip - 10 >= 0){
                Template.body.skip -= 10;
            }
            else if(Template.body.skip - 10 < 0){
                Template.body.skip = 0;
            }
            Session.set('skip', Template.body.skip);

            //Template.body.skip+10)
            //Session.set();

        },
        "click .next": function(){
            var length = Tasks.find().fetch().length;
            console.log(length);
            if(Template.body.skip + 10 < length){
                Template.body.skip += 10;
            }
            Session.set('skip', Template.body.skip);
            //console.log(Template.body.skip);
        },

        "submit .new-user":function (event) {
            // This function is called when the new task form is submitted

            var username = event.target.username.value;
            var email  = event.target.email.value;
            console.log(event);

            Meteor.call('insertUser', username, email, null, function(err, msg){
                Session.set('Message', msg);
            });
            // Clear form
            //$("#myModal").modal('hide');

            event.target.username.value = "";
            event.target.email.value = "";
            // Prevent default form submit
            return false;
        },

        "submit .new-task":function (event) {
            // This function is called when the new task form is submitted

            var taskname = event.target.taskname.value;
            var description  = event.target.description.value;
            var deadline = event.target.deadline.value;
            var completed = event.target.completed.value;
            var assignedUserName = event.target.assignedUser.value;
            //var assignedUserName = event.target.assignedUserName.value;
            console.log(event);
            //Tasks.insert({
            //    name: taskname,
            //    description: description,
            //    createdAt: new Date() // current time
            //});
            Meteor.call('insertTask', taskname, description, deadline, completed, "", assignedUserName, function(err, msg){
                Session.set("Message",msg);
            });
            // Clear form

            event.target.taskname.value = "";
            event.target. description.value = "";
            // Prevent default form submit
            return false;
        },

        "change #sort": function(event){
            console.log(event.target.value);
            Session.set('sort', event.target.value);
            //var sort_method = Session.get('sort');
            //console.log("aaa");
        },

        "click .User_delete": function () {
            //Users.remove(this._id);
            Meteor.call('deleteUser', this._id, function(err, msg){
                console.log(msg);
            });
        },
        "click .Task_delete": function () {
            //Tasks.remove(this._id);
            Meteor.call('deleteTask', this._id, function(err, msg){
                console.log(msg);
            });
        },
        "change .hide-completed input": function (event) {
            Session.set("hideCompleted", event.target.checked);
        },

        "click .user": function () {
            Session.set("isUser",true);
            Session.set("isTask",false);
            Session.set("isTaskDetail",false);
            Session.set("isUserDetail",false);
            Session.set("isTaskEdit",false);
        },

        "click .task": function () {
            Session.set("isUser",false);
            Session.set("isTask",true);
            Session.set("isTaskDetail",false);
            Session.set("isUserDetail",false);
            Session.set("isTaskEdit",false);
        },
        "click .user_id": function () {
            Session.set("isUser",false);
            Session.set("isTask",false);
            Session.set("isTaskDetail",false);
            Session.set("isUserDetail",true);
            Session.set("isTaskEdit",false);
            Session.set("user_id",this._id);
            Meteor.call('getTaskName', this._id, function(err, ret){
                Session.set("pendingTaskNames",ret);
            });
        },
        "click .task_id": function () {
            Session.set("isUser",false);
            Session.set("isTask",false);
            Session.set("isTaskDetail",true);
            Session.set("isUserDetail",false);
            Session.set("isTaskEdit",false);
            Session.set("task_id",this._id);

        },
        "click .task_edit": function () {

            Session.set("isUser",false);
            Session.set("isTask",false);
            Session.set("isTaskDetail",false);
            Session.set("isUserDetail",false);
            Session.set("isTaskEdit",true);
            Session.set("task_id",this._id);

        }

    });




}

if(Meteor.isServer){
    //Meteor.publish('users', function(){
    //    return Users.find();
    //});
    Meteor.methods({
        insertUser:  function(name, email, pendingTasks) {

            if (name == '' || email == '') {
                return "missing user name or email.";
            }
            else {
                if (Users.findOne({'email': email})) {
                    //console.log("a");

                    return "duplicate email when adding user";
                }
                Users.insert({
                    'name': name,
                    'email': email,
                    'pendingTasks': pendingTasks || [],
                    'dateCreated': new Date()
                });
                return "user inserted.";
            }

        },

        insertTask: function(name, description, deadline, completed, assignedUser, assignedUserName){
            if(name == '' || deadline == ''){
                return "missing name or deadline.";
            }
            else{

                var temp = Users.findOne({name: assignedUserName});
                if(temp){
                    assignedUserName = temp.name;
                    //temp.pendingTasks.push();
                    assignedUser = temp._id;
                }
                var in_task = Tasks.insert({
                    'name': name,
                    'description': description || "",
                    'deadline': deadline,
                    'completed': completed,
                    'assignedUser': assignedUser || "",
                    'assignedUserName': assignedUserName || "unassigned",
                    'dateCreated': new Date()
                });
                console.log(in_task);
                if(completed == "False") {
                    temp.pendingTasks.push(in_task);
                    Users.update({_id: temp._id}, temp);
                }
                return "task inserted";
            }
        },

        deleteUser: function (id){
            //console.log(id);
            var dUser = Users.findOne({_id: id});
            //console.log(dUser);
            for(var i = 0; i < dUser.pendingTasks.length; i++){
                Tasks.update({_id: dUser.pendingTasks[i]}, {"$set": {assignedUser: "", assignedUserName: "unassigned"}});
            }
            var msg = Users.remove({_id: id});
            return msg + " user removed";
        },

        deleteTask: function (id){
            var dTask = Tasks.findOne({_id: id});
            var upUser = Users.findOne({_id: dTask.assignedUser});
            if(upUser && dTask.completed == "False"){
                for(var i = 0; i < upUser.pendingTasks.length; i++){
                    if(upUser.pendingTasks[i] == id)
                        upUser.pendingTasks.splice(i, 1);
                }
                Users.update({_id: dTask.assignedUser}, upUser);
            }

            var msg = Tasks.remove({_id: id});

            return msg+" task deleted";
        },

        editTask: function (idToBeEdited, name, description, deadline, completed, assignedUser, assignedUserName){
            var assUser = Users.findOne({_id: assignedUser});
            var task = Tasks.findOne({_id: idToBeEdited});
            if(assUser && completed=="False"){
                assUser.pendingTasks.push(idToBeEdited);
                Users.update({_id: assUser._id}, assUser);
                Users.update({_id: task.assignedUser}, {"$set": {
                    pendingTasks: []
                }});
            }
            if(name == '' || deadline == ''){
                return "missing name or deadline";
            }
            else{
                console.log("id to be updated: " + idToBeEdited);
                console.log('name: '+ name);
                var msg = Tasks.update({_id: idToBeEdited},{
                    'name': name,
                    'description': description,
                    'deadline': deadline,
                    'completed': completed,
                    'assignedUser': assignedUser,
                    'assignedUserName': assignedUserName,
                    'dateCreated':Tasks.findOne({_id: idToBeEdited}).dateCreated
                });
                return msg + " tasks updated";
            }
        },
        getTaskName: function(userid){
            var user = Users.findOne({_id: userid});
            var taskArray = [];
            for(var i = 0; i < user.pendingTasks.length; i++){
                var task = Tasks.findOne({_id: user.pendingTasks[i]});
                console.log(task);
                //task.parentid = userid;
                var pair = {_id: task._id, name: task.name, completed: task.completed, parentid: userid};
                console.log(pair.parentid);
                taskArray.push(pair);
            }
            return taskArray;
        },
        //getTaskName: function(userid){
        //    var user = Users.findOne({_id: userid});
        //    var taskNames = [];
        //    for(var i = 0; i < user.pendingTasks.length; i++){
        //        var task = Tasks.findOne({_id: user.pendingTasks[i]});
        //        console.log(task);
        //        //var pair = [task._id, task.name];
        //        taskNames.push(task.name);
        //    }
        //    return taskNames;
        //},


        markComplete: function(id){
            var task = Tasks.findOne({_id: id});
            task.completed = "True";
            var user = Users.findOne({_id: task.assignedUser});
            for(var i = 0; i < user.pendingTasks.length; i++){
                if(user.pendingTasks[i] == id){
                    user.pendingTasks.splice(i, 1);
                }
            }
            var msg1 = Tasks.update({_id: id}, task);
            var msg2 = Users.update({_id: task.assignedUser}, user);
            console.log("mark complete");
            return msg1+"Tasks updated and "+msg2+" Users updated";

        }


    });


}

})();
