var HandleDiffOfMode = {
	isEndUser: function(){
		return FrameUtil.userInfo.role === "end_user";
	},
	tileHeaderIconDisplay: function(oTile, tileContext){
		if(FrameUtil.userInfo.role == "end_user"){ //show zoom icon
			if(FrameUtil.supportVizTypeInTile.indexOf(tileContext.type) >= 0){
				oTile.setHeaderImage("sap-icon://zoom-in").addStyleClass("headerIconGray");
			}
		}else{ //show setting icon
			oTile.setHeaderImage("sap-icon://settings");			
		}
	},
	tileZoom: function(tileId){
		var oTile = sap.ui.getCore().byId(tileId);
		var oTileContent = oTile.getTileContent()[0];
		if(!oTileContent){
			return;
		}
		
		var oChart = oTileContent.getContent();
		if(!oChart.getVizType){
			oChart = oTileContent.getContent().getFlexContent();			
		}	
		var oCloneChart = oChart.clone();
		
		//workaround for vizType
		
		oCloneChart.setVizType(oChart.getVizType());
		oCloneChart.setVizProperties({
			title: {
				visible: false
			},
			tooltip: {
	           visible: true
			},
			plotArea: {
				 dataLabel: {
	                visible: true
				 }
            }
		});
		
		var plotAreaProperty = oChart.getVizProperties().plotArea;
		if(plotAreaProperty && plotAreaProperty.dataPointStyle){
			oCloneChart.setVizProperties({
				plotArea: {
					dataPointStyle: plotAreaProperty.dataPointStyle
				}
			});
		}
		
		if(plotAreaProperty && plotAreaProperty.colorPalette){
			oCloneChart.setVizProperties({
				plotArea: {
					colorPalette: plotAreaProperty.colorPalette
				}
			});
		}
		
		var oPopOver = new sap.viz.ui5.controls.Popover();
		//oPopOver.connect(oCloneChart.getVizUid());
		
		//end of workaround
		
		var popup = new sap.ui.core.Popup(null, true, true, false);		
		var subtitle = oTile.getSubheader();
		if(subtitle && subtitle !== ""){
			subtitle = "(" + subtitle + ")";
		}
		
		var toolBar = new sap.m.Toolbar({
			content : [
			           new sap.m.Title({text: oTile.getHeader()}),
			           new sap.m.Label({text: subtitle}).addStyleClass("zoomToolbarSubtitle"),
			           new sap.m.ToolbarSpacer(),
			           new sap.m.Button({
				   			icon: "sap-icon://full-screen",
				        	press : function() {
				        		var oPanelContent = popup.getContent();		        			
				        		if(oPanelContent.hasStyleClass("fullscrenPanel")){
				        			oCloneChart.setHeight((window.innerHeight * 0.7) + "px");
				        			popup.getContent().removeStyleClass("fullscrenPanel");
				        		}else{
				        			oCloneChart.setHeight((window.innerHeight - 50) + "px");
				        			popup.getContent().addStyleClass("fullscrenPanel");
				        		}		        			
				   		}}),
			           new sap.m.Button({
			   			icon: "sap-icon://decline",
			        	press : function() {
			        		popup.getContent().destroy();
			   				popup.close();
			   			}})
			          ]
		});
		
		var oPanel = new sap.m.Panel({
			//headerText: oTile.getHeader(),
			width: "80%",
			headerToolbar: toolBar,
			content: [oPopOver, oCloneChart]
		}).addStyleClass("popupPanel");
		var chartHeight = window.innerHeight * 0.7;
		oCloneChart.setHeight(chartHeight + "px");
		popup.setContent(oPanel);
		popup.open(1, "center center", "center center", document.body, null);
	}
};