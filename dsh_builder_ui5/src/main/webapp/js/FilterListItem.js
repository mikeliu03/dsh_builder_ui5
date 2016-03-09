// custom filter-list-item control:
/*global jQuery, sap, FrameUtil:true*/

jQuery.sap.declare('dev.view.control.FilterListItem');
sap.m.ListItemBase.extend('dev.view.control.FilterListItem', {

  metadata: {
    properties: {
      "title": {type: "string", defaultValue: ""},
      "values": {type: 'object[]', defaultValue: null},
      "operator": {type: 'string', defaultValue: ""},
      "showResetButton": {type: 'boolean', defaultValue: true},
	  "type": {type: 'string', defaultValue: 'Active'},
	  "dimentionId": {type: 'string', defaultValue: ''}
    },
    events: {
      'reset': {}
    }
  },

  init: function() {
  },

  renderer: {
   renderLIContent: function(oRm, oControl) {
      oRm.write('<div');
      oRm.writeControlData(oControl);
      oRm.write('>');
      oRm.write('<span class="sapMSLITitle">');
      oRm.write(oControl.getTitle());
      oRm.write('</span>');
      oRm.write('<span class="sapMSLIDescription">');
      oRm.write(oControl._getFilterText());
      oRm.write('</span>');
	  if(!oControl.getOperator() || oControl.getOperator() === "NF"){
			oControl.setShowResetButton(false);
	  }else{
		  oControl.setShowResetButton(true);
	  }
      if (oControl.getShowResetButton() === true) {
        oRm.write('<div class="resetButton sapUiIcon" data-sap-ui-icon-content="\ue1e0"></div>');
      }

      oRm.write('</div>');
    }
  },

  onAfterRendering: function() {
    this.$().find('.resetButton').on('tap', function(evt) {
        evt.stopPropagation();
        this.fireReset();
      }.bind(this));
  },

  _getFilterText: function() {
    var values = this.getValues();

    var operator = this.getOperator();
	var filterText = "";
	
	if(values.length  === 0){
		return "";
	}
	switch(operator){
		case "OE":
			filterText = " = " + values[0].value;
			break;
		case "EQ": 
			if(values.length > 1){
				filterText = " " + FrameUtil.oTextBundle.getText("IN_TXT") + " ( ";
				for(var i in values){
					if( i == 0 ){
						filterText += values[0].value;
					}else{
						filterText = filterText + ", " + values[i].value;
					}				
				}
				filterText += " )";
			}else{
				filterText = " = " + values[0].value;
			}
			break;
		case "NE":
			if(values.length > 1){
				filterText = " " + FrameUtil.oTextBundle.getText("NOTIN_TXT") + " ( ";
				for(var i2 in values){
					if( i2 == 0 ){
						filterText += values[0].value;
					}else{
						filterText = filterText + ", " + values[i2].value;
					}				
				}
				filterText += " )";
			}else{
				filterText = " != " + values[0].value;
			}
			break;
		case "BT":
			filterText = " " + FrameUtil.oTextBundle.getText("BETWEEN_TXT") + " ( " + values[0].value + ", " + values[1].value + ")";
			break;
		case "GT":
			filterText = " > " + values[0].value;
			break;
		case "LT":
			filterText = " < " + values[0].value;
			break;
		case "GE":
			filterText = " >= " + values[0].value;
			break;
		case "LE":
			filterText = " <= " + values[0].value;
			break;
	}
    return filterText;
  }


});