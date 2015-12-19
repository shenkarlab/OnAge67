var savings,
    rate,
    year_mng,
    salary,
    future_salary,
    pens_rate,
    salary_rate,
    month_mng,
    years,
    withdraw;

var initParams = function(scales) {
	savings = scales[9]["default"]; // user savings until now
	rate = scales[5]["default"]; // year rate
	year_mng = scales[8]["default"]; //$('#range7').val();
	salary = getUserProperty("salary"); 
	pens_rate = Number(scales[3]["values"][0])+Number(scales[4]["values"][1]); // percentage from salary to pension
	console.log("pens_rate: "+pens_rate);
	month_mng = scales[7]["default"]; //$('#range5').val();
	years = scales[1]["default"]; //$('#range8').val();
	future_salary = scales[2]["default"];
	withdraw = scales[6]["default"]; //$('#range4').val();
	salary_rate = getAnnualRate(salary, future_salary, years); // salary growth
	savings = getInitSavings();
};

var getParams = function() {
	console.log(values);
	savings = values[9]; // user savings until now
	rate = values[5]; // year rate
	year_mng = values[8]; //$('#range7').val();
	salary = values[0]; //$('#range0').val();
	pens_rate = Number(values[3])+Number(values[4]); // percentage from salary to pension
	console.log(values[3]);
	console.log(values[4]);
	console.log("pens_rate: "+pens_rate);
	month_mng = values[7]; //$('#range5').val();
	years = values[1]; //$('#range8').val();
	future_salary = values[2];
	withdraw = values[6]; //$('#range4').val();
	salary_rate = getAnnualRate(salary, future_salary, years); // salary growth
};

var getAnnualRate = function(init_sal, final_sal, years) {
	if(years == 1) {
		return 0;
	}
	console.log("init: "+init_sal);
	console.log("final: "+final_sal);
	var result = init_sal/final_sal;
	console.log("division: "+result);
	console.log("years pow: "+(1/(years-1)));
	result = Math.pow(result, (1/(years-1)));
	console.log("pow result: "+result);
	result  = result - 1;
	result = -result;
	console.log("rate: "+result);
	return result;
};

var getInitSavings = function() {
	var total_with_mng = Number(0),
	    tmp = 0,
	    val_1 = 0,
	    val_2 = 0,
	    tmp2 = 0;
	var pre_years = getUserProperty("pre_years");
	console.log("pre years: "+pre_years);
	for (i = 1; i <= pre_years * 12; i++) {
		if (i%12 == 0) {
			console.log("year "+ (i/12));
			//salary = Number(salary)+Number(salary*salary_rate);
			console.log(salary);
		}
		var month_val = salary * pens_rate / 100;
		var mng_sum = Math.round(month_val * month_mng / 100);
		tmp = (1 + (rate / 100)).toFixed(9);
		var acc_savings = (savings * (Math.pow(tmp, pre_years).toFixed(8))).toFixed(0);
		tmp2 = (1 + ((rate / 100) - (year_mng / 100))).toFixed(9);
		var acc_savings_neto = (savings * (Math.pow(tmp2, pre_years).toFixed(8))).toFixed(0);
		
		tmp = (1 + ((rate / 100) / 12)).toFixed(9);
		tmp2 = (Math.pow(tmp, (pre_years * 12) - i));
		val_1 = (month_val * tmp2).toFixed(1);
		total = Number(total + Number(val_1));
		tmp = (1 + (((rate / 100) - (year_mng / 100)) / 12)).toFixed(9);
		tmp2 = Math.pow(tmp, ((pre_years * 12) - i));
		val_1 = ((month_val - mng_sum) * tmp2).toFixed(1);
		total_with_mng = Number(total_with_mng + Number(val_1));
	}

	total = total.toFixed(0);
	total_with_mng = total_with_mng.toFixed(0);
	return total_with_mng;
};

var total = Number(0);

function calculate() {
	var total_with_mng = Number(0),
	    tmp = 0,
	    val_1 = 0,
	    val_2 = 0,
	    tmp2 = 0;
	
	if(years == 0) {
		var acc_savings = savings;
		var acc_savings_neto = acc_savings;
		var total= 0;
		var total_with_mng = 0;
	} else {	// if withdraws performed -  minus 1% from annual rate
		rate = rate - withdraw;
	}
	
	for (i = 1; i <= years * 12; i++) {
		if (i%12 == 0) {
			//console.log("year "+ (i/12));
			salary = Number(salary)+Number(salary*salary_rate);
			//console.log(salary);
		}
		var month_val = salary * pens_rate / 100;
		var mng_sum = Math.round(month_val * month_mng / 100);
		tmp = (1 + (rate / 100)).toFixed(9);
		var acc_savings = (savings * (Math.pow(tmp, years).toFixed(8))).toFixed(0);
		tmp2 = (1 + ((rate / 100) - (year_mng / 100))).toFixed(9);
		var acc_savings_neto = (savings * (Math.pow(tmp2, years).toFixed(8))).toFixed(0);
		
		tmp = (1 + ((rate / 100) / 12)).toFixed(9);
		tmp2 = (Math.pow(tmp, (years * 12) - i));
		val_1 = (month_val * tmp2).toFixed(1);
		total = Number(total + Number(val_1));
		tmp = (1 + (((rate / 100) - (year_mng / 100)) / 12)).toFixed(9);
		tmp2 = Math.pow(tmp, ((years * 12) - i));
		val_1 = ((month_val - mng_sum) * tmp2).toFixed(1);
		total_with_mng = Number(total_with_mng + Number(val_1));
	}

	total = total.toFixed(0);
	total_with_mng = total_with_mng.toFixed(0);
	console.log("total: " + total_with_mng);
	console.log("acc_savings: " + acc_savings_neto);
	var all = Number(Number(total_with_mng) + Number(acc_savings_neto));
	console.log("all: " + all);
	var gender = localStorage.getItem("gender");
	if(gender == Gender.MALE) {
		$('#pension').html("₪ "+(all / 200).toFixed(0));
	} else {
		console.log("female");
		$('#pension').html("₪ "+(all / 220).toFixed(0));
	}
}