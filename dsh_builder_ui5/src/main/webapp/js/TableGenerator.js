var TableGenerator = {
	tableFieldFormat: function(color){
		var valueState =  sap.ui.commons.TextViewColor.Default;
		switch(color){
		case 'G': valueState = sap.ui.commons.TextViewColor.Positive; break;
		case 'Y': valueState = sap.ui.commons.TextViewColor.Critical; break;
		case 'R': valueState = sap.ui.commons.TextViewColor.Negative; break;
		}		
		/*var valueState =  sap.ui.core.ValueState.None;
		switch(color){
		case 'G': valueState = sap.ui.core.ValueState.Success; break;
		case 'Y': valueState = sap.ui.core.ValueState.Warning; break;
		case 'R': valueState = sap.ui.core.ValueState.Error; break;
		}		*/
		return valueState;
	},
	_createRatingTable: function(tileInfo){
		var oTable = new sap.ui.table.Table({
			
		});
		var tempTileInfo = jQuery.extend(true, {}, tileInfo);
		
		ChartVisualization.handleArrayWithNum(tempTileInfo.DATASET);
		
		var oHeader = tempTileInfo.DATASET.splice(0,1)[0];
		var oJsonSampleData = new sap.ui.model.json.JSONModel(tempTileInfo);
		var iHeaderCount = 0;
		var characInKfIndex = [];
		if(tileInfo.APPL && tileInfo.APPL.length){
			for(var a = 0; a < tileInfo.APPL.length; a++){
				var splitAppl = tileInfo.APPL[a].field_name.split("#");
				if(splitAppl.length > 1 && splitAppl[1] == "K"){
					characInKfIndex.push(tileInfo.APPL[a].field_index);
				}
			}
		}		
		for(var e in oHeader){
			if(e && oHeader[e] !== ""){				
				var splitArr = oHeader[e].split("#");
				if(splitArr.length  == 2 && splitArr[1] != "N" && splitArr[1] != "KR" && splitArr[1] != "KRL"){
					var otabColumn = new sap.ui.table.Column({
						label: new sap.ui.commons.Label({text: splitArr[0]}),
						//template: new sap.ui.commons.TextView().bindProperty("text", e),
						sortProperty: e
					});					
					var oTemplateControl;
					if(characInKfIndex.indexOf(iHeaderCount) >= 0){
						oTemplateControl = new sap.ui.commons.Link().bindProperty("text", e).data("filedindex", iHeaderCount);						
					}else{
						var ratFieldName = splitArr[0] + "_RAT#KR";
						var semanticPath = null;
						for(var b in oHeader){
							if(oHeader[b] == ratFieldName){
								semanticPath = b;
								break;
							}
						}
						if(semanticPath){
							oTemplateControl = new dev.view.control.ratingField().bindProperty("text", e).bindProperty("rating", semanticPath);
						}else{
							oTemplateControl = new sap.ui.commons.TextView().bindProperty("text", e);
						}
					}			
					otabColumn.setTemplate( oTemplateControl );
					
					if((splitArr.length !== 1) && (splitArr[1] == "C") ){
						otabColumn.setFilterProperty(e);
					}
					oTable.addColumn(otabColumn);					
				}
				iHeaderCount++;
			}
		}		
		if(tileInfo.appl_target_url && tileInfo.appl_target_url != "" ){
			oTable.attachCellClick( function(oEvent){ 
				var paras = [];
				var paraStr, paraVariable;
				var jumpApplUrl = "";				
				var iCellFieldIndex = oEvent.mParameters.cellControl.data("filedindex");
				if(iCellFieldIndex){
					var linkAppls = tileInfo.APPL.filter(function(x, y){
						if(x.field_index == iCellFieldIndex){
							return true;
						}
					});
					if(linkAppls.length > 0){
						paraVariable = linkAppls[0].field_name.split("#")[0];
						paraStr = linkAppls[0]["paramter"] + "=" + paraVariable;
						paras.push(paraStr);
					}
				}
				var context = oEvent.mParameters.cellControl.getBindingContext().getObject();
				for(var i in tileInfo.APPL){
					var splitArrAppl = tileInfo.APPL[i].field_name.split("#");					
					if(splitArrAppl.length == 2 && splitArrAppl[1] != "K"){
						paraVariable = context["FIELD" + (parseInt(tileInfo.APPL[i].field_index) + 1)];
						paraStr = tileInfo.APPL[i]["paramter"] + "=" + paraVariable;
						paras.push(paraStr);
					}					
				}
				if(tileInfo.target_url_type == "SPECIFIC"){
					jumpApplUrl = context["FIELD" + (parseInt(tileInfo.appl_target_url) + 1)];					
				}else{
					jumpApplUrl = tileInfo.appl_target_url;
				}
				
				if(jumpApplUrl.indexOf("?") == -1){
					jumpApplUrl = jumpApplUrl + "?";
				}				
				for(var j in paras){
					if(j == 0){
						jumpApplUrl = jumpApplUrl + paras[j];
					}else{
						jumpApplUrl = jumpApplUrl + "&" + paras[j];
					}
				}
				window.open(jumpApplUrl);
			});
		}		
		
		oTable.setModel(oJsonSampleData);
		oTable.bindRows("/DATASET");
		return oTable;
	},
	_get_selection_techvalue: function(selectJson, metaData){
		var resultJson = {};
		for(var e in selectJson){
			if(e){
				var fieldMetaArr = metaData.filter(function(a){if((a.name == e) && (a.role == "dimension")) return true;});
				if(fieldMetaArr.length > 0){
					resultJson["AGS_" + fieldMetaArr[0].techname] = selectJson[e];
				}
			}
		}
		return resultJson;
	},
	createTableEmbedTile: function(tileInfo){
		var that = this;
		var oTable = this._createRatingTable(tileInfo);
		var visibleColumn = 10;
		switch(tileInfo.layout){
		case 'XL': 
			visibleColumn = 7;
			break;
		case 'XXL': 
			visibleColumn = 14;
			break;
		}
		oTable.setVisibleRowCount(visibleColumn);
		
		oTable.attachCellClick( function(oEvent){ 			
			var context = oEvent.mParameters.cellControl.getBindingContext().getObject();
			var selectJson = that._get_selection_techvalue(context, tileInfo.METADATASET);
			FrameInternalUtil._drilldownEventSubHandle(tileInfo.id, JSON.stringify(selectJson).replaceAll("\"", "\'"));
			console.log(selectJson);
		});
		
		return oTable;
	},
	createDrillTable: function(tileInfo, noAssKPIs){
		var oTable = this._createRatingTable(tileInfo);
		if(noAssKPIs){
			oTable.addStyleClass("noAssKPIDrillChart");
		}else{
			oTable.addStyleClass("normalDrillChart");
		}
		if(FrameUtil.drilldownObj.chartSize.height){
			var iCount = parseInt(FrameUtil.drilldownObj.chartSize.height / 38);
			oTable.setVisibleRowCount(iCount);
		}
		return oTable;
	}
};

