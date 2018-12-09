<?php
	sleep(1);
	require 'config.php';
	
	//1. 获取页面有多少条	
	$_sql = mysql_query("SELECT COUNT(*) AS count FROM comment WHERE titleid='{$_POST['titleid']}'");
	$_result = mysql_fetch_array($_sql, MYSQL_ASSOC);
	
	$_pagesize = 2;  //每个页面显示3条
	$_count = ceil($_result['count'] / $_pagesize);  //判断类似半页，则取证显示
	$_page = 1;
	if (!isset($_POST['page'])) {
		$_page = 1;  //不存在，第一页
	} else {
		$_page = $_POST['page'];  //第几页
		if ($_page > $_count) {
			$_page = $_count;  //没有数据最后永远为最后一页
		}
	}
	
	$_limit = ($_page - 1) * $_pagesize;  //判断当前页开始为第几条

	$query = mysql_query("SELECT ({$_count}) AS count,titleid,comment,user,date FROM comment 
	WHERE titleid='{$_POST['titleid']}' ORDER BY date DESC LIMIT {$_limit},{$_pagesize}") or die('SQL 错误！');
	
	$json = '';
	
	while (!!$row = mysql_fetch_array($query, MYSQL_ASSOC)) {
		foreach ( $row as $key => $value ) {
			$row[$key] = urlencode(str_replace("\n","", $value));
		}
		$json .= urldecode(json_encode($row)).',';
	}
	
	echo '['.substr($json, 0, strlen($json) - 1).']';
	
	mysql_close();
?>