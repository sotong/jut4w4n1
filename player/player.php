<?php
//link to get direct link
$link = 'https://picasaweb.google.com/118161793247253029944/Av295?authkey=Gv1sRgCImqsp2Htry-tQE#6018830302672051042?feat=directlink';
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