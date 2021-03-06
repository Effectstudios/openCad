<?php

$iniContents = parse_ini_file("../properties/config.ini", true); //Gather from config.ini file
$connectionsFileLocation = $_SERVER["DOCUMENT_ROOT"]."/openCad/".$iniContents['main']['connection_file_location'];

require($connectionsFileLocation);

if (isset($_POST['clearCall']))
{
    storeCall();
}
if (isset($_POST['newCall']))
{
    newCall();
}

if (isset($_GET['term'])) {
    $data = array();

    $term = $_GET['term'];
    //echo json_encode($term);
    $link = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
	
    if (!$link) { 
        die('Could not connect: ' .mysql_error());
    }
    
    $query = "SELECT * from streets WHERE name LIKE \"%$term%\"";

    $result=mysqli_query($link, $query);
    
    while($row = $result->fetch_assoc())
    {
        $data[] = $row['name'];        
    }

    echo json_encode($data);


}

function storeCall()
{
    $callId = $_POST['callId']; 

    $link = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
    
    if (!$link) {
        die('Could not connect: ' .mysql_error());
    }
    
    $query = "INSERT INTO call_history SELECT calls.* FROM calls WHERE call_id = ?";
        
    try {
        $stmt = mysqli_prepare($link, $query);
        mysqli_stmt_bind_param($stmt, "i", $callId);
        $result = mysqli_stmt_execute($stmt);
        
        if ($result == FALSE) {
            die(mysqli_error($link));
        }
    }
    catch (Exception $e)
    {
        die("Failed to run query: " . $e->getMessage());
    }
    
    clearCall();
}

function clearCall()
{
    $callId = $_POST['callId']; 

    $link = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
	
    if (!$link) {
        die('Could not connect: ' .mysql_error());
    }

    //First delete from calls list
    $query = "DELETE FROM calls WHERE call_id = ?";
        
    try {
        $stmt = mysqli_prepare($link, $query);
        mysqli_stmt_bind_param($stmt, "i", $callId);
        $result = mysqli_stmt_execute($stmt);
        
        if ($result == FALSE) {
            die(mysqli_error($link));
        }
    }
    catch (Exception $e)
    {
        die("Failed to run query: " . $e->getMessage());
    }

    //Get units that were on the call
    $query = "SELECT identifier FROM calls_users WHERE call_id = \"$callId\"";
        
    $result=mysqli_query($link, $query);
	
	while($row = mysqli_fetch_array($result, MYSQLI_BOTH))
	{
		clearUnitFromCall($callId, $row[0]);
	}

}

function clearUnitFromCall($callId, $unit)
{
    $link = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
	
    if (!$link) {
        die('Could not connect: ' .mysql_error());
    }

    //First delete from calls list
    $query = "DELETE FROM calls_users WHERE call_id = ? AND identifier = ?";
        
    try {
        $stmt = mysqli_prepare($link, $query);
        mysqli_stmt_bind_param($stmt, "is", $callId, $unit);
        $result = mysqli_stmt_execute($stmt);
        
        if ($result == FALSE) {
            die(mysqli_error($link));
        } 
        
        freeUnitStatus($unit);
    }
    catch (Exception $e)
    {
        die("Failed to run query: " . $e->getMessage());
    }
}

function freeUnitStatus($unit)
{
    $link = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
	
    if (!$link) {
        die('Could not connect: ' .mysql_error());
    }

    $sql = "UPDATE active_users SET status = '1', status_detail = '1' WHERE active_users.callsign = ?";

    try {
        $stmt = mysqli_prepare($link, $sql);
        mysqli_stmt_bind_param($stmt, "s", $unit);
        $result = mysqli_stmt_execute($stmt);
    
        if ($result == FALSE) {
            die(mysqli_error($link));
        }
    }
    catch (Exception $e)
    {
        die("Failed to run query: " . $e->getMessage()); //TODO: A function to send me an email when this occurs should be made
    }
}

