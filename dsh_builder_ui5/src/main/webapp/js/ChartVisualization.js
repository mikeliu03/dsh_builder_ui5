var ChartVisualization = {
	createChartDataSet: function(oHeader, chartType){
		var ruleContextMeta = {
			ratingField: {},
			dimentionFields: []
		};
		var oReturnResult = {}, oFeeds = [];
		var categoryAxis = [], valueAxis = []; //kflAxis = [];
		var oDataset = new sap.viz.ui5.data.FlattenedDataset({
			data : {
				path : "/DATASET"
			}			
		});
		for(var e in oHeader){
			if(e && oHeader[e] !== ""){
				var splitArr = oHeader[e].split("#");
				if(!splitArr[0] || splitArr[0] == ""){
					continue;
				}
				if((splitArr.length == 1) || (splitArr[1] == "C") ){
					oDataset.addDimension( new sap.viz.ui5.data.DimensionDefinition({
						name : splitArr[0], 
						value : "{" + e + "}"
					}));
					categoryAxis.push(splitArr[0]);
					ruleContextMeta.dimentionFields.push({name: splitArr[0], field: e});
				}else if(splitArr[1] == "K"){
					oDataset.addMeasure(
						new sap.viz.ui5.data.MeasureDefinition({
							name: splitArr[0],
							value : "{" + e + "}"
						})
					);
					valueAxis.push(splitArr[0]);
				}else if(splitArr[1] == "KR"){
					/*oDataset.addMeasure(
						new sap.viz.ui5.data.MeasureDefinition({
							name: splitArr[0],
							value : "{" + e + "}"
						})
					);
					kflAxis.push(splitArr[0]);*/
					ruleContextMeta.ratingField = {name: splitArr[0], field: e};
					oReturnResult["ruleContextMeta"] = ruleContextMeta;
				}
			}
		}
		oFeedsAndFlag = this.createVizFeeds(valueAxis, categoryAxis, chartType);		
		if(oDataset.getMeasures().length > 0){
			oReturnResult["oDataset"] = oDataset;
			oReturnResult["oFeeds"] = oFeedsAndFlag["oFeeds"];
			//oReturnResult["withRL"] = oFeedsAndFlag["withRL"];
		}
		return oReturnResult;
	},
	createVizFeeds: function(valueAxis, categoryAxis, chartType){
		var oFeeds = [];
		var withRatingLine = false;
		if(chartType == "CP"){
			oFeeds.push(new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid' : "size",
				'type' : "Measure",
				'values' : valueAxis
			}));		
			oFeeds.push(new sap.viz.ui5.controls.common.feeds.FeedItem({				
				'uid' : "color",
				'type' : "Dimension",
				'values' : categoryAxis
			}));
		}else{
			/*if(kflAxis.length == 2){
				if(chartType == "CC"){
					valueAxis.push(kflAxis[0]);
					valueAxis.push(kflAxis[1]);
					withRatingLine = true;
				}
			}*/
			
			oFeeds.push(new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid' : "valueAxis",
				'type' : "Measure",
				'values' : valueAxis
			}));
		
			oFeeds.push(new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid' : "categoryAxis",
				'type' : "Dimension",
				'values' : categoryAxis
			}));
		}
		var oFeedsAndFlag = {};
		oFeedsAndFlag["oFeeds"] = oFeeds;
		//oFeedsAndFlag["withRL"] = withRatingLine;
		return oFeedsAndFlag;
	},
	_vizTypeOfAbbreviation: function(type, withRL){
		/*if(withRL){
			chartUI5TechName = "combination"
		}else{*/
		var chartUI5TechName = "column";
		switch ( type ) {
			case 'CL': chartUI5TechName = "line"; break;
			case 'CC': chartUI5TechName = "column"; break;
			case 'CSTC': chartUI5TechName = "stacked_column"; break;
			case 'CP': chartUI5TechName = "pie"; break;
			case 'CB': chartUI5TechName = "bar"; break;
			case 'CA': chartUI5TechName = "area"; break;
			case 'CT': chartUI5TechName = "heatmap"; break;
			case 'CSTB': chartUI5TechName = "stacked_bar"; break;
			case 'CCOMB': chartUI5TechName = "combination"; break;
		}
		//}		
		return chartUI5TechName;
	},
	createTileEmbedChart: function(tileInfo){
		if(tileInfo.DATASET.length > 0 && tileInfo.type == 'CP'){
			var flag = false;
			var i = 1;
			while(tileInfo.DATASET[0]["FIELD" + i]){
				var splitStr = tileInfo.DATASET[0]["FIELD" + i].split("#");				
				if(splitStr.length > 1 && splitStr[1] == "K"){
					if(flag){
						tileInfo.DATASET[0]["FIELD" + i] = "";
					}else{
						flag = true;
					}					
				}
				i++;
			}
		}
		var tempTileInfo = jQuery.extend(true, {}, tileInfo);		
		var oHeader = tempTileInfo.DATASET.splice(0,1)[0];		
		var that = this;
		var oDatasetAndFeeds = this.createChartDataSet( oHeader, tileInfo.type);
		var chartUI5TechName = this._vizTypeOfAbbreviation(tileInfo.type);		
		
		
		var oChart = new sap.viz.ui5.controls.VizFrame({
			 height: "100%",
			 width: "100%",
			 uiConfig: {
				applicationSet: "fiori"
			 },
			 vizType: chartUI5TechName,			 
			 legendVisible: false,
			 feeds: oDatasetAndFeeds["oFeeds"],
			 dataset: oDatasetAndFeeds["oDataset"],
			 vizProperties: {
				 title: {
					visible: false
				 },
				 tooltip: {
	                visible: true
				 },
				 plotArea: {
					 dataLabel: {
                         visible: true
                     },
                     gridline: {
                    	 visible: false
                     },
                     isFixedDataPointSize: false
				 }, 
				 valueAxis: {
					 visible: false
                 },
                 categoryAxis: {
                     title: {
                         visible: false
                     }
                 }
			 }
		 });
		if((tileInfo.type == "CC" || tileInfo.type == "CB") && oDatasetAndFeeds["ruleContextMeta"]){
			var vizSemanticRule = this.handleSemanticColorRule(oDatasetAndFeeds["ruleContextMeta"], tempTileInfo.DATASET);
			oChart.setVizProperties({
				plotArea: {dataPointStyle: vizSemanticRule}
			});
		}		
		this.handleVizFrameColorPalate(tileInfo.SEMANTICSET, oChart);
		
		if(this.getIsPercentFormat(tileInfo.DATASET)){
			tempTileInfo.DATASET = this.handlePercentArrray(tempTileInfo.DATASET);
			//var scaleMax = this.getMaxInArray(tempTileInfo.DATASET);
			oChart.setVizProperties({
				plotArea: {					
                    dataLabel: {
                        formatString: ["0.00%"]
                    }
                }       
			});
			//oChart.setVizScales([{feed: "valueAxis", max: scaleMax * 1.2 }]);
		}
		
		var oJsonSampleData = new sap.ui.model.json.JSONModel(tempTileInfo);
		oChart.setModel(oJsonSampleData);		
		oChart.attachSelectData(function(oEvt){
			var selectDataArr = oEvt.getParameter("data");
			if(selectDataArr[0]){
				var resultJson = that._get_selection_techvalue(selectDataArr[0]["data"], tileInfo.METADATASET);
				FrameInternalUtil._drilldownEventSubHandle(tileInfo.id, JSON.stringify(resultJson).replaceAll("\"", "\'"));
			}
		});
		return oChart;
	},
	_get_selection_techvalue: function(selectJson, metaData){
		var resultJson = {};
		for(var e in selectJson){
			if(e && e !== "_context_row_number" && e !== "measureNames"){
				var fieldMetaArr = metaData.filter(function(a){if((a.label == e) && (a.role == "dimension")) return true;});
				if(fieldMetaArr.length > 0){
					resultJson["AGS_" + fieldMetaArr[0].techname] = selectJson[e];
				}
			}
		}
		return resultJson;
	},
	_defaultDrillHeight: function(noAssKPIs){
		var height = window.innerHeight - 130;
		if(FrameUtil.drilldownObj.chartSize.height){
			height = FrameUtil.drilldownObj.chartSize.height;
		}else{
			if(noAssKPIs){
				height = height - 100;
			}else{
				height = height - 300;
			}
			if(height < 140){
				height = 140;
			}
		}	
		return height;
	},
	createDrillVizFrame: function(tileInfo, noAssKPIs, specificChartType){
		var tempTileInfo = jQuery.extend(true, {}, tileInfo);
		var oHeader = tempTileInfo.DATASET.splice(0,1)[0];
		var chartType = tileInfo.type;
		if(specificChartType){
			chartType = specificChartType;
		}	
		
		var oDatasetAndFeeds = this.createChartDataSet( oHeader, chartType);
		var chartUI5TechName = this._vizTypeOfAbbreviation(chartType);		
		
		var oChart = new sap.viz.ui5.controls.VizFrame({
			 width: "100%",
			 uiConfig: {
				applicationSet: "fiori"
			 },
			 vizType: chartUI5TechName,			 
			 legendVisible: true,
			 feeds: oDatasetAndFeeds["oFeeds"],
			 dataset: oDatasetAndFeeds["oDataset"],
			 vizProperties: {
				 title: {
					visible: false, 
				 },
				 tooltip: {
	                visible: true
				 },
				 plotArea: {
					 dataLabel: {
                        visible: true
                    },
                    gridline: {
                   	 visible: true
                    },
                    background: {
                    	color: "#ffffff"
                    }
				 }, 
				 valueAxis: {
					 visible: true
                },
                categoryAxis: {
                    title: {
                        visible: true
                    }
                }
			 }
		 });
		
		if(chartType == "CC" && oDatasetAndFeeds["ruleContextMeta"]){
			var vizSemanticRule = this.handleSemanticColorRule(oDatasetAndFeeds["ruleContextMeta"], tempTileInfo.DATASET);
			oChart.setVizProperties({
				plotArea: {dataPointStyle: vizSemanticRule}
			});
		}	
		var defaultHeight = this._defaultDrillHeight(noAssKPIs);
		oChart.setHeight(defaultHeight + "px");
		this.handleVizFrameColorPalate(tileInfo.SEMANTICSET, oChart);
		
		if(this.getIsPercentFormat(tileInfo.DATASET)){
			tempTileInfo.DATASET = this.handlePercentArrray(tempTileInfo.DATASET);
			oChart.setVizProperties({
				plotArea: {					
                    dataLabel: {
                        formatString: ["0.00%"]
                    }
                }       
			});
		}
		var oJsonSampleData = new sap.ui.model.json.JSONModel(tempTileInfo);
		
		oChart.setModel(oJsonSampleData);	
		return oChart;	
	},
	createDrillchartContainer: function(tileInfo, noAssKPIs, specificChartType){
		var oChart;
		if(specificChartType == "TABLE"){
			oChart = TableGenerator.createDrillTable(tileInfo, noAssKPIs);
		}else{
			oChart = this.createDrillVizFrame(tileInfo, noAssKPIs, specificChartType);
		}
		return oChart;
	},
	handleSemanticColorRule: function(ruleContextMeta, dataset){
		var oContextGreen = [], oContextYellow = [], oContextRed = [];
		var ratingField = ruleContextMeta.ratingField;
		var dimentionFields = ruleContextMeta.dimentionFields;
		var semanticRules = {
			"rules": [],
			"others": {
				"properties": {
                    "color": "sapUiChartPaletteSemanticNeutral"
				}
			}
		};
		for(var i = 0; i < dataset.length; i++){
			if(dataset[i][ratingField.field] && dataset[i][ratingField.field] != ""){
				var dataContext = {};
				for(var j = 0; j < dimentionFields.length; j++){
					dataContext[dimentionFields[j]["name"]] = dataset[i][dimentionFields[j]["field"]];
				}
				switch(dataset[i][ratingField.field]){
					case 'Y': oContextYellow.push(dataContext); break;
					case 'G': oContextGreen.push(dataContext); break;
					case 'R': oContextRed.push(dataContext); break;
				}
			}		
		}
		if(oContextYellow.length > 0){
			semanticRules["rules"].push({"dataContext": oContextYellow, "properties": {
				"color":"sapUiChartPaletteSemanticCritical"
			}, "displayName": ratingField["name"] + "_Yellow"});
		}
		if(oContextGreen.length > 0){
			semanticRules["rules"].push({"dataContext": oContextGreen, "properties": {
				"color":"sapUiChartPaletteSemanticGood"
			}, "displayName": ratingField["name"] + "_Green"});
		}
		if(oContextRed.length > 0){
			semanticRules["rules"].push({"dataContext": oContextRed, "properties": {
				"color":"sapUiChartPaletteSemanticBad"
			}, "displayName": ratingField["name"] + "_Red"});
		}
		if(semanticRules["rules"].length == 0){
			return;
		}
		return semanticRules;
	},
	handleColorPalate: function(semanticSet, oChart){
		var colorPalate = oChart.getPlotArea().getColorPalette();
		if(!semanticSet || semanticSet.length < 1){
			var defaultSemanticSet = ["#5cbae6", "#b6d957", "#fac364", "#8cd3ff", "#d998cb", "#f2d249", "#93b9c6", "#ccc5a8", "#52bacc", "#dbdb46", "#98aafb"];
			for(var j = 0; j < defaultSemanticSet.length; j++){
				colorPalate[j] = defaultSemanticSet[j];
			}
		}else{
			for(var i = 0; i < semanticSet.length; i++){
				colorPalate[semanticSet[i].key] = semanticSet[i].value;
			}
		}
		oChart.getPlotArea().setColorPalette(colorPalate);
	},
	handleVizFrameColorPalate: function(semanticSet, oChart){
		var colorPalate = oChart.getVizProperties().plotArea.colorPalette;
		if(!colorPalate){
			colorPalate = ["#5cbae6", "#b6d957", "#fac364", "#8cd3ff", "#d998cb", "#f2d249", "#93b9c6", "#ccc5a8", "#52bacc", "#dbdb46", "#98aafb"];
		}
		if(!semanticSet || semanticSet.length < 1){
			/*var defaultSemanticSet = ["#5cbae6", "#b6d957", "#fac364", "#8cd3ff", "#d998cb", "#f2d249", "#93b9c6", "#ccc5a8", "#52bacc", "#dbdb46", "#98aafb"];
			for(var j = 0; j < defaultSemanticSet.length; j++){
				colorPalate[j] = defaultSemanticSet[j];
			}*/
		}else{
			for(var i = 0; i < semanticSet.length; i++){
				colorPalate[semanticSet[i].key] = semanticSet[i].value;
			}
			oChart.setVizProperties({plotArea: { colorPalette: colorPalate }});
		}		
	},
	handlePercentArrray: function(oDataset){
		for(var i in oDataset){
			for(var e in oDataset[i]){
				if(e && oDataset[i][e] !== ""){
					if(oDataset[i][e].indexOf("%") >= 0){
						oDataset[i][e] = oDataset[i][e].replace("%", "")/100;
					}					
				}
			}
		}
		return oDataset;
	},
	getMaxInArray: function(oDataset){
		var iMax = 0;
		for(var i in oDataset){
			for(var e in oDataset[i]){
				if(e && oDataset[i][e] !== ""){
					if(!isNaN(oDataset[i][e])){
						if(iMax < oDataset[i][e]){
							iMax = oDataset[i][e];
						}
					}
				}
			}
		}
		return iMax;
	},
	handleArrayWithNum: function(dataset){
		if(dataset.length > 0){
			var headerStru = dataset[0];
			for(var a in headerStru){
				var splitAppl = headerStru[a].split("#");
				if(splitAppl.length > 1 && splitAppl[1] == "K"){
					for(var j = 1; j < dataset.length; j++){
						if(dataset[j][a] && !isNaN(dataset[j][a])){
							dataset[j][a] = parseFloat(dataset[j][a]);
						}
						
					}
				}
			}
		}		
	},
	getIsPercentFormat: function(oAllDataset){
		if(oAllDataset.length > 1){
			var oTileField = oAllDataset[0];
			//var oDataField = oAllDataset[1];
			var startKfPos = [];
			for(var e1 in oTileField){
				if(e1 && oTileField[e1] !== ""){
					var oSplitArr = oTileField[e1].split("#");
					if(oSplitArr.length > 1){
						if(oSplitArr[1] == "K"){
							startKfPos.push(e1);
						}
					}
				}
			}
			for(var e2 = 0; e2 < startKfPos.length; e2++){
				for(var i = 1; i < oAllDataset.length; i++ ){
					var oDataField = oAllDataset[i];
					if(oDataField && oDataField[startKfPos[e2]] !== ""){
						if(oDataField[startKfPos[e2]].indexOf("%") < 0){
							return false;
						}else{
							return true;
						}
					}
				}
			}
			return false;
		}
	}
};