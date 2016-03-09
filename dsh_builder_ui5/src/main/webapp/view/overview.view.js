sap.ui.jsview("ags.ssi.dshbuilder.view.overview", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf dsh_builder_ui5.overview
	*/ 
	getControllerName : function() {
		return "ags.ssi.dshbuilder.controller.overview";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf dsh_builder_ui5.overview
	*/ 
	createContent : function(oController) {
		var panel = new sap.m.Panel("tileBasePanel", {
			
		}).addStyleClass("transparencyBackground");
		
		oDshMetadataModel.read("overview_tilesSet", {
			/*filters: [
				new sap.ui.model.Filter({path:"id", operator: "EQ", value1: dsh_id})
				],*/
			success: function(result){
				FrameUtil.tileList = result.results;
				var tileGrpWithTile = FrameInternalUtil.getCustomTileWithGroup(result.results);
				if(tileGrpWithTile && tileGrpWithTile.length){
					for(var i = 0; i < tileGrpWithTile.length; i++){
						panel.addContent(tileGrpWithTile[i]);
					}	
				}
				
				if(sap.ui.getCore().byId("loadDialog")){
					sap.ui.getCore().byId("loadDialog").close();
					sap.ui.getCore().byId("loadDialog").destroy();
				}
			},
			error: function(){
			}
		});	
		
		var oPage = new sap.m.Page({
			content: [panel],
			showHeader: false,
			showFooter: false
		});
		
		var oShell = new sap.ui.unified.Shell("mainshell",{
			headerHiding: true,
			headerVisible: false,
			content: [oPage]
			//content: [panel]
		});
		return oShell;
	}

});