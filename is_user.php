<?php
	// 引入文件
	require 'config.php';
	
	$query = mysql_query("SELECT user FROM user2 WHERE user='{$_POST['user']}'") or die('SQL 错误！');
	
	//判断是否有值，有则返回false
	if (mysql_fetch_array($query, MYSQL_ASSOC)) {
		echo 'false';
	} else {
		echo 'true';
	}
	
	mysql_close();
?>