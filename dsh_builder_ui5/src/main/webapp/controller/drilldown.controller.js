sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";
	
	return Controller.extend("ags.ssi.dshbuilder.controller.drilldown", {
		gvNoAsskpis: false,
		gtDataset: {},
		gSwitchBtns: {},
		beforeInit: function(oComboxBox){
			var chartDrillList = FrameUtil.drilldownObj.chartDrillList;
			var pos = 0;
			if(chartDrillList && chartDrillList.length > 0){
				if(FrameUtil.tileSettingId != ""){
					for(var i = 0; i< chartDrillList.length; i++){
						if(chartDrillList[i].id == FrameUtil.tileSettingId){
							pos = i;
							oComboxBox.setSelectedKey(FrameUtil.tileSettingId);
							break;
						}
					}
				}
				this.gtDataset = chartDrillList[pos];
				//this.createChartForNewCate();
			}
		},
		renderAfterUnitChange: function(){
			var tileId = sap.ui.getCore().byId("DropdownBox1").getSelectedKey();
			this.createChartForNewCate(tileId, true);
		},
		_createVizContainer: function(drillViewInfo){
			var oVizFrameContainer = sap.ui.getCore().byId("drillVizFrameContainer");
			oVizFrameContainer.destroyContent();
			if(drillViewInfo && drillViewInfo.DATASET && drillViewInfo.DATASET.length > 0){		
				var oContentColumn = new sap.suite.ui.commons.ChartContainerContent({
			   	 icon : "sap-icon://bar-chart",
			   	 content: ChartVisualization.createDrillchartContainer(drillViewInfo, this.gvNoAsskpis, 'CC')		
				});			
				var oContentLine = new sap.suite.ui.commons.ChartContainerContent({
				   	 icon : "sap-icon://line-chart",
				   	 content: ChartVisualization.createDrillchartContainer(drillViewInfo, this.gvNoAsskpis, 'CL')			
				});
				var oContentStackColumn = new sap.suite.ui.commons.ChartContainerContent({
			   	 icon : "sap-icon://upstacked-chart",
			   	 content: ChartVisualization.createDrillchartContainer(drillViewInfo, this.gvNoAsskpis, 'CSTC')			
				});
				var oContentTable = new sap.suite.ui.commons.ChartContainerContent({
			   	 icon : "sap-icon://table-chart",
			        content: ChartVisualization.createDrillchartContainer(drillViewInfo, this.gvNoAsskpis, 'TABLE')		
				});
				var chartType = drillViewInfo.type;
				var vizContent = [oContentColumn, oContentLine, oContentStackColumn, oContentTable];			
				switch(chartType){
					case "TABLE":					
						oVizFrameContainer.addContent(oContentTable);
						vizContent.splice(3,1);
						break;
					case "CL":
						oVizFrameContainer.addContent(oContentLine);
						vizContent.splice(1,1);
						break;
					case "CSTC":
						oVizFrameContainer.addContent(oContentStackColumn);
						vizContent.splice(2,1);
						break;
					default:
						oVizFrameContainer.addContent(oContentColumn);
						vizContent.splice(0,1);
				}
				for(var i = 0; i < vizContent.length; i++){
					oVizFrameContainer.addContent(vizContent[i]);
				}
			}
			oVizFrameContainer.destroyCustomIcons();
			var that = this;
			if(drillViewInfo.jump_bics){
				var bicsBtn = new sap.ui.core.Icon({src: "sap-icon://switch-views",
		        	tooltip: FrameUtil.oTextBundle.getText("VIEWQUERYDETAIL_TOOLTIP"),
		   			visible: false,
		   			press: function(){
		   				that.openBicsView(drillViewInfo.ds_source);
		   			}
		       	});
				oVizFrameContainer.addCustomIcon(bicsBtn);
			}
			
			var oDownloadIcon = new sap.ui.core.Icon({
				src: "sap-icon://download",
				press: function(oEvent){
					FrameInternalUtil.exportTableToExcel(drillViewInfo.id);
				}
			});
			oVizFrameContainer.addCustomIcon(oDownloadIcon);
			
			var currencyCtrs = FrameInternalUtil._currencyBarInVizFrame(drillViewInfo);
			for(var j = 0; j < currencyCtrs.length; j++){
				oVizFrameContainer.addDimensionSelector(currencyCtrs[j]);
			}
			
			setTimeout(function(){
				if(oVizFrameContainer._aChartIcons && oVizFrameContainer._aChartIcons[0]){
					oVizFrameContainer._aChartIcons[0].firePress();
				}
			}, 500);	
		},
		createChartForNewCate: function(kpiId, forceReload){		
			if(FrameUtil.drilldownObj.chartDrillList.length === 0){
				return;
			}
			var pos = 0;
			var that = this;
			for(var i = 0; i< FrameUtil.drilldownObj.chartDrillList.length; i++){
				if(FrameUtil.drilldownObj.chartDrillList[i].id == kpiId){
					pos = i;
					break;
				}
			}
			var drillViewInfo = FrameUtil.drilldownObj.chartDrillList[pos];
			if(!drillViewInfo.DATASET || forceReload){
				FrameInternalUtil.loadTilesoData(drillViewInfo, function(dataInfo){
					drillViewInfo = dataInfo;
					that._createVizContainer(drillViewInfo);
				});
			}else{
				that._createVizContainer(drillViewInfo);
			}
			
		},
		openBicsView: function(ds_source){
			var htmlStr = FrameUtil.userInfo.bics_url + ds_source + "&SAP-THEME=sap_bluecrystal&sap-language=" + FrameUtil.userInfo.lang;
			window.open(htmlStr);
		},

		onAfterRendering: function() {
			triggerResize();
		}

	});
});