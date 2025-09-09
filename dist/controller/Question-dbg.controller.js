sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.questionanswer.controller.Question", {

        onInit: function () {
			var oQuestionModel = new sap.ui.model.json.JSONModel({editable: false});
            this.getView().setModel(oQuestionModel, "questionModel");
		},

		onEditPress: function() {
			// var oObjectPage = this.getView().byId("ObjectPageLayout"),
			// 	bCurrentShowFooterState = oObjectPage.getShowFooter();

			// oObjectPage.setShowFooter(!bCurrentShowFooterState);

			this.getView().getModel("questionModel").setProperty("/editable", true);
		},

		onCancelPress: function(){
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
	});
});