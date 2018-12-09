<?php
	require 'config.php';
	sleep(3);
	$_pass = sha1($_POST['logpassword']);
	
	$query = mysql_query("SELECT user,password FROM user2 WHERE user='{$_POST['loguser']}' AND password='{$_pass}'") or die('SQL 错误！');
	
	if (mysql_fetch_array($query, MYSQL_ASSOC)) {
		echo 'true';
	} else {
		echo 'false';
	}
	
	mysql_close();
?>