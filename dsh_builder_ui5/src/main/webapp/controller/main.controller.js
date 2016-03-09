sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	
	return Controller.extend("ags.ssi.dshbuilder.controller.main", {
	
		onBeforeRendering: function() {
			if(sap.ui.getCore().byId("loadDialog")){
				sap.ui.getCore().byId("loadDialog").destroy();
			}
			var loadingDialog = new sap.m.BusyDialog("loadDialog",{title: 'Loading'});	
			loadingDialog.open();
		},
		onAfterRendering: function() {
			$("#idDshMain").css("top", "1px");
		}
	});
});