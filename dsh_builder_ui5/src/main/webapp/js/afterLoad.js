function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r != null) 
    	return unescape(r[2]); 
    return null; 
}
var dsh_id = getUrlParam("DSH_ID");

//var _hostUrl = "";
var _hostUrl = "https://ldcifl7.mo.sap.corp:44304";
//var oTextBundle = jQuery.sap.resources({ url : "/sap/bc/ui5_ui5/sap/dsh_builder_res/i18n/i18n.properties", locale: sap.ui.getCore().getConfiguration().getLanguage() });
var oTextBundle = jQuery.sap.resources({ url : _hostUrl + "/sap/bc/ui5_ui5/sap/dsh_builder_res/i18n/i18n.properties", locale: sap.ui.getCore().getConfiguration().getLanguage() });		

FrameUtil.oTextBundle = oTextBundle;
var _tilesSetUrl = _hostUrl + "/sap/opu/odata/SAP/AGS_DSH_META_DATA_SRV?search=use_generic_stru___true&ds_id___";
_tilesSetUrl = _tilesSetUrl + "'" + dsh_id + "'";
var oDshMetadataModel = new sap.ui.model.odata.ODataModel(_tilesSetUrl);

var _bpaUnitListUrl = _hostUrl + "/sap/opu/odata/sap/AGS_DSH_CURRENCY_VP_SRV";
var oBpaUnitModel = new sap.ui.model.odata.ODataModel(_bpaUnitListUrl);