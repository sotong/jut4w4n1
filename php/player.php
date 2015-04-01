<?php
//link to get direct link
$link = 'https://picasaweb.google.com/105294099280148125867/7?authkey=Gv1sRgCKSHydqmt6DP4wE#6130100015666686642?feat=directlink';
function picasa_direct($link) {
//get picasa page by default file_get_contents function
$data = file_get_contents($link);
$a = explode('"media":{"content":[', $data);
$a = explode('],"', $a[1]);
$datar = explode('},', $a[0]);
foreach ($datar as $key => $value) {
$value = str_replace("}}", "}", $value . "}");
$mp4s[] = json_decode($value, true);
}
$js = $bt = '';
for ($i = 1; $i < count($mp4s); $i++) {
$mp4 = $mp4s[$i];
$js .= $mp4['height'] . '<br><embed src="http://jut4w4n1.googlecode.com/svn/trunk/player.swf?&file=' . urlencode($mp4['url']) . '&type=video" allowfullscreen="true" allowscriptaccess="always" width="400px" height="300px"/><br>';
}
return $js;
}
//echo all link
echo picasa_direct($link);
?>