function newCall()
{
    //echo var_dump($_POST);
    //Need to explode the details by &
    $details = $_POST['details'];
    $detailsArr = explode("&", $details);

    //Now, each item in the details array needs to be exploded by = to get the value
    $call_type = explode("=", $detailsArr[0])[1];
    $street1 = str_replace('+',' ', explode("=", $detailsArr[1])[1]);
    $street2 = str_replace('+',' ', explode("=", $detailsArr[2])[1]);
    $street3 = str_replace('+',' ', explode("=", $detailsArr[3])[1]);
    $unit1 = str_replace('+',' ', explode("=", $detailsArr[4])[1]);
    $unit2 = str_replace('+',' ', explode("=", $detailsArr[5])[1]);
    $narrative = str_replace('+',' ', explode("=", $detailsArr[6])[1]);

    $created = date("Y-m-d H:i:s").': Call Created<br/>';
    if ($narrative == "")
    {
        $narrative = $created;
    }
    else
    {
        $narrative = $created.date("Y-m-d H:i:s").': '.$narrative.'<br/>';
    }
    
    

    $link = mysqli_connect(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

	if (!$link) {
		die('Could not connect: ' .mysql_error());
	}

    $sql = "INSERT INTO calls (call_primary, call_type, call_street1, call_street2, call_street3, call_notes) VALUES (?, ?, ?, ?, ?, ?)";

	try {
		$stmt = mysqli_prepare($link, $sql);
		mysqli_stmt_bind_param($stmt, "ssssss", $unit1, $call_type, $street1, $street2, $street3, $narrative);
		$result = mysqli_stmt_execute($stmt);

        //Get the ID of the new call to assign units to it
        $last_id = mysqli_insert_id($link);
		
		if ($result == FALSE) {
			die(mysqli_error($link));
		}
	}
	catch (Exception $e)
	{
		die("Failed to run query: " . $e->getMessage()); //TODO: A function to send me an email when this occurs should be made
	}

    //Add the units into the calls_users table
    if ($unit1 == "")
    { /*Do nothing*/ }
    else
    {
        $sql = "INSERT INTO calls_users (call_id, identifier) VALUES (?, ?)";

        try {
            $stmt = mysqli_prepare($link, $sql);
            mysqli_stmt_bind_param($stmt, "is", $last_id, $unit1);
            $result = mysqli_stmt_execute($stmt);
		
            if ($result == FALSE) {
                die(mysqli_error($link));
            }
        }
        catch (Exception $e)
        {
            die("Failed to run query: " . $e->getMessage()); //TODO: A function to send me an email when this occurs should be made
        }

        //Now we need to modify the assigned user's status'
        $sql = "UPDATE active_users SET status = '0', status_detail = '3' WHERE active_users.callsign = ?";

        try {
            $stmt = mysqli_prepare($link, $sql);
            mysqli_stmt_bind_param($stmt, "s", $unit1);
            $result = mysqli_stmt_execute($stmt);
		
            if ($result == FALSE) {
                die(mysqli_error($link));
            }
        }
        catch (Exception $e)
        {
            die("Failed to run query: " . $e->getMessage()); //TODO: A function to send me an email when this occurs should be made
        }

        //Now we'll add data to the call log for unit history
        $narrativeAdd = date("Y-m-d H:i:s").': Dispatched: '.$unit1.'<br/>';

        $sql = "UPDATE calls SET call_notes = concat(call_notes, ?) WHERE call_id = ?";

        try {
            $stmt = mysqli_prepare($link, $sql);
            mysqli_stmt_bind_param($stmt, "si", $narrativeAdd, $last_id);
            $result = mysqli_stmt_execute($stmt);
		
            if ($result == FALSE) {
                die(mysqli_error($link));
            }
        }
        catch (Exception $e)
        {
            die("Failed to run query: " . $e->getMessage()); //TODO: A function to send me an email when this occurs should be made
        }
    }

    //Add the units into the calls_users table
    if ($unit2 == "")
    { /*Do nothing*/ }
    else
    {
        $sql = "INSERT INTO calls_users (call_id, identifier) VALUES (?, ?)";

        try {
            $stmt = mysqli_prepare($link, $sql);
            mysqli_stmt_bind_param($stmt, "is", $last_id, $unit2);
            $result = mysqli_stmt_execute($stmt);
		
            if ($result == FALSE) {
                die(mysqli_error($link));
            }
        }
        catch (Exception $e)
        {
            die("Failed to run query: " . $e->getMessage()); //TODO: A function to send me an email when this occurs should be made
        }

        //Now we need to modify the assigned user's status'
        $sql = "UPDATE active_users SET status = '0', status_detail = '3' WHERE active_users.callsign = ?";

        try {
            $stmt = mysqli_prepare($link, $sql);
            mysqli_stmt_bind_param($stmt, "s", $unit2);
            $result = mysqli_stmt_execute($stmt);
		
            if ($result == FALSE) {
                die(mysqli_error($link));
            }
        }
        catch (Exception $e)
        {
            die("Failed to run query: " . $e->getMessage()); //TODO: A function to send me an email when this occurs should be made
        }

        //Now we'll add data to the call log for unit history
        $narrativeAdd = date("Y-m-d H:i:s").': Dispatched: '.$unit2.'<br/>';

        $sql = "UPDATE calls SET call_notes = concat(call_notes, ?) WHERE call_id = ?";

        try {
            $stmt = mysqli_prepare($link, $sql);
            mysqli_stmt_bind_param($stmt, "si", $narrativeAdd, $last_id);
            $result = mysqli_stmt_execute($stmt);
		
            if ($result == FALSE) {
                die(mysqli_error($link));
            }
        }
        catch (Exception $e)
        {
            die("Failed to run query: " . $e->getMessage()); //TODO: A function to send me an email when this occurs should be made
        }
    }

    



	mysqli_close($link);

    echo "SUCCESS";

}
?>