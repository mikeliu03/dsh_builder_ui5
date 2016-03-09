	var GlobalFilterUtil = {
		globalFilterIconClick: function(specialDelete){
			var oFilterArr = FrameUtil.gfFilterListItems;
			var oContainer = sap.ui.getCore().byId("filterListContainer");
			if((oContainer && oContainer.getContent().length > 0) || specialDelete )
			{
				oContainer.destroyContent();
				$("#idDshMain").css("top", "0px");
			}else{
				this.openGlobalFilter(oFilterArr);
			}
		},
		refreshGfList: function(oFilterList)
		{
			var oListModel = new sap.ui.model.json.JSONModel();
			oListModel.setProperty("/itemList", this.handleGlobalFilterValues(oFilterList));
			var oContainer = sap.ui.getCore().byId("filterListContainer");
			oContainer.setModel(oListModel);	
		},
		openGlobalFilter: function(oFilterArr){
			var that = this;
			var oContainer = sap.ui.getCore().byId("filterListContainer");
			if(oContainer.getContent().length > 0)
			{					
				oContainer.destroyContent();				
			}else{		
				var oList = new sap.m.List({
					items: {
						path: "/itemList",
						template: new dev.view.control.FilterListItem({
							title: "{filter_desc}",
							dimentionId: "{filter_field}",
							operator: "{operator}",
							values: "{values}",
							reset: function(oEvent){
								oEvent.oSource.setValues([]);
								oEvent.oSource.setOperator("NF");
								oEvent.oSource.setShowResetButton(false);
								that.applyGfitems([{filter_field: oEvent.oSource.getDimentionId(), operator: "NF"}]);
								//FrameUtil.api.fireEvent("reset_gfitem", oEvent.oSource.getDimentionId());
							},
							press: function(oEvent){
								that.handleGfItemPress(oEvent);
							}
						})
					}						
						
				});					
				
				
				var oListModel = new sap.ui.model.json.JSONModel();
				oListModel.setProperty("/itemList", this.handleGlobalFilterValues(oFilterArr));
				oContainer.setModel(oListModel);	
				oContainer.addContent(oList);	
				setTimeout(function(){
					$("#idDshMain").css("top", $("#filterListContainer").height());
				}, 100);		
			}		
		},
		applyGfitems: function(oParaArr){
			FrameUtil.isGfWithNewChange = true;
			if(oParaArr.length > 0){
				var flagTmp = true;
				var gfListNew = [];
				var oriGfFiledsArr = FrameUtil.gfFilterListItems.filter(function(a){return a.filter_field === oParaArr[0].filter_field;});
				if(oriGfFiledsArr && oriGfFiledsArr.length > 0){
					var oriTemplateGfField = oriGfFiledsArr[0];
					for(var i = 0; i < FrameUtil.gfFilterListItems.length; i++){
						if(FrameUtil.gfFilterListItems[i].filter_field == oriTemplateGfField.filter_field){
							if(flagTmp){
								for(var j = 0; j < oParaArr.length; j++){
									var oTmpGfItem = jQuery.extend(true, {}, oriTemplateGfField);
									oTmpGfItem["low"] = oParaArr[j]["low"];
									oTmpGfItem["low_text"] = oParaArr[j]["low_text"];
									oTmpGfItem["high"] = oParaArr[j]["high"];
									oTmpGfItem["high_text"] = oParaArr[j]["high_text"];
									oTmpGfItem["operator"] = oParaArr[j]["operator"];
									gfListNew.push(oTmpGfItem);
								}							
								flagTmp = false;
							}										
						}else{
							gfListNew.push(FrameUtil.gfFilterListItems[i]);
						}
					}
					FrameUtil.gfFilterListItems = gfListNew;
				}
			}
			
			var gfParaArrTmp = [];
			for(var k = 0; k < FrameUtil.gfFilterListItems.length; k++){
				var itemTmp = FrameUtil.gfFilterListItems[k];
				var pushItemTmp = {"filter_field": itemTmp["filter_field"], "operator": itemTmp["operator"], "low": itemTmp["low"]};
				if(itemTmp["high"]){
					pushItemTmp["high"] = itemTmp["high"];
				}
				gfParaArrTmp.push(pushItemTmp);
			}
			
			FrameUtil.gfFilterParaStr = JSON.stringify(gfParaArrTmp);
			if(FrameUtil.pageType === "OVERVIEW"){
				FrameUtil.refreshOverviewPage();
			}else{
				FrameUtil.refreshDrilldownPage();
			}
			this.refreshGfList(FrameUtil.gfFilterListItems);
		},
		styleForDialog: function(operatorKey){
			if(operatorKey == "BT"){
				sap.ui.getCore().byId("FilterDimentionDialog").addStyleClass("btDialogStyle");
			}else{
				sap.ui.getCore().byId("FilterDimentionDialog").removeStyleClass("btDialogStyle");
			}
		},
		handleGfItemPress: function(oEvent){
			var that = this;
			if(sap.ui.getCore().byId("FilterDimentionDialog")){
				sap.ui.getCore().byId("FilterDimentionDialog").destroy();
			}
			var dimentionId = oEvent.oSource.getDimentionId();
			var operatorKey = oEvent.oSource.getOperator();
			var objBindContext = oEvent.oSource.getBindingContext().getObject();
			var availOperators = objBindContext.avail_operator;
			var oLabelDimention = new sap.m.Label({text: FrameUtil.oTextBundle.getText("DIMENTYPE_TXT")}).addStyleClass("columnLeft");
			var oValueDimention = new sap.m.Label({text: oEvent.oSource.getTitle()}).addStyleClass("columnLeft");
			var oPanelDimention = new sap.m.Panel({content: [oLabelDimention, oValueDimention]});
			
			var oLabelOperator = new sap.m.Label({text: FrameUtil.oTextBundle.getText("FILTEROPR_TXT")}).addStyleClass("columnLeft");
			var oValueOperator = new sap.m.Select("FilterOperatorSelect",{ 
				items: [
					new sap.ui.core.Item({key: "NF", text: FrameUtil.oTextBundle.getText("NOFILTER_TXT")}),
					/*new sap.ui.core.Item({key: "EQ", text: "Equals"}),
					new sap.ui.core.Item({key: "NE", text: "Not equals"}),
					new sap.ui.core.Item({key: "BT", text: "Between"})
					new sap.ui.core.Item({key: "GT", text: "Greater Than"}),
					new sap.ui.core.Item({key: "GE", text: "Greater or Equal"}),
					new sap.ui.core.Item({key: "LT", text: "Less Than"}),
					new sap.ui.core.Item({key: "LE", text: "Less or Equal"})	*/				 
				],
				selectedKey: operatorKey,
				change: function(oSelectEvent){
					that.styleForDialog(oSelectEvent.oSource.getSelectedKey());
				}
			}).addStyleClass("columnLeft");	
			
			var operatorArr = availOperators.trim().split(";");
			if( !availOperators || availOperators == ""){
				operatorArr = ["OE","EQ","NE","BT"];
			}
			operatorArr.sort(function(a,b){				
				var getWeight = function(ele){
					var weightResult = 0;
					switch(ele){
					case "OE": weightResult = 1; break; 
					case "EQ": weightResult = 2; break;
					case "NE": weightResult = 3; break;
					case "BT": weightResult = 4; break;
					}
					return weightResult;
				};
				if( getWeight(a) > getWeight(b) ){
					return true;
				}else{
					return false;
				}
			});
			for(var j = 0; j< operatorArr.length; j++){
				switch(operatorArr[j]){
				case 'OE': oValueOperator.addItem(new sap.ui.core.Item({key: "OE", text: FrameUtil.oTextBundle.getText("ISONLY_TXT")})); break;
				case 'EQ': oValueOperator.addItem(new sap.ui.core.Item({key: "EQ", text: FrameUtil.oTextBundle.getText("IS_TXT")})); break;
				case 'NE': oValueOperator.addItem(new sap.ui.core.Item({key: "NE", text: FrameUtil.oTextBundle.getText("ISNOT_TXT")})); break;
				case 'BT': oValueOperator.addItem(new sap.ui.core.Item({key: "BT", text: FrameUtil.oTextBundle.getText("ISBTW_TXT")})); break;				
				}
			}
			
			if((operatorKey == "NF" || operatorKey == "") && operatorArr.length > 0){
				operatorKey = operatorArr[0];
				oValueOperator.setSelectedKey(operatorKey);
			}
			
			var oPanelOperator = new sap.m.Panel({content: [oLabelOperator, oValueOperator]});
			var oSearchField = new sap.m.SearchField({
				width: "100%",
				search: function(oSearchEvent){
					var oPara = dimentionId + "~" + oSearchEvent.oSource.getValue();
					var searchHelpUrl = _hostUrl + "/sap/opu/odata/SAP/AGS_DSH_CHAR_SEARCH_HELP_SRV?search=ds_id___'" 
						+ dsh_id + "'&srch_condition___'" + oPara + "'";
					var oSearchHelpModel = new sap.ui.model.odata.ODataModel(searchHelpUrl);
					oSearchHelpModel.read("valuesetSet", {
						success: function(results){
							FrameUtil.gfValueListModel.setProperty("/selectoptions",results.results);
						}
					});
				}
			});
			
			var oSelectOptionList = new sap.m.List({
				items: {
					template: new sap.m.StandardListItem({title: "{value}", type: "Active",
						press: function(oPressEvent){
							var obj = oPressEvent.oSource.getBindingContext().getObject();
							var arrList = FrameUtil.gfValueListModel.getProperty("/selectedlist");
							if(arrList){
								if( arrList.filter(function(a){return a.key === obj.key;}).length === 0 ){
								arrList.push(obj);
								FrameUtil.gfValueListModel.setProperty("/selectedlist", arrList);										
								}
							}else{
								FrameUtil.gfValueListModel.setProperty("/selectedlist", [obj]);
							}
						}
					}),
					path: "/selectoptions"
				}
			}).addStyleClass("OptionsForAdd");
			
			var oSelectedList = new sap.m.List("gfSelectedList",{
				items: {
					template: new sap.m.StandardListItem({title: "{value}", type: "Active",
						press: function(oPressEvent){
							var obj = oPressEvent.oSource.getBindingContext().getObject();
							var arrList = FrameUtil.gfValueListModel.getProperty("/selectedlist");
							for(var dx in arrList){
								if(arrList[dx] == obj){
									arrList.splice(dx, 1);
									break;
								}
							}
							FrameUtil.gfValueListModel.setProperty("/selectedlist", arrList);
						}
					}),
					path: "/selectedlist"							
				}
			}).addStyleClass("OptionsForRemove");
			var oHorizLayout = new sap.ui.layout.HorizontalLayout({
				content: [oSelectOptionList, oSelectedList]
			}).addStyleClass("ValueHelpSelectList");
			var oPanelList = new sap.m.Panel({
				content: [oSearchField, oHorizLayout]
			});
			var oDialog = new sap.m.Dialog("FilterDimentionDialog",{
				title: FrameUtil.oTextBundle.getText("DIMFILTERDIALOG_HEAD"),
				contentWidth: "700px",
				content: [oPanelDimention, oPanelOperator, oPanelList],
				buttons: [ new sap.m.Button({text: FrameUtil.oTextBundle.getText("APPLY_TXT"), 
					press: function(oEvent){
						that.validateFilter(oEvent);
					}}),
					new sap.m.Button({text: FrameUtil.oTextBundle.getText("CANCEL_TXT"), press: function(){ oDialog.destroy(); } })
				]
			}).data("dimention-id", dimentionId).addStyleClass("GlobalFilterDialog");
			
			var selectedValues = oEvent.oSource.getValues();
			FrameUtil.gfValueListModel.setProperty("/selectoptions", null);
			FrameUtil.gfValueListModel.setProperty("/selectedlist", selectedValues);
			oDialog.setModel(FrameUtil.gfValueListModel);
			oDialog.setModel(FrameUtil.gfValueListModel);
			oDialog.open();
			that.styleForDialog(operatorKey);
			setTimeout(function(){oSearchField.fireSearch();}, 100);
		},
		validateFilter: function(oEvent){
			var oprator = sap.ui.getCore().byId("FilterOperatorSelect").getSelectedKey();
			var selectedList = FrameUtil.gfValueListModel.getProperty("/selectedlist");
			var count = selectedList.length;
			var result = false;
			var oDialog = sap.ui.getCore().byId("FilterDimentionDialog");
			var dimentionId = oDialog.data("dimention-id");
			var filterArr = [];
			switch(oprator){
				case 'OE': if(count == 1){
					result = true;
					filterArr.push({filter_field: dimentionId, operator: "OE", low: selectedList[0].key, low_text: selectedList[0].value});
				}
				break;
				case 'NF': if(count == 0){
					result = true;
					filterArr.push({filter_field: dimentionId, operator: "NF"});
				}
				break;
				case 'BT': if(count == 2){
					result = true;
					filterArr.push({filter_field: dimentionId, operator: "BT", low: selectedList[0].key, low_text: selectedList[0].value, high: selectedList[1].key, high_text: selectedList[1].value});
				}
				break;
				case 'EQ':
				case 'NE': if(count > 0){
					result = true;
					for(var e in selectedList){
						filterArr.push({filter_field: dimentionId, operator: oprator, low: selectedList[e].key, low_text: selectedList[e].value});
					}
				}
				break;
				default: if(count == 1){
					result = true;
					filterArr.push({filter_field: dimentionId, operator: oprator, low: selectedList[0].key, low_text: selectedList[0].value});
				}
			}
			if(!result){
				var oSelectedList = sap.ui.getCore().byId("gfSelectedList");
				oSelectedList.addStyleClass("validationFailed");
				setTimeout(function(){
					oSelectedList.removeStyleClass("validationFailed");
				},3000);
			}else{
				this.applyGfitems(filterArr);
				oDialog.destroy(); 
			}
		},
		handleGlobalFilterValues: function(oFilterArr){
			var HashIndex = {};
			var oFilterArrAfterTrans = [];
			for(var e in oFilterArr){
				if(oFilterArr[e].operator === "EQ" || oFilterArr[e].operator === "NE" || oFilterArr[e].operator === "OE"){
					if(HashIndex[oFilterArr[e].filter_field]){
						HashIndex[oFilterArr[e].filter_field].values.push({key: oFilterArr[e].low, value: oFilterArr[e].low_text});
					}else{
						HashIndex[oFilterArr[e].filter_field] = oFilterArr[e];
						HashIndex[oFilterArr[e].filter_field].values = [{key: oFilterArr[e].low, value: oFilterArr[e].low_text}];
					}
				}else{
					HashIndex[oFilterArr[e].filter_field] = oFilterArr[e];
					HashIndex[oFilterArr[e].filter_field].values = [];
					if(oFilterArr[e].low){
						HashIndex[oFilterArr[e].filter_field].values.push({key: oFilterArr[e].low, value: oFilterArr[e].low_text});
					}
					if(oFilterArr[e].high){
						HashIndex[oFilterArr[e].filter_field].values.push({key: oFilterArr[e].high, value: oFilterArr[e].high_text});
					}
				}
			}
			for(var i in HashIndex){
				oFilterArrAfterTrans.push(HashIndex[i]);
			}
			return oFilterArrAfterTrans;
		}
	};