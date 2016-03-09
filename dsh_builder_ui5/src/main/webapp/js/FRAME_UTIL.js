/*global $, FrameUtil,jQuery, triggerResize, sap, setTimeout:true*/
/*global dev:true*/

var FrameInternalUtil = {
	_handleTileBpaUnitChange: function(tileId, valueJson){
		var pos = -1;
		for(var i = 0; i < FrameUtil.tileList.length; i++){
			if(FrameUtil.tileList[i].id == tileId){
				pos = i;
				break;
			}
		}
		if(pos < 0){
			return;
		}		
		for(var e in valueJson){
			if(e){
				FrameUtil.tileList[pos][e] = valueJson[e];
			}
		}
		
		var tileInfo = FrameUtil.tileList[pos];
		
		var oTile = sap.ui.getCore().byId(tileId);
		var oTileContent = oTile.getTileContent()[0];
		if(oTileContent){
			this.loadTileContent(tileInfo, oTileContent);
		}
	},
	_handleDrilldownBpaUnitChange: function(tileId, valueJson){
		var pos = -1;
		for(var i = 0; i < FrameUtil.drilldownObj.chartDrillList.length; i++){
			if(FrameUtil.drilldownObj.chartDrillList[i].id == tileId){
				pos = i;
				break;
			}
		}
		if(pos < 0){
			return;
		}		
		for(var e in valueJson){
			if(e){
				FrameUtil.drilldownObj.chartDrillList[pos][e] = valueJson[e];
			}
		}		
		//var drilviewInfo = FrameUtil.drilldownObj.chartDrillList[pos];
		var oDrilPage = sap.ui.getCore().byId("drilldownPage");
		oDrilPage.getController().renderAfterUnitChange();
	},
	_showOrHideCurrencyBarInContainer: function(visible){		
		if(sap.ui.getCore().byId("comboBoxUnit")){
			sap.ui.getCore().byId("comboBoxUnit").setVisible(visible);
		}
		if(sap.ui.getCore().byId("toolBarSep")){
			sap.ui.getCore().byId("toolBarSep").setVisible(visible);
		}
		if(sap.ui.getCore().byId("comboBoxCurrency")){
			sap.ui.getCore().byId("comboBoxCurrency").setVisible(visible);
		}
		if(sap.ui.getCore().byId("labelCurrency")){
			sap.ui.getCore().byId("labelCurrency").setVisible(visible);
		}
		if(sap.ui.getCore().byId("comboBoxRate")){
			sap.ui.getCore().byId("comboBoxRate").setVisible(visible);
		}
		if(sap.ui.getCore().byId("labelRate")){
			sap.ui.getCore().byId("labelRate").setVisible(visible);
		}
	},
	_currencyBarInVizFrame: function(tileInfo){	
		if(!tileInfo){
			tileInfo = FrameUtil.drilldownObj.chartDrillList[0];
		}
		var that = this;
		var flagAlreadyExist = false;
		
		var oComboBoxUnit = sap.ui.getCore().byId("comboBoxUnit");
		if(oComboBoxUnit){
			flagAlreadyExist = true;
			if(!tileInfo.bpa_unit || tileInfo.bpa_unit == "" ){
				that._showOrHideCurrencyBarInContainer(false);
				return [];
			}else{
				that._showOrHideCurrencyBarInContainer(true);
			}
		}
		if(!oComboBoxUnit){
			oComboBoxUnit = new sap.m.ComboBox("comboBoxUnit",{
				width: "170px",
				items: [new sap.ui.core.ListItem({text: oTextBundle.getText("DEFAULTUNIT_TXT"), key: "DEFAULT"}),
						new sap.ui.core.ListItem({text: oTextBundle.getText("MONETARYVALUE_TXT"), key: "MON"})],
				selectionChange: function(oEvent){
					var tileId = sap.ui.getCore().byId("DropdownBox1").getSelectedKey();
					var unit = oEvent.oSource.getSelectedKey();			
					ctrVisible(unit);
					that._handleDrilldownBpaUnitChange(tileId, { "bpa_unit": unit});
				}
			}).addStyleClass("monetatySubMCtr");
		}
		oComboBoxUnit.setSelectedKey(tileInfo.bpa_unit);
		
		var oSep = sap.ui.getCore().byId("toolBarSep");
		if(!oSep){
			oSep = new sap.m.ToolbarSeparator("toolBarSep").addStyleClass("monetatySubMCtr");
		}
		
		var oComboBoxCurrency = sap.ui.getCore().byId("comboBoxCurrency");
		if(!oComboBoxCurrency){
			oComboBoxCurrency = new sap.m.ComboBox("comboBoxCurrency",{
				width: "110px",
				editable: false,
				items: {
					template: new sap.ui.core.ListItem({key: "{value}", text: "{value}" }),
					path: "/currencySet"
				},
				selectionChange: function(oEvent){
					var currency = oEvent.oSource.getSelectedKey();
					var tileId = sap.ui.getCore().byId("DropdownBox1").getSelectedKey();
					that._handleDrilldownBpaUnitChange(tileId, { "currency": currency});
				}
			}).addStyleClass("monetatySubMCtr");
			oComboBoxCurrency.setModel(oBpaUnitModel);
		}
		oComboBoxCurrency.setSelectedKey(tileInfo.currency);	
		
		
		var oLabel1 = sap.ui.getCore().byId("labelCurrency");
		if(!oLabel1){
			oLabel1 = new sap.m.Label("labelCurrency",{ text: oTextBundle.getText("CURRENCY_TXT") + ":", labelFor: oComboBoxCurrency,
			}).addStyleClass("monetatySubMCtr");
		}
		
		var oComboBoxRate = sap.ui.getCore().byId("comboBoxRate");
		if(!oComboBoxRate){
			oComboBoxRate = new sap.m.ComboBox("comboBoxRate",{
				width: "100px",
				editable: false,
				items: {
					template: new sap.ui.core.ListItem({key: "{value}", text: "{value}" }),
					path: "/rate_typeSet"
				},
				selectionChange: function(oEvent){
					var tileId = sap.ui.getCore().byId("DropdownBox1").getSelectedKey();
					var rate = oEvent.oSource.getSelectedKey();
					that._handleDrilldownBpaUnitChange(tileId, { "rate_type": rate});
				}
			}).addStyleClass("monetatySubMCtr");
			oComboBoxRate.setModel(oBpaUnitModel);
		}
		oComboBoxRate.setSelectedKey(tileInfo.rate_type);
		
		var oLabel2 = sap.ui.getCore().byId("labelRate");
		if(!oLabel2){
			oLabel2 = new sap.m.Label("labelRate",{ 
				text: oTextBundle.getText("ERTFULL_TXT") + ":",
				tooltip: oTextBundle.getText("ERTFULL_TXT"),
				labelFor: oComboBoxRate
			}).addStyleClass("monetatySubMCtr");
		}
		
		if(tileInfo.unit_changeable !== "X"){
			oComboBoxUnit.setEditable(false);
			if(tileInfo.bpa_unit == "DEFAULT"){
				oComboBoxUnit.setVisible(false);
			}			
		}else{
			oComboBoxUnit.setEditable(true);
		}
		if(tileInfo.curr_changeable == "X"){
			oComboBoxCurrency.setEditable(true);
			oComboBoxRate.setEditable(true);
		}else{
			oComboBoxCurrency.setEditable(false);
			oComboBoxRate.setEditable(false);
		}	
		
		var ctrVisible = function(unit){
			var visible = false;
			if(unit == "MON"){
				visible = true;
			}
			oSep.setVisible(visible);
			oLabel1.setVisible(visible);
			oLabel2.setVisible(visible);
			oComboBoxCurrency.setVisible(visible);
			oComboBoxRate.setVisible(visible);
		}
		
		ctrVisible(tileInfo.bpa_unit);
		
		if(flagAlreadyExist){
			return [];
		}else{
			return [oComboBoxUnit, oSep, oLabel1, oComboBoxCurrency, oLabel2, oComboBoxRate];
		}		
	},
	_currencyToolbar: function(tileInfo){
		var tileId = tileInfo.id;
		var that = this;
		var oComboBoxUnit = new sap.ui.commons.ComboBox({
			width: "120px",
			selectedKey: tileInfo.bpa_unit,
			editable: true,
			items: [new sap.ui.core.ListItem({text: oTextBundle.getText("DEFAULTUNIT_TXT"), key: "DEFAULT"}),
					new sap.ui.core.ListItem({text: oTextBundle.getText("MONETARYVALUE_TXT"), key: "MON"})]			
		}).addStyleClass("hideCurrencyCtr");
		var oSep = new sap.ui.commons.ToolbarSeparator({			
		});
		var oComboBoxCurrency = new sap.ui.commons.ComboBox({
			width: "60px",
			selectedKey: tileInfo.currency,
			editable: false,
			items: {
				template: new sap.ui.core.ListItem({key: "{value}", text: "{value}" }),
				path: "/currencySet"
			},
			change: function(oEvent){
				var currency = oEvent.oSource.getSelectedKey();
				that._handleTileBpaUnitChange(tileId, { "currency": currency});
			}
		}).addStyleClass("monetatySubCtr");
		
		var oLabel1 = new sap.ui.commons.Label({ text: oTextBundle.getText("CURRENCY_TXT") + ":", labelFor: oComboBoxCurrency,
											   }).addStyleClass("currencyLabel").addStyleClass("monetatySubCtr");
		
		var oComboBoxRate = new sap.ui.commons.ComboBox({
			width: "60px",
			selectedKey: tileInfo.rate_type,
			editable: false,
			items: {
				template: new sap.ui.core.ListItem({key: "{value}", text: "{value}" }),
				path: "/rate_typeSet"
			},
			change: function(oEvent){
				var rate = oEvent.oSource.getSelectedKey();
				that._handleTileBpaUnitChange(tileId, { "rate_type": rate});
			}
			}).addStyleClass("monetatySubCtr");
		
		var oLabel2 = new sap.ui.commons.Label({ 
			tooltip: oTextBundle.getText("ERTFULL_TXT"),
			labelFor: oComboBoxRate
		}).addStyleClass("monetatySubCtr");
		if(tileInfo.layout == "XXL"){
			oLabel2.setText(oTextBundle.getText("ERTFULL_TXT") + ":");
		}else{
			oLabel2.setText(oTextBundle.getText("ERT") + ":");
		}		
		
		if(tileInfo.unit_changeable !== "X"){
			oComboBoxUnit.setEditable(false);
			if(tileInfo.bpa_unit == "DEFAULT"){
				oComboBoxUnit.setVisible(false);
			}			
		}
		if(tileInfo.curr_changeable == "X"){
			oComboBoxCurrency.setEditable(true);
			oComboBoxRate.setEditable(true);
		}
		
		var ctrVisible = function(unit){
			var visible = false;
			if(unit == "MON"){
				visible = true;
			}
			oSep.setDisplayVisualSeparator(visible);
			oLabel1.setVisible(visible);
			oLabel2.setVisible(visible);
			oComboBoxCurrency.setVisible(visible);
			oComboBoxRate.setVisible(visible);
		};
		
		oComboBoxUnit.attachChange(function(oEvent){
			var unit = oEvent.oSource.getSelectedKey();			
			ctrVisible(unit);
			that._handleTileBpaUnitChange(tileId, { "bpa_unit": unit});
		});
		ctrVisible(tileInfo.bpa_unit);
		var oToolbar = new sap.ui.commons.Toolbar({
			items: [oComboBoxUnit, oSep, oLabel1, oComboBoxCurrency, oLabel2, oComboBoxRate]
		}).addStyleClass("currencyToolbar");
		oToolbar.setModel(oBpaUnitModel);
		return oToolbar;
	},
	gfilterIconVisibility: function(visible){
		sap.ui.getCore().byId("gfilterIconBtn").setVisible(visible);
	},
	composeGeneralTile: function(tileInfo){
		var otileContent;		
		if(FrameUtil.supportVizTypeInTile.indexOf(tileInfo.type) >= 0){
			otileContent = ChartVisualization.createTileEmbedChart(tileInfo);
		}
		else if( tileInfo.type == 'TABLE' ){
			otileContent = TableGenerator.createTableEmbedTile(tileInfo);
		}
		else if( tileInfo.type == 'MP'){
			otileContent = new sap.suite.ui.commons.ComparisonChart({
				size: "Auto",
				scale: tileInfo.unit
			});
			for(var e in tileInfo.DATASET){
				if( e != 0 ){
				otileContent.addData(new sap.suite.ui.commons.ComparisonData({title: tileInfo.DATASET[e].FIELD1, value: parseFloat(tileInfo.DATASET[e].FIELD2), color: "Neutral"}));
				}
			}		
			
		}else if( tileInfo.type == 'ML'){
			var chartItems = new sap.suite.ui.commons.MicroAreaChartItem();
			for(var e_1 in tileInfo.DATASET){
				if(e_1 != 0){
					chartItems.addPoint( new sap.suite.ui.commons.MicroAreaChartPoint({ x: 30 * (e_1 - 1), y: parseFloat(tileInfo.DATASET[e_1].FIELD2) } ));
				}
			}
			
			otileContent = new sap.suite.ui.commons.MicroAreaChart({
				height: "70px",
				width: "100%",
				chart: chartItems
				//size: "Auto"
			});			
		}else if( tileInfo.type == 'MC'){
			otileContent = new sap.suite.ui.commons.ColumnMicroChart({
				size: "Auto"
			});
			for(var e_2 in tileInfo.DATASET){
				if( e_2 != 0){
				otileContent.addColumn(new sap.suite.ui.commons.ColumnData({label: tileInfo.DATASET[e_2].FIELD1, value: parseFloat(tileInfo.DATASET[e_2].FIELD2), color: "Neutral"}));				
				}
			}
			
		}else{
			var number = 0;
			if(tileInfo.DATASET[1]){
				number = tileInfo.DATASET[1]["FIELD1"];
			}
			
			var tileValue = this.handleNumberOfTile(number);
			otileContent = new sap.suite.ui.commons.NumericContent({
				size: "Auto",
				scale: tileInfo.unit,
				value: tileValue,
				truncateValueTo: 10,
				//valueColor: "Neutral",
				tooltip: ""
				//indicator: "Up"
			});
			var valueColor = "Neutral";
			if(tileInfo.DATASET[1]){
				switch(tileInfo.DATASET[1]["RATING_FIELD1"]){
					case 'G': valueColor = "Good"; break;
					case 'R': valueColor = "Error"; break;
					case 'Y': valueColor = "Critical"; break;
					default: valueColor = "Neutral"; break;
				}
			}			
			otileContent.setValueColor(valueColor);
			
		}
		
		if(tileInfo.layout == 'XL' || tileInfo.layout == 'XXL'){
			if(tileInfo.bpa_unit && tileInfo.bpa_unit !== "" ){
				var toolBarCurrency = this._currencyToolbar(tileInfo);
				var fixFlex = new sap.ui.layout.FixFlex({
					fixContentSize: "30px",
					fixContent: [toolBarCurrency],
					flexContent: otileContent
				});
				fixFlex.addStyleClass("toolbarTileFlex");
				return fixFlex;
			}	
		}
		
		return otileContent;
	},
	getoDataMetaData: function(oDataModel){
		var entityType = oDataModel.oMetadata.mEntityTypes;
		var metaData = [];
		if(entityType){
			var propertyArr;
			for(var e in entityType){
				if(e){
					propertyArr = entityType[e].property;
					break;
				}				
			}
			//var propertyArr = entityType["/generic_rsltSet"].property;
			if(propertyArr){				
				for(var i = 0; i < propertyArr.length; i++){
					var labelObj = propertyArr[i].extensions.filter(function(a){ 
						if(a.name == "label"){
							return true;
						}
					});
					var aggregationObj = propertyArr[i].extensions.filter(function(a){ 
						if(a.name == "aggregation-role"){
							return true;
						}
					});
					var fieldNameObj = propertyArr[i].extensions.filter(function(a){ 
						if(a.name == "field_name"){
							return true;
						}
					});					
					if(aggregationObj && aggregationObj.length > 0){
						var metaDataJson = {name: propertyArr[i].name, label: labelObj[0].value, role: aggregationObj[0].value};
						if(fieldNameObj[0] && fieldNameObj[0].value){
							metaDataJson["techname"] = fieldNameObj[0].value;							
						}
						metaData.push(metaDataJson);
					}else{
						var ratingObj = propertyArr[i].extensions.filter(function(a){ 
							if(a.name == "rating_for"){
								return true;
							}
						});
						if(ratingObj && ratingObj.length > 0){
							metaData.push({name: propertyArr[i].name, label: labelObj[0].value, role: "KR", rating_for: ratingObj[0].value});
						}
					}
				}
			}
		}
		return metaData;
	},
	loadTilesoData: function(tileInfo, callback){
		var oDataUrl = _hostUrl + "/sap/bc/dsbuilder_hdler/tile/" + tileInfo.id 
		+ "?use_generic_stru___true";
		if(FrameUtil.gfFilterParaStr && FrameUtil.gfFilterParaStr !== ""){
			oDataUrl = oDataUrl + "&global_filters___" + FrameUtil.gfFilterParaStr;
		}
		if(tileInfo.bpa_unit && tileInfo.bpa_unit !== ""){
			oDataUrl = oDataUrl + "&bpaunit___" + tileInfo.bpa_unit;
		}
		if(tileInfo.currency && tileInfo.currency !== ""){
			oDataUrl = oDataUrl + "&currency___" + tileInfo.currency;
		}
		if(tileInfo.rate_type && tileInfo.rate_type !== ""){
			oDataUrl = oDataUrl + "&rate_type___" + tileInfo.rate_type;
		}
		
		var oDatasetModel = new sap.ui.model.odata.ODataModel(oDataUrl);
		var that = this;
		oDatasetModel.read(tileInfo.id + "Set", {//"generic_rsltSet", {
			success: function(results){
				var dataset = results.results;
				
				//semantic color
				if(dataset.length > 0){
					if(dataset[0].SEMANTIC_COLORS && dataset[0].SEMANTIC_COLORS !== ""){
						tileInfo.SEMANTICSET = JSON.parse(dataset[0].SEMANTIC_COLORS);
					}
					if(dataset[0].APPL_PARAMS && dataset[0].APPL_PARAMS !== ""){
						tileInfo.APPL = JSON.parse(dataset[0].APPL_PARAMS);
					}
				}
				
				var objTmp = {};
				var metaSet = that.getoDataMetaData(oDatasetModel);
				for(var i = 0; i < metaSet.length; i++){
					if(metaSet[i].role == "dimension"){
						objTmp[metaSet[i].name] = metaSet[i].label + "#C";
					}else if(metaSet[i].role == "measure"){
						objTmp[metaSet[i].name] = metaSet[i].label + "#K";
					}else if(metaSet[i].role == "KR"){
						var rating_label = metaSet.filter(function(a){if(a.name == metaSet[i]["rating_for"]) return true; });
						if(rating_label && rating_label.length > 0){
							objTmp[metaSet[i].name] = rating_label[0].label + "_RAT#KR";
						}						
					}
				}
				dataset.splice(0,0,objTmp);
				tileInfo.DATASET = dataset;
				tileInfo["METADATASET"] = metaSet;
				if(callback){
					callback(tileInfo);
				}				
			}
		});
	},
	loadTileContent: function(tileInfo, parentCtr){
		var that = this;
		this.loadTilesoData(tileInfo, function(tileInfoAfterSuccess){
			var oContent = that.composeGeneralTile(tileInfoAfterSuccess);
			parentCtr.setContent(oContent);
		});
	},
	exportTableToExcel: function(id){
		var oDownloadUrl = _hostUrl + "/sap/bc/webdynpro/sap/ags_download_tiledata?ds_id=" + id;
		if(FrameUtil.gfFilterParaStr && FrameUtil.gfFilterParaStr != ""){
			oDownloadUrl = oDownloadUrl + "&global_filters=" + FrameUtil.gfFilterParaStr;
		}
		if(!$("#exportframe")[0]){
			$("body").append('<iframe id="exportframe" height="0px" style="display:none;"/>')
		}
		$("#exportframe").removeAttr("src");
		$("#exportframe").attr("src",oDownloadUrl);	
	},
	getCustomTileWithGroup: function (tileArr) {
		var oControllerArr = [];
		for(var i in tileArr){
			var oTileInfo = tileArr[i];
			if(oTileInfo.kpi_kind == "KGP"){
				var htmlStr = '<p class = "tile_group_header" data-group-id="' + oTileInfo.id + '">' + oTileInfo.name + '</p>';
				var oGroupHeader = new sap.ui.core.HTML(oTileInfo.id,{
					content: htmlStr
				});
				oControllerArr.push(oGroupHeader);
			}else{				
				var tileContent = new sap.suite.ui.commons.TileContent({
					//content: otileContent,
					footer: oTileInfo.footer
					//unit: "EUR",
					//size: "S"
				});				
				this.loadTileContent(oTileInfo, tileContent);
				var  oCustomerTile = new sap.suite.ui.commons.GenericTile(oTileInfo.id,{
					header: oTileInfo.name,
					subheader: oTileInfo.subname,
					size: "Auto",
					state : sap.suite.ui.commons.LoadState.Loaded,
					//headerImage: "sap-icon://settings",
					//frameType: "OneByOne",
					tileContent: [ tileContent ]
				});
				HandleDiffOfMode.tileHeaderIconDisplay(oCustomerTile, oTileInfo);
				oCustomerTile.addStyleClass("clickSettingChart");
				if(oTileInfo.drilldown_type){
					oCustomerTile.data("drilldown-type", oTileInfo.drilldown_type, true);	
				}
				if(oTileInfo.drilldown_type && oTileInfo.drilldown_type != "NONE"){
					oCustomerTile.addStyleClass("cursorPoint");
				}
				
				if(oTileInfo.drilldown_url !== ""){
					oCustomerTile.data("drilldown-url", oTileInfo.drilldown_url, true);		
				}
				if (oTileInfo.layout == 'L')
				{
					oCustomerTile.addStyleClass("myLSizeMCustomTile");  
				}else if(oTileInfo.layout == 'XL'){					
					oCustomerTile.addStyleClass("myXLSizeMCustomTile"); 
				}else if(oTileInfo.layout == 'XXL'){					
					oCustomerTile.addStyleClass("myXXLSizeMCustomTile"); 
				}

				//To add press event
				oCustomerTile.attachBrowserEvent("click", this.tileClickEventHandle);
				
				//end of method
				oControllerArr.push(oCustomerTile);
			}			
		}
		return oControllerArr;
	},
	
	
	handleNumberOfTile: function(number){
		var displayNum = number;
		if( displayNum && displayNum.length > 6){
			var endCharacter = "";
			if((displayNum.substr(displayNum.length - 1)) == "%"){
				endCharacter = "%";
				displayNum = displayNum.substr(0, displayNum.length - 1);
			}
			var regex = /^\d+\.?\d+$/;
			var unit = "";
			if(regex.test(displayNum)){
				var indexOfDot = displayNum.indexOf(".");
				if(indexOfDot < 0){
					indexOfDot = displayNum.length;
				}
				if(indexOfDot > 9){
					unit = "B";
				}else if(indexOfDot > 6){
					unit = "M";
				}else if(indexOfDot > 3){
					unit = "K";
				}
				var intergCount = (indexOfDot + 2)%3 + 1;
				var floatCharacter = displayNum.substr(intergCount, 1) == "."? displayNum.substr(intergCount + 1, 1) : displayNum.substr(intergCount, 1);

				displayNum = displayNum.substr(0, intergCount) + "." + floatCharacter + unit + endCharacter;
				return displayNum;
			}
		}
		return number;
	},
	_drilldownEventSubHandle: function(lvDrilldownId, additionFilter){
		if(FrameUtil.pageType === "OVERVIEW"){								
			GlobalFilterUtil.globalFilterIconClick(true);
			if(FrameUtil.userInfo.role === "designer"){
			sap.ui.getCore().byId("idAccordionDsh").getController().setStatusOfAcc(false);
			sap.ui.getCore().byId("btn_add_dash").setEnabled(false);
			sap.ui.getCore().byId("btn_delete_dash").setEnabled(false);
			sap.ui.getCore().byId("btn_edit_dash").setEnabled(false);
			sap.ui.getCore().byId("btn_copy_dash").setEnabled(false);
			}
			if( $("#" + lvDrilldownId).data("drilldown-type") === "DRILLDOWN"){
				FrameUtil.createDrilldownView(lvDrilldownId);
			}else{
				FrameInternalUtil.gfilterIconVisibility(false);
				if(sap.ui.getCore().byId("btn_add_tile")){
					sap.ui.getCore().byId("btn_add_tile").setEnabled(false);
				}
				
				var drilldownUrl = $("#" + lvDrilldownId).data("drilldown-url");
				if($("#" + lvDrilldownId).data("drilldown-type") !== "URL" && $("#" + lvDrilldownId).data("drilldown-type") !== "SMART_VIEW"){
					drilldownUrl = drilldownUrl + "&sap-wd-htmlrendermode=STANDARDS&SAP-THEME=sap_bluecrystal&DSH_ROLE=" + FrameUtil.userInfo.role
						+ "&sap-language=" + FrameUtil.userInfo.lang;
				}
				if(additionFilter){
					drilldownUrl = drilldownUrl + "&selection=" + additionFilter;
				}
				var frameHtm = '<iframe id="frameBICS" style="width: 100%;height: 100%;min-height: 100%;" src="' + encodeURI(drilldownUrl) + '"></iframe>';
				var htmlFrame = new sap.ui.core.HTML({ content: frameHtm });
				var oPage = new sap.m.Page({
					content: [htmlFrame],
					showNavButton: false,
					showHeader: false,
					navButtonPress: function(){
					}
				});
				var mainShell = sap.ui.getCore().byId("mainshell");
				mainShell.removeAllContent();
				mainShell.addContent(oPage);
				
				var backBtn = new sap.ui.unified.ShellHeadItem({
					icon: "sap-icon://nav-back",
					press: function(){
						FrameUtil.backToOverview();
					}
				});
				sap.ui.getCore().byId("overallShell").addHeadItem(backBtn);
			}
			FrameUtil.pageType = "DRILLDOWN";
			
		}
	},
	tileClickEventHandle: function(oEvent, args){
		var oselectEle = oEvent.target;
		var lvDrilldownId = this.getId();	
		FrameUtil.tileSettingId = lvDrilldownId;
		if($(oselectEle).hasClass("sapMGTHdrIconImage")){
			if(HandleDiffOfMode.isEndUser()){
				HandleDiffOfMode.tileZoom(lvDrilldownId);
			}else{
				FrameInternalUtil.tileSettingClick(lvDrilldownId);
			}			
		}
		else if($(oselectEle).parents(".currencyToolbar").length > 0){
		}
		else if($(oselectEle).parents(".sapUiTable").length > 0 || $(oselectEle).parents(".sapVizFrame").length > 0){
			
		}
		else if($("#" + lvDrilldownId).data("drilldown-type") !== "NONE"){
			FrameInternalUtil._drilldownEventSubHandle(lvDrilldownId);
		}
	}
};