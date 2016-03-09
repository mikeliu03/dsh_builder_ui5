sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	
	return Controller.extend("ags.ssi.dshbuilder.controller.overview", {

		onAfterRendering: function() {
			$("#idDshMain").css("top", $("#filterListContainer").height());
		}
	});

});