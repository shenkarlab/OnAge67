<?php
	require("includes/config.php");
	
	// get relevant fields values
	$pension = $_POST['result'];
	$gender = $_POST['gender'];
	$duration = $_POST['duration'];
	$salary = $_POST['salary'];
	$pens_perc = $_POST['pens_perc'];
	$emp_perc = $_POST['emp_perc'];
	$mng_mon = $_POST['mng_mon'];
	$mng_year = $_POST['mng_year'];
	
	$query = "INSERT INTO `tbl_pensions_lab_13` 
	(`duration`,`gender`,`salary`,`pension`,`pens_percentage`,`pens_percentage_emp`,`mng_percentage_mon`,`mng_percentage_year`) 
	VALUES (".$duration.",'".$gender."',".$salary.",".$pension.",".$pens_perc.",".$emp_perc.",".$mng_mon.",".$mng_year.")";
		
	echo $query;
	try {
		$stmt = $db->prepare($query); 
		$result = $stmt->execute(); 
		return $stmt;
	} catch(PDOException $ex){ die("Failed to run query: " . $ex->getMessage()); } 
	
	/*header("Content-Type: application/json", true);

	// get relevant fields values
	$pension = $_POST['result'];
	$gender = $_POST['gender'];
	$duration = $_POST['duration'];
	$salary = $_POST['salary'];
	$pens_perc = $_POST['pens_perc'];
	$emp_perc = $_POST['emp_perc'];
	$mng_mon = $_POST['mng_mon'];
	$mng_year = $_POST['mng_year'];
	
	// db connection
	$dbhost = "166.62.8.11";
	$dbuser = "auxstudDB5";
	$dbpass = "auxstud5DB1!";
	$dbname = "auxstudDB5";
	$connection = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);
	
	// testing connection success
	if(mysqli_connect_errno()) {
		die("DB connection failed: " . mysqli_connect_error() . " (" . mysqli_connect_errno() . ")");
	}
	
	// insert query
	$query = "INSERT INTO `tbl_pensions_lab_13` 
	(`duration`,`gender`,`salary`,`pension`,`pens_percentage`,`pens_percentage_emp`,`mng_percentage_mon`,`mng_percentage_year`) 
	VALUES (".$duration.",'".$gender."',".$salary.",".$pension.",".$pens_perc.",".$emp_perc.",".$mng_mon.",".$mng_year.")";
	
	echo $query;
	
	// run insert query
	if ($conn->query($sql) === FALSE) {
		echo "Error: " . $sql . "<br>" . $conn->error;
	}
	$conn->close();*/

?>