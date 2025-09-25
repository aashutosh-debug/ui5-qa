sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/f/library",
    "sap/ui/core/UIComponent",
    "com/questionanswer/controller/Common",
    "sap/ui/core/BusyIndicator"
], function (Controller, MessageBox, fioriLibrary, UIComponent, Common, BusyIndicator) {
    "use strict";

    return Controller.extend("com.questionanswer.controller.Question", {

        onInit: function () {

            this.user = Common._decodeToken(localStorage.getItem("token"))

            var oQuestionModel = new sap.ui.model.json.JSONModel({
                editable: false,
                midColumnFullScreen: false
            });
            this.getView().setModel(oQuestionModel, "questionModel");
            sap.ui.getCore().getEventBus().subscribe("QuestionChannel", "refreshQuestionsOnLoad", this.onRefreshDetails, this);

            var oModel = new sap.ui.model.json.JSONModel({});
            this.getView().setModel(oModel, "candidatesModel");

            this.user = Common._decodeToken(localStorage.getItem("token"))
        },

        onAfterRendering: function(){
        // var oMultiInput = this.getView().byId("skillsInputQ");
        // if(oMultiInput) {
        //     oMultiInput.addValidator(function (args) {
        //         return new sap.m.Token({
        //             key: args.text,
        //             text: args.text
        //         });
        //     });
        // }

        var oMultiInput = this.getView().byId("skillsInputQC");
        if(oMultiInput) {
            oMultiInput.addValidator(function (args) {
                return new sap.m.Token({
                    key: args.text,
                    text: args.text
                });
            });
        }
    },

        handleFullScreen: function () {
            var oFCL = this.getView().getParent().getParent();
            oFCL.setLayout(fioriLibrary.LayoutType.MidColumnFullScreen);
            this.getView().getModel("questionModel").setProperty("/midColumnFullScreen", true);
        },

        handleExitFullScreen: function () {
            var oFCL = this.getView().getParent().getParent();
            oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);
            this.getView().getModel("questionModel").setProperty("/midColumnFullScreen", false);

        },

        onEditPress: function () {
            // var oObjectPage = this.getView().byId("ObjectPageLayout"),
            // 	bCurrentShowFooterState = oObjectPage.getShowFooter();

            // oObjectPage.setShowFooter(!bCurrentShowFooterState);

            this.getView().getModel("questionModel").setProperty("/editable", true);
        },

        onSavePress: function () {
            this.getView().getModel("questionModel").setProperty("/editable", false);

            var oView = this.getView();
            var bValid = true;

            // Validate email
            var titleInput = oView.byId("titleInputForm");
            if (!titleInput.getValue().trim()) {
                titleInput.setValueState("Error");
                bValid = false;
            } else {
                titleInput.setValueState("None");
            }

            // Validate descInput
            var descInput = oView.byId("descInputForm");
            if (!descInput.getValue().trim()) {
                descInput.setValueState("Error");
                bValid = false;
            } else {
                descInput.setValueState("None");
            }

            var skillsInput = oView.byId("skillsInputQC");
            if (!skillsInput.getTokens().length === 0) {
                skillsInput.setValueState("Error");
                bValid = false;
            } else {
                skillsInput.setValueState("None");
            }

            if (!bValid) return;

            var oPayload = {
                "title": titleInput.getValue(),
                "description": descInput.getValue(),
                "skills": skillsInput.getTokens().map(function (oToken) { return oToken.getText(); })
            };

            var context = this.getView().getModel().getProperty(this.getView().getBindingContext().getPath());

            fetch("https://ui5-qa-node-service.onrender.com/jobs/" + context.id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(oPayload)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    sap.ui.getCore().getEventBus().publish("jobChannel", "refreshjobList");
                    oView.getModel().setProperty(oView.getBindingContext().getPath(), data.jobs);
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);
                    this.onLogout();

                });
        },

        onCancelPress: function () {
            this.getView().getModel("questionModel").setProperty("/editable", false);

        },

        onCreateQuestionOpenDialog: function () {
            var oView = this.getView();

            if (!this._pDialog) {
                this._pDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.questionanswer.view.AddQuestions", // <-- path to Dialog.fragment.xml
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);

                    // Add validator for MultiInput after dialog is created
                    var optionsInput = oView.byId("optionsInput");
                    if (optionsInput) {
                        optionsInput.addValidator(function (args) {
                            return new sap.m.Token({
                                key: args.text,
                                text: args.text
                            });
                        });
                    }

                    var answersInput = oView.byId("answersInput");
                    if (answersInput) {
                        answersInput.addValidator(function (args) {
                            return new sap.m.Token({
                                key: args.text,
                                text: args.text
                            });
                        });
                    }

                    return oDialog;
                });
            }

            this._pDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCancelDialog: function () {
            this.byId("qDialog").close();
        },

        getQuestions: function (jobId) {
            fetch("https://ui5-qa-node-service.onrender.com/question/" + jobId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    var oQuestionModel = new sap.ui.model.json.JSONModel(data.value);
                    this.getView().setModel(oQuestionModel, "jobQuestionModel");
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Fetch GET error:", err);
                    this.onLogout();

                });
        },

        onRefreshDetails: function () {
            this.onRefresh();
            //this.onRefreshCandidates();            
        },

        onRefresh: function () {
            var context = this.getView().getModel().getProperty(this.getView().getBindingContext().getPath());
            // context.getModel().refresh(true);

            this.getQuestions(context.id);
            this.getCandidateForJob(context.id);

            // var oMultiInput = this.getView().byId("skillsInputQ");
            // for(var i = 0; i < context.skills.length; i++){
            //     oMultiInput.addToken(new sap.m.Token({
            //         key: context.skills[i],
            //         text: context.skills[i]
            //     }));
            // }

            var oMultiInput = this.getView().byId("skillsInputQC");
            for(var i = 0; i < context.skills.length; i++){
                oMultiInput.addToken(new sap.m.Token({
                    key: context.skills[i],
                    text: context.skills[i]
                }));
            }
        },

        onSaveQuestionsDialog: function () {
            var object = this.getView().getBindingContext().getObject();
            var company_id = object.company_id,
                job_id = object.id,
                loggedInUser = this.user.user;//this.getView().getModel("globalModel").getProperty("/company");

            var oView = this.getView();
            var bValid = true;

            var questionInput = oView.byId("questionInput"),
                questionType = oView.byId("questionType"),
                optionsInput = oView.byId("optionsInput"),
                answersInput = oView.byId("answersInput");

            // Validate email
            if (!questionInput.getValue().trim()) {
                questionInput.setValueState("Error");
                bValid = false;
            } else {
                questionInput.setValueState("None");
            }

            if (!optionsInput.getTokens().length === 0) {
                optionsInput.setValueState("Error");
                bValid = false;
            } else {
                optionsInput.setValueState("None");
            }

            if (!answersInput.getTokens().length === 0) {
                answersInput.setValueState("Error");
                bValid = false;
            } else {
                answersInput.setValueState("None");
            }

            if (!bValid) return;


            var oPayload = {
                "question_text": questionInput.getValue(),
                "question_type": questionType.getSelectedKey(),
                "company_id": company_id,
                "job_id": job_id,
                "difficulty": "easy",
                "created_by": loggedInUser.name,
                "options": optionsInput.getTokens().map(function (oToken) { return oToken.getText(); }),
                "answers": answersInput.getTokens().map(function (oToken) { return oToken.getText(); })
            };

            fetch("https://ui5-qa-node-service.onrender.com/question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(oPayload)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    // console.log(data);
                    this.onRefresh();
                    this.onCancelDialog();
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);
                    this.onLogout();

                });
        },

        onDeleteJob: function () {
            MessageBox.warning(
                "This action cannot be undone. Do you really want to delete?",
                {
                    icon: MessageBox.Icon.WARNING,
                    title: "Confirm Deletion",
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    initialFocus: MessageBox.Action.CANCEL,
                    dependentOn: this.getView(),
                    onClose: function (sAction) {
                        if (sAction === sap.m.MessageBox.Action.OK) this.deleteJob();
                    }.bind(this),
                });
        },

        onDeleteQuestions: function () {
            var oTable = this.getView().byId("questionsTable");
            var indices = oTable.getSelectedIndices();

            if (indices.length === 0) {
                sap.m.MessageToast.show("Please select questions to delete!");
                return;
            }

            MessageBox.warning(
                "This action cannot be undone. Do you really want to delete?",
                {
                    icon: MessageBox.Icon.WARNING,
                    title: "Confirm Deletion",
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    initialFocus: MessageBox.Action.CANCEL,
                    dependentOn: this.getView(),
                    onClose: function (sAction) {
                        if (sAction === sap.m.MessageBox.Action.OK) this.deleteQuestions();
                    }.bind(this),
                }
            );
        },

        deleteJob: function () {

            var object = this.getView().getBindingContext().getObject();
            var job_id = object.id;

            fetch("https://ui5-qa-node-service.onrender.com/job/delete/" + job_id, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    var oFCL = this.getView().getParent().getParent();
                    // oFCL.removeAllMidColumnPages();
                    oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);
                    sap.ui.getCore().getEventBus().publish("jobChannel", "refreshjobList");
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Fetch GET error:", err);
                    this.onLogout();

                });
        },

        deleteQuestions: function () {
            var oTable = this.getView().byId("questionsTable");
            var indices = oTable.getSelectedIndices();
            var question_ids = [];
            for (var i = 0; i < indices.length; i++) {
                var object = oTable.getContextByIndex(indices[i]).getObject();
                question_ids.push(object.id);
            }

            var oPayload = {
                "ids": question_ids
            };

            fetch("https://ui5-qa-node-service.onrender.com/question/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(oPayload)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    this.onRefresh();
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);
                    this.onLogout();

                });
        },

        handleClose: function () {
            var oFCL = this.getView().getParent().getParent();
            oFCL.setLayout(fioriLibrary.LayoutType.OneColumn);
        },

        onNavigateToManageCandidatesCompany: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("ManageCandidates");
        },

        //Candidates

        onRefreshCandidates: function () {
            var context = this.getView().getModel().getProperty(this.getView().getBindingContext().getPath());
            this.getCandidateForJob(context.id);
        },

        onAddCandidateToJob: function () {
            var oModel = this.getView().getModel("candidatesModel");
            var rows = oModel.getProperty("/rows"),
                initialData = {
                    id: null,
                    job_post_id: null,
                    candidate_id: null,
                    score: null,
                    start_time: null,
                    end_time: null,
                    status: "Draft",
                    name: null,
                    email: null,
                    phone: null,
                    experience: null,
                    location: null,
                    skills: null
                };

            if (!rows) {
                oModel.setProperty("/rows", [initialData]);
            }
            else {
                rows.unshift(initialData);
                oModel.setProperty("/rows", rows);
            }
            //oModel.setProperty("/rows", rows);
        },

        isValidEmail: function (email) {
            const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
            return regex.test(email);
        },

        onEmailLiveChange: function (oEvent) {
            var value = oEvent.getSource().getValue();
            if (value === null || value === "" || !this.isValidEmail(value)) {
                oEvent.getSource().setValueState("Error");
            }
            else {
                oEvent.getSource().setValueState("None");
            }
        },

        onSendCandidateForTest: function () {

            var oTable = this.getView().byId("manageCandidatesTable");
            var indices = oTable.getSelectedIndices();

            if (indices.length === 0) {
                sap.m.MessageToast.show("Please select the candidates.");
                return;
            }

            var emailEmptyInvalidIndicesFound = false,
                dataToPost = [],
                oModel = this.getView().getModel("candidatesModel");

            for (var i = 0; i < indices.length; i++) {
                var object = oTable.getContextByIndex(indices[i]).getObject();

                if (object.status === "Draft") {

                    if (object.email === null || object.email === "" || !this.isValidEmail(object.email)) {
                        emailEmptyInvalidIndicesFound = true;
                        oModel.setProperty("/rows/" + indices[i] + "/valueState", "Error");
                    }

                    //Post only those data whose id is null i.e. NEW
                    if (!emailEmptyInvalidIndicesFound) {
                        dataToPost.push(object.email);
                    }
                }
            }

            if (dataToPost.length > 0 && !emailEmptyInvalidIndicesFound) {

                var context = this.getView().getModel().getProperty(this.getView().getBindingContext().getPath());

                var oPayload = {
                    job_post_id: context.id,
                    candidate_email: dataToPost,
                };

                fetch("https://ui5-qa-node-service.onrender.com/test", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    body: JSON.stringify(oPayload)
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("HTTP error " + response.status);
                        }
                        return response.json();
                    })
                    .then(data => {
                        this.getCandidateForJob(context.id);
                    })
                    .catch(err => {
                        sap.m.MessageToast.show("Error: " + err.message);
                        console.log("Error:", err);
                        this.onLogout();

                    });
            }
        },

        getCandidateForJob: function (jobId) {

            fetch("https://ui5-qa-node-service.onrender.com/getCandidatesForJob/" + jobId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    var oQuestionModel = new sap.ui.model.json.JSONModel({ rows: data.value });
                    this.getView().setModel(oQuestionModel, "candidatesModel");
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Fetch GET error:", err);
                    this.onLogout();

                });
        },

        onDeleteCandidates: function () {
            var oTable = this.getView().byId("manageCandidatesTable");
            var indices = oTable.getSelectedIndices();
            var candidate_ids = [];
            for (var i = 0; i < indices.length; i++) {
                var object = oTable.getContextByIndex(indices[i]).getObject();
                candidate_ids.push(object.id);
            }

            var oPayload = {
                "id": candidate_ids
            };

            fetch("https://ui5-qa-node-service.onrender.com/test/deleteCandidates", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(oPayload)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    var context = this.getView().getModel().getProperty(this.getView().getBindingContext().getPath());

                    this.getCandidateForJob(context.id);
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);
                    this.onLogout();
                });
        },

        onLogout: function () {
            sap.ui.getCore().getEventBus().publish("LogoutChannel", "logoutCompany");
        },

        onGenerateQuestionUsingAI: function () {
            try{
            
                this.openAIQuestionFragment(d);
            BusyIndicator.show();
            var object = this.getView().getBindingContext().getObject();
            var company_id = object.company_id;

             var oPayload = {
                "company_id": company_id,
                "skills": object.skills
            };

            fetch("https://ui5-qa-node-service.onrender.com/getquesai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify(oPayload)
            })
                .then(response => {
                    // if (!response.ok) {
                    //     throw new Error("HTTP error " + response.status);
                    // }
                    return response.json();
                })
                .then(data => {
                    // console.log(data);
                    if(!data.success){
                        var err = JSON.parse(data.error);
                        sap.m.MessageBox.error(err.error.message);
                    }
                    else{
                        this.openAIQuestionFragment(data.value);
                    }
                    BusyIndicator.hide();
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);
                    BusyIndicator.hide();
                    // this.onLogout();
                });
            }
            catch(e){
                BusyIndicator.hide();
            }
        },

        openAIQuestionFragment: function(data){

            data.value.forEach((item, idx) => {
                item.index = idx + 1;
                item.newo = [];
                item.newa = [];
                item.o.forEach((opt, optIdx) => {
                    var v = {text: opt, icon: "sap-icon://decline"};
                    if(item.a.indexOf(optIdx) !== -1){
                        v.icon = "sap-icon://accept";
                        item.newa.push(item.o[optIdx]);
                    }
                    item.newo.push(v);
                })
            });

            var oView = this.getView();
            var aiQModel = new sap.ui.model.json.JSONModel(data);
            oView.setModel(aiQModel, "aiQModel");

            if (!this._aiQDialog) {
                this._aiQDialog = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.questionanswer.view.AIQues", // <-- path to Dialog.fragment.xml
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this._aiQDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCancelAIQuesDialog: function () {
            this.byId("myDialogAI").close();
            this.getView().getModel("aiQModel").setData(null);
        },

        onDialogAIClose: function () {
            // Cleanup if required
            this.getView().getModel("aiQModel").setData(null);
        },

        onUseAIQuesDialog: function(){
            var object = this.getView().getBindingContext().getObject();
            var company_id = object.company_id,
                job_id = object.id,
                loggedInUser = this.user.user;//this.getView().getModel("globalModel").getProperty("/company");

            var aData = this.getView().getModel("aiQModel").getData().value,
                oPayload = [];
            for(var i = 0; i < aData.length; i++){
                var oP = {
                    "question_text": aData[i].q,
                    "question_type": "mcq",
                    "company_id": company_id,
                    "job_id": job_id,
                    "difficulty": "easy",
                    "created_by": loggedInUser.name,
                    "options": aData[i].o,
                    "answers": aData[i].newa
                };
                oPayload.push(oP);
            }

            fetch("https://ui5-qa-node-service.onrender.com/batchquestion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                body: JSON.stringify({ questions: oPayload})
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    // console.log(data);
                    this.getQuestions(job_id);
                    this.onCancelAIQuesDialog();
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);

                });

        }

    });
});