sap.ui.jsview("ags.ssi.dshbuilder.view.drilldown", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf dsh_builder_ui5.drilldown
	*/ 
	getControllerName : function() {
		return "ags.ssi.dshbuilder.controller.drilldown";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf dsh_builder_ui5.drilldown
	*/ 
	
	createContent : function(oController) {
		//FrameUtil.drilldownObj.chartDrillList = chartDrillList;
		//FrameUtil.drilldownObj.selectTile = selectTile;
		
		var tileTmpArr = FrameUtil.tileList.filter(function(a){if(a.id === FrameUtil.drilldownId) return true;});
		FrameUtil.drilldownObj.selectTile = tileTmpArr[0];
	
		
		var headerKPILabel = new sap.m.Label().addStyleClass("dirllKPIText");
		
		if(FrameUtil.drilldownObj.selectTile.type == "" || FrameUtil.drilldownObj.selectTile.type === "T"){
			FrameInternalUtil.loadTilesoData(FrameUtil.drilldownObj.selectTile, function(tilePara){
				FrameUtil.drilldownObj.selectTile = tilePara;
				var parentKpiText = 0;
				if(tilePara.DATASET[1]){
					parentKpiText = tilePara.DATASET[1]["FIELD1"];
				}
				if(tilePara.units){
					parentKpiText += tilePara.units;
				}
				headerKPILabel.setText(parentKpiText);
				switch(tilePara.DATASET[1]["FIELD2"]){
					case "Y": headerKPILabel.addStyleClass("drillKPIYellow"); break;
					case "R": headerKPILabel.addStyleClass("drillKPIRed"); break;
					case "G": headerKPILabel.addStyleClass("drillKPIGreen"); break;
					default: headerKPILabel.addStyleClass("drillKPINone");
				}
			});
		}		
		
		var oPage = new sap.m.Page({
			title: FrameUtil.drilldownObj.selectTile.name,
			headerContent: [ headerKPILabel ],
			showNavButton: false,
			navButtonPress: function(){
				//FrameUtil.backToOverview();
			}
		});
		
		var oLayoutContent = new sap.ui.commons.layout.VerticalLayout({width: "100%"});

		oPage.addContent(oLayoutContent);
		
//tiles
		var oTileContainer = new sap.suite.ui.commons.HeaderContainer("drillTileContainer",{
			height: "220px"
		}); 	
		oLayoutContent.addContent(oTileContainer);
		
		var _drilldownViewUrl = _hostUrl + "/sap/opu/odata/SAP/AGS_DSH_TILE_META_DATA_SRV?search=kpi_id___";
		_drilldownViewUrl = _drilldownViewUrl + "'" + FrameUtil.drilldownId + "'";
		var oDrilldownViewModel = new sap.ui.model.odata.ODataModel(_drilldownViewUrl);
		oDrilldownViewModel.read("associated_tilesSet", {
			success: function(result){
				FrameUtil.drilldownObj.tileList = result.results;
				if(FrameUtil.drilldownObj.tileList.length === 0){
					oPage.addStyleClass("hideAssKPIs");
					oController.gvNoAsskpis = true;
				}
				if(oController.gvNoAsskpis){
					FrameUtil.drilldownObj.chartSize.height = 	window.innerHeight - 300;		
				}else{
					FrameUtil.drilldownObj.chartSize.height = 	window.innerHeight - 450;	
				}	
				if(FrameUtil.drilldownObj.chartSize.height < 300){
					FrameUtil.drilldownObj.chartSize.height = 300;
				}
				
				var tileGrpWithTile = FrameInternalUtil.getCustomTileWithGroup(result.results);
				if(tileGrpWithTile && tileGrpWithTile.length){
					for(var e1 = 0; e1 < tileGrpWithTile.length; e1++){
						var cellObj = new sap.suite.ui.commons.HeaderCell({
							north: new sap.suite.ui.commons.HeaderCellItem({
								content: tileGrpWithTile[e1]
							})
						});
						oTileContainer.addItem(cellObj);
					}	
				}							
			}
		});	
		
//drilldown chart		
		var oDimentionSelectors = new sap.m.Select("DropdownBox1",{
			change: function(oEvent){
				var kpi_id = oEvent.oSource.getSelectedKey();
				oController.createChartForNewCate(kpi_id);
			}
		});
		
		oDrilldownViewModel.read("drilldown_viewsSet", {
			success: function(result){
				FrameUtil.drilldownObj.chartDrillList = result.results;
				var chartDrillList = FrameUtil.drilldownObj.chartDrillList;
				for( var e2 in chartDrillList){
					oDimentionSelectors.addItem(
						new sap.ui.core.Item( { key: chartDrillList[e2].id, text: chartDrillList[e2].drilldown_name })
					);
				}
				oController.beforeInit(oDimentionSelectors);
				oController.createChartForNewCate();
			}
		});

		//end  of workaround
		var oVizFrameContainer = new sap.suite.ui.commons.ChartContainer("drillVizFrameContainer",{
			showFullScreen: true,
			ChartContainer: true,			
			dimensionSelectors: [ oDimentionSelectors],
			contentChange: function(){
				triggerResize();
			}
			//content: [oContentColumn, oContentLine, oContentStackColumn, oContentTable]
		});
		
		/*var currencyCtrs = FrameInternalUtil._currencyBarInVizFrame();
		for(var j = 0; j < currencyCtrs.length; j++){
			oVizFrameContainer.addDimensionSelector(currencyCtrs[j]);
		}*/
		
		oVizFrameContainer.setAutoAdjustHeight(true);
		
		if(oVizFrameContainer._oFullScreenButton){
			oVizFrameContainer._oFullScreenButton.attachPress(function(){
				setTimeout(function(){
					triggerResize();
				},500);				
			});
		}
		var oDrillChartContainer = new sap.ui.commons.layout.VerticalLayout("drillChartContainer",{width: "95%"});
		oDrillChartContainer.addContent(oVizFrameContainer);
		oLayoutContent.addContent(oDrillChartContainer);
		
		return oPage;
	}

});