frappe.provide('erpnext.PointOfSale');

frappe.pages['point-of-sale'].on_page_load = function(wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Point of Sale'),
		single_column: true
	});

	frappe.require('assets/js/point-of-sale.min.js', function() {
		wrapper.pos = new erpnext.PointOfSale.Controller(wrapper);
		window.cur_pos = wrapper.pos;
		
		window.is_item_details_open = false;		
		window.checkPort = async function(fromWorker){
			if("serial" in navigator){
				var ports = await navigator.serial.getPorts();
				if(ports.length == 0 || fromWorker){
					frappe.confirm(
						'Please provide permission to connect to the weigh device',
						async function(){
							ports = await navigator.serial.requestPort();
							//Call connect again if the worker is already initialized
							if(typeof(window.mettlerWorker) != "undefined"){
								window.mettlerWorker.postMessage({"command": "connect"});
							}
						},
						function(){
							
						}
					);
				}
			}
			else{
				frappe.msgprint("Your browser does not support serial device connection. Please switch to a supported browser to connect to your weigh device");
			}
		}
	});
};

frappe.pages['point-of-sale'].refresh = function(wrapper) {
	if (document.scannerDetectionData) {
		onScan.detachFrom(document);
		wrapper.pos.wrapper.html("");
		wrapper.pos.check_opening_entry();
	}
	
	window.onbeforeunload = function(){
		console.log("Here");
		if(window.enable_weigh_scale == 1){
			window.mettlerWorker.terminate();
			window.mettlerWorker = "undefined";
		}
		//if(window.serialPort.isOpen()){
		  /*window.serialPort.closePort(
			function(response){
			  console.log(response);
			  if(response.result === "ok"){
				return null;
			  }
			  else{
				return false;
			  }
			}
		  );*/
		//}
		return null;
	}
};
