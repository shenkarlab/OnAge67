<?php
	require ("../includes/config.php");
		
	$query = "SELECT pens_percentage, COUNT(*) AS 'num' FROM tbl_pensions_lab_13 GROUP BY pens_percentage";
	
	if(isset($_GET["filter"])) {
		$filter = $_GET["filter"];
		if($filter == "emp") {
			$query = "SELECT pens_percentage_emp, COUNT(*) AS 'num' FROM tbl_pensions_lab_13 GROUP BY pens_percentage_emp";	
		} else if($filter == "mon") {
			$query = "SELECT mng_percentage_mon, COUNT(*) AS 'num' FROM tbl_pensions_lab_13 GROUP BY mng_percentage_mon";	
		} else if($filter == "year") {
			$query = "SELECT mng_percentage_year, COUNT(*) AS 'num' FROM tbl_pensions_lab_13 GROUP BY mng_percentage_year";	
		} 
	}
	
	$rs = $db -> query($query);
	$data = array();
	while ($row = $rs -> fetch()) {
		$data[] = $row;
	}
	echo json_encode($data);
?>