sap.ui.define([
    "sap/ui/core/mvc/Controller",
     "sap/ui/core/UIComponent",
	"com/questionanswer/controller/Common"

], (Controller, UIComponent, Common) => {
    "use strict";

    return Controller.extend("com.questionanswer.controller.CompanyDashboard", {

        onInit: function () {
            sap.ui.getCore().getEventBus().subscribe("LogoutChannel", "logoutCompany", this.onLogout, this);
		},

		onLogout: function(){ Common.logout(this)},

        navToSupport: function(){
             var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("Support"); 
        }
		
    });
});