/*global $, document, jQuery, sap:true, location, setInterval, setTimeout*/
/*global clearInterval:true*/
jQuery.sap.require("sap.ui.core.util.Export");
jQuery.sap.require("sap.ui.core.util.ExportTypeCSV");
jQuery.sap.require("sap.suite.ui.commons.TileContent");
sap.suite.ui.commons.TileContent.prototype.onAfterRendering=function(){var c=this.getContent();if(c){var t=jQuery(this.getDomRef());if(!t.attr('title')){var C=c.getTooltip_AsString();var T=t.find('*');T.removeAttr('title');var o=C?C:'';t.attr('title',o+'\n'+this._getFooterText());}}};
if(SVGElement && !SVGElement.prototype.getTransformToElement){
	SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(elem) { return elem.getScreenCTM().inverse().multiply(this.getScreenCTM()); };
}

var FrameUtil = {
	authorizationInfo: {addDash: "", editDash: "X", deleteDash: "X"},
	//currentDashAuth:
	currentDshInfo: {},
	defaultDshInfo: {},
	userInfo: { role: "end_user"},
	dshList: [],
	tileList: [],
	categoryList: [],
	tileSettingId: "",
	drilldownId: "",
	api: {},
	drilldownObj: {
		tileList: [],
		chartDrillList: [],
		selectTile: [],
		chartSize: { }
	},
	pageType: "OVERVIEW", 
	supportVizTypeInTile: ['CC', 'CL', 'CSTC', 'CP', 'CB', 'CSTB', 'CCOMB'],
	oTextBundle: "",
	gfValueListModel: new sap.ui.model.json.JSONModel(),
	isGfWithNewChange: false,
	gfFilterListItems: [],
	gfFilterParaStr: "",
	refreshOverviewPage: function(){
		this.isGfWithNewChange = false;
		FrameUtil.pageType = "OVERVIEW";
		var splitContainer = sap.ui.getCore().byId("mainSplitContainer");
		splitContainer.removeContent("idDshMain");
		if(sap.ui.getCore().byId("idDshMain")){
			sap.ui.getCore().byId("idDshMain").destroy();
		}
		var oMainPage = sap.ui.view({id: "idDshMain", viewName: "ags.ssi.dshbuilder.view.overview", type: sap.ui.core.mvc.ViewType.JS});
		splitContainer.addContent(oMainPage);
	},
	refreshDrilldownPage: function(){
		var mainShell = sap.ui.getCore().byId("mainshell");
		mainShell.removeAllContent();
		if(sap.ui.getCore().byId("drilldownPage")){
			sap.ui.getCore().byId("drilldownPage").destroy();
		}
		var oDrilldownPage = sap.ui.view("drilldownPage",{viewName:"ags.ssi.dshbuilder.view.drilldown", type:sap.ui.core.mvc.ViewType.JS, height: "100%"});
		mainShell.addContent(oDrilldownPage);
	},
	backToOverview: function(){
		FrameInternalUtil.gfilterIconVisibility(true);
		var mainShell = sap.ui.getCore().byId("mainshell");
		mainShell.removeAllContent();
		var overallShell = sap.ui.getCore().byId("overallShell");
		if(!overallShell.removeHeadItem(1)){
			overallShell.removeHeadItem(0);
		}
		if($("#frameBICS")[0]){
			$("#frameBICS").remove();
		}
		
		this.pageType = "OVERVIEW";	
		mainShell.removeAllContent();
		if(sap.ui.getCore().byId("drilldownPage")){
			sap.ui.getCore().byId("drilldownPage").destroy();
		}		
		
		var tileBasePage = sap.ui.getCore().byId("tileBasePanel");
		if(FrameUtil.isGfWithNewChange){
			if(tileBasePage){
				tileBasePage.destroy();
			}
			this.refreshOverviewPage();
			return;
		}else{		
			if(tileBasePage){
				var oPage = new sap.m.Page({
					content: [tileBasePage],
					showHeader: false,
					showFooter: false
				});
				mainShell.addContent(oPage);
			}
		}
	},
	createDrilldownView: function(drilldownId){	
		this.drilldownId = drilldownId;
		var mainShell = sap.ui.getCore().byId("mainshell");
		mainShell.removeAllContent();
		var oDrilldownPage = sap.ui.view("drilldownPage",{viewName:"ags.ssi.dshbuilder.view.drilldown", type:sap.ui.core.mvc.ViewType.JS, height: "100%"});
		mainShell.addContent(oDrilldownPage);
		FrameUtil.pageType = "DRILLDOWN";
		
		var backBtn = new sap.ui.unified.ShellHeadItem({
			icon: "sap-icon://nav-back",
			press: function(){
				FrameUtil.backToOverview();
			}
		});
		sap.ui.getCore().byId("overallShell").addHeadItem(backBtn);
	}
};

String.prototype.replaceAll = function (str1, str2){
  var str = this;
  var rule = new RegExp(str1, "gi");
  var result = str.replace(rule, str2);
  //var result = str.replace(eval("/"+str1+"/gi"), str2);
  return result;
};

var replaceTooltipOfMicroChart = function(obj, removeStr){
var str = obj.getTooltip_AsString();
if(removeStr === ""){
obj.setTooltip(" ");
}else{
if(!removeStr){ removeStr = "Error"; }
var str2 = str.replaceAll(removeStr, "");
obj.setTooltip(str2);
}
};

var getAccSectionHeight = function(){
	var cateLength = FrameUtil.categoryList.length;
	var rHeigth = window.innerHeight - 60 - 33 * cateLength;
	if(rHeigth < 200){
		rHeigth = 200;
	}
	return rHeigth;
};

//FrameUtil.dataLoadingStart();
window.onresize = function(){
	var setHeightOfObj = function(height){
		height = height - 55;
		if(height < 140){
			height = 140;
		}
		FrameUtil.drilldownObj.chartSize.height = height;
		return height;
	};
	var oChartJQuery = $("#drillChartContainer .sapVizFrame");
	var oChartUI5 = sap.ui.getCore().byId(oChartJQuery.attr("id"));
	if(oChartUI5){
		var height = window.innerHeight - oChartJQuery.offset().top;
		oChartUI5.setHeight( setHeightOfObj(height) + "px" );
	}else{
		var oTableJQuery = $("#drillVizFrameContainer .sapUiTable");
		if(oTableJQuery.length > 0){
			var iCount = parseInt((window.innerHeight - oTableJQuery.offset().top) / 28);
			var oTable = sap.ui.getCore().byId(oTableJQuery.attr("id"));
			oTable.setVisibleRowCount(iCount - 2);
		}
	}
	
	var oAcc = sap.ui.getCore().byId("accordionA");	
	if(oAcc){
		var sectionLen = getAccSectionHeight() + "px";
		var oSections = oAcc.getSections();
		for(var i = 0; i < oSections.length; i++){
			oSections[i].setMaxHeight(sectionLen);
		}
	}
	var accDsh = sap.ui.getCore().byId("idAccordionDsh");
	if(accDsh){
		accDsh.oController.selectDshUI(FrameUtil.currentDshInfo, true);
	}
};
var triggerResize = function(){
$(window).trigger("resize");
};