jQuery.sap.declare('dev.view.control.ratingField');
//sap.ui.commons.TextView
sap.ui.core.Control.extend("dev.view.control.ratingField", {      
    metadata : {                              
        properties : {
        	"text": "string",
            "rating": "string"
        }
    },
    renderer : {
    	render: function(oRm, oControl) {   
    		oRm.write("<span");
            oRm.writeControlData(oControl);  // writes the Control ID and enables event handling - important!
            oRm.write('class="sapUiTv sapUiTvAlignLeft">');
            if(oControl.getRating() != undefined && oControl.getRating() != ""){
            	//oRm.write('<span class="sapUiIcon" data-sap-ui-icon-content="\ue1ad" style="font-family: SAP-icons; color:');
            	oRm.write('<image style="vertical-align: middle; padding-right: 2px;" src="/sap/public/bc/icons/');
            	switch(oControl.getRating()){
            	/*case 'R': oRm.write("red"); break;
            	case 'Y': oRm.write("yellow"); break;
            	case 'G': oRm.write("green"); break;*/
            	case 'R': oRm.write("s_S_LEDR.gif"); break;
            	case 'Y': oRm.write("s_S_LEDY.gif"); break;
            	case 'G': oRm.write("s_S_LEDG.gif"); break;
            	} 
            	oRm.write('"/>');
            	//oRm.write('"></span>')
            }  
            if(oControl.getText() != undefined){
            	oRm.writeEscaped(oControl.getText()); 
            }        
            oRm.write("</span>");
        }
    }        
});