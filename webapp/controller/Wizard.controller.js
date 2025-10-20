sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "com/questionanswer/controller/Common",
], (Controller, UIComponent, MessageBox, Common) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.Wizard", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Wizard").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sId = oEvent.getParameter("arguments").id;
            this.testid = oEvent.getParameter("arguments").testid;
            // this.getView().byId("pageWizard").setTitle(decodeURIComponent(oEvent.getParameter("arguments").job));
            //this.contextCandidate = this.getOwnerComponent().getModel("globalModel").getProperty("/candidate");
            this.contextCandidate = Common._decodeToken(localStorage.getItem("token")).user;

            this.getTestQuestionForJob(sId);
        },

        getTestQuestionForJob: function (job_post_id) {
            fetch("https://ui5-qa-node-service.onrender.com/question/" + job_post_id, {
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
                    this.dataToPostSelectedAnswers = {};
                    this.getView().byId("wizardContainer").destroyItems();  
                    this._createWizard({ steps: data.value });
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Fetch GET error:", err);
                });
        },

        _createWizard: function (oData) {
            var oView = this.getView();

            // Create wizard
            var oWizard = new sap.m.Wizard("myWizard", {
                complete: this.submitWizard.bind(this)
            });
            oWizard.setFinishButtonText("Submit");

            var that = this;

            // Loop through steps
            oData.steps.forEach(function (step, index) {

                var oVBox = new sap.m.VBox();

                var oStep = new sap.m.WizardStep({
                    title: step.question_text
                });


                // Add keys to step
                if (step.question_type === "mcq") {
                    if (step.answers.length === 1) {
                        //Radiobutton for single selection
                        var oRadioGroup = new sap.m.RadioButtonGroup({
                            columns: 1,              // vertical layout
                            select: function (oEvent) {
                                var oSelected = oEvent.getSource().getSelectedButton();
                                 that.dataToPostSelectedAnswers[step.id] = {
                                    question_id : step.id, 
                                    selected_options: [oSelected.getText()]
                                };
                            }
                        });

                        step.options.forEach(function (oOption) {
                            oRadioGroup.addButton(
                                new sap.m.RadioButton({
                                    text: oOption,
                                    key: oOption,
                                    selected: false
                                })
                            );
                        });

                        oVBox.addItem(oRadioGroup);
                    }
                    else if (step.answers.length > 1) {
                        //CheckBox for multiple selection
                        step.options.forEach(function (oOption) {
                            var oCheckBox = new sap.m.CheckBox({
                                text: oOption,
                                selected: false,
                                select: function (oEvent) {
                                    var oSelected = oEvent.getSource();

                                    if (that.dataToPostSelectedAnswers[step.id]) {
                                        var found = that.dataToPostSelectedAnswers[step.id].selected_options.find(item => item === oSelected.getText());
                                        if (!found && oSelected.getSelected()) {
                                            that.dataToPostSelectedAnswers[step.id].selected_options.push(oSelected.getText());
                                        }
                                        else if (found && !oSelected.getSelected()) {
                                             that.dataToPostSelectedAnswers[step.id].selected_options = 
                                                that.dataToPostSelectedAnswers[step.id].selected_options.filter(item => item !== oSelected.getText());
                                        }
                                    }
                                    else{
                                        that.dataToPostSelectedAnswers[step.id] = {question_id: step.id};
                                        that.dataToPostSelectedAnswers[step.id].selected_options = [oSelected.getText()];
                                    }
                                }
                            });

                            oVBox.addItem(oCheckBox);
                        });
                    }


                    oStep.addContent(oVBox);
                }

                oWizard.addStep(oStep);
            });

            // Place wizard into a container (e.g. Page or VBox)
            oView.byId("wizardContainer").addItem(oWizard);
        },

        submitWizard: function (oEvent) {

            var context = this.contextCandidate;
            var answersData = [];
            for (let key in this.dataToPostSelectedAnswers) {
                answersData.push(this.dataToPostSelectedAnswers[key]);
            }

            var oPayload = {
                candidate_id: context.id,
                testid: this.testid,
                answers : answersData
            };

            fetch("https://ui5-qa-node-service.onrender.com/submitanswers", {
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
                    // console.log("Submit clicked!");
                    MessageBox.success(
                    "Thanks for taking test. ",
                    {
                        icon: MessageBox.Icon.information,
                        title: "Test Completed!",
                        actions: [ "Close"],
                        dependentOn: this.getView(),
                        onClose: function (sAction) {
                                this.navToCandidateDashboard();
                        }.bind(this),
                    });
                })
                .catch(err => {
                    sap.m.MessageToast.show("Error: " + err.message);
                    console.log("Error:", err);
                });

            
        },

       navToCandidateDashboard: function(){
             var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("CandidateDashboard"); 
        },

        navToSupport: function(){
             var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("Support"); 
        }

    });
});