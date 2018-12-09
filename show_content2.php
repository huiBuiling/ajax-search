<?php
	require 'config.php';

	//取到title值并且分割为数组
	$result=mysql_query('select title from question');
	while($row=mysql_fetch_assoc($result)){
	     $arr[]=$row['title'];
	}
	echo implode(',',$arr);
	
	mysql_close();
?>