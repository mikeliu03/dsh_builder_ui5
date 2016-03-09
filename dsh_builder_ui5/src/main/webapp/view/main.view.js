sap.ui.jsview("ags.ssi.dshbuilder.view.main", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf dsh_builder_ui5.main
	*/ 
	getControllerName : function() {
		return "ags.ssi.dshbuilder.controller.main";
	},

	
	
	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf dsh_builder_ui5.main
	*/ 
	createContent : function(oController) {	
		var filterListContainer = new sap.m.Panel("filterListContainer",{
		}).addStyleClass("filterListContainer");
		var oMainPage = sap.ui.view({id:"idDshMain", viewName:"ags.ssi.dshbuilder.view.overview", type:sap.ui.core.mvc.ViewType.JS});
		
		var oSplitContainer = new sap.ui.unified.SplitContainer("mainSplitContainer",{
			content: [filterListContainer, oMainPage]
		});				
		
		//var title = oTextBundle.getText("APP_TITLE");//"Dashboard Builder"
		
		var userItem = new sap.ui.unified.ShellHeadUserItem({image: "sap-icon://person-placeholder"});
		var dashNameLabel = new sap.m.Label();
		
		var menuGlobalFilter = new sap.ui.unified.ShellHeadItem("gfilterIconBtn",{
			icon: 'sap-icon://filter',
			tooltip: oTextBundle.getText("GLOBALFILTER_TOOLTIP")
		});
		
		var oShell = new sap.ui.unified.Shell("overallShell",{
			icon: "source/sap_50x26.png",
			//headerHiding: false,
			//headerVisible: true,
			content: [oSplitContainer],
			user: userItem,
			search: dashNameLabel.addStyleClass("shellTitle")
		});
		
		oDshMetadataModel.read("global_filterSet", {
			success: function(result){
				var gfItemsArr = result.results;
				if(gfItemsArr && gfItemsArr.length && gfItemsArr.length > 0){
					FrameUtil.gfFilterListItems = gfItemsArr;
					oShell.addHeadEndItem(menuGlobalFilter);
					menuGlobalFilter.attachPress(function(){
						GlobalFilterUtil.globalFilterIconClick();
					});					
				}				
			}
		});		
		
		oDshMetadataModel.read("user_infoSet", {
			success: function(result){
				var userInfoArr = result.results;
				if(userInfoArr && userInfoArr.length){
					var userInfo = userInfoArr[0];
					if(userInfo){
						FrameUtil.userInfo.bics_url = userInfo.bics_url;
						userItem.setUsername(userInfo.user);
						dashNameLabel.setText(userInfo.dsh_name);
					}
				}							
			}
		});
		var oPage = new sap.m.Page("navigationPage",{
			content: [oShell],
			showHeader: false,
			showFooter: false
		});
		return oPage;
	}